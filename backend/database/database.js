const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.pool = null;
  }

  async init() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 Initializing database connection... (Attempt ${retryCount + 1}/${maxRetries})`);
        console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        
        // Create connection pool
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          },
          max: 10, // Reduced from 20 to avoid Supabase limits
          idleTimeoutMillis: 10000, // Reduced from 30s to 10s
          connectionTimeoutMillis: 10000, // Increased to 10s
          acquireTimeoutMillis: 15000, // Increased to 15s
          allowExitOnIdle: true, // Allow pool to close when idle
        });

        console.log('📊 Connection pool created');

        // Test connection with timeout
        const client = await Promise.race([
          this.pool.connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 15000)
          )
        ]);
        
        console.log('✅ Connected to Supabase PostgreSQL database');
        
        // Get database info
        const dbInfo = await client.query('SELECT version()');
        console.log('🗄️  Database version:', dbInfo.rows[0].version.split(' ')[0]);
        
        client.release();
        console.log('🔓 Database client released');

        // Create tables if they don't exist
        await this.createTables();
        
        console.log('🎉 Database initialization completed successfully');
        return; // Success, exit retry loop
        
      } catch (error) {
        retryCount++;
        console.error(`❌ Database connection error (Attempt ${retryCount}/${maxRetries}):`, error.message);
        console.error('🔍 Error details:', {
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        
        if (retryCount >= maxRetries) {
          console.error('💥 Max retries reached. Database connection failed.');
          throw new Error(`Database connection failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  async createTables() {
    const client = await this.pool.connect();
    
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          address TEXT NOT NULL,
          password VARCHAR(255) NOT NULL,
          is_email_verified BOOLEAN DEFAULT FALSE,
          otp VARCHAR(6),
          otp_expiry TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);

      // Create OTP verification table
      await client.query(`
        CREATE TABLE IF NOT EXISTS otp_verification (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(6) NOT NULL,
          type VARCHAR(50) NOT NULL,
          expiry TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_otp_email_type ON otp_verification(email, type)
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_otp_expiry ON otp_verification(expiry)
      `);

      console.log('✅ Database tables created/verified');
      
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // User operations
  async createUser(userData) {
    const client = await this.pool.connect();
    try {
      const { name, email, mobile_number, address, password } = userData;
      const hashedPassword = bcrypt.hashSync(password, 12);

      const result = await client.query(
        `INSERT INTO users (name, email, mobile_number, address, password)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, email, mobile_number, address, hashedPassword]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Database query error in createUser:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Database query error in getUserByEmail:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserById(id) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateUserLastLogin(id) {
    const client = await this.pool.connect();
    try {
      await client.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    } finally {
      client.release();
    }
  }

  async updateEmailVerification(email) {
    const client = await this.pool.connect();
    try {
      await client.query(
        'UPDATE users SET is_email_verified = TRUE WHERE email = $1',
        [email]
      );
    } finally {
      client.release();
    }
  }

  async updatePassword(email, newPassword) {
    const client = await this.pool.connect();
    try {
      const hashedPassword = bcrypt.hashSync(newPassword, 12);
      await client.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
    } finally {
      client.release();
    }
  }

  // OTP operations
  async createOTP(email, otp, type) {
    const client = await this.pool.connect();
    try {
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      const result = await client.query(
        `INSERT INTO otp_verification (email, otp, type, expiry)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [email, otp, type, expiry]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async verifyOTP(email, otp, type) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM otp_verification 
         WHERE email = $1 AND otp = $2 AND type = $3 AND used = FALSE AND expiry > CURRENT_TIMESTAMP
         ORDER BY created_at DESC LIMIT 1`,
        [email, otp, type]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async markOTPAsUsed(email, otp, type) {
    const client = await this.pool.connect();
    try {
      await client.query(
        `UPDATE otp_verification 
         SET used = TRUE 
         WHERE email = $1 AND otp = $2 AND type = $3`,
        [email, otp, type]
      );
    } finally {
      client.release();
    }
  }

  async cleanupExpiredOTPs() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM otp_verification WHERE expiry < CURRENT_TIMESTAMP'
      );
      return result.rowCount;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection pool closed');
    }
  }
}

module.exports = new Database();
