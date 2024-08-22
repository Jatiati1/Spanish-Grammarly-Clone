const { Pool } = require('pg');  // Importing the Pool class from the pg module

const pool = new Pool({
  user: 'postgres',
  host: 'database-2.cdg44e46ckj0.us-east-1.rds.amazonaws.com',  // Your database endpoint
  database: 'postgres',
  password: 'Jool2424ati',  // Your database password
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;  // Exporting the pool object to be used in other files
