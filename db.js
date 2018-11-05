const { Client, Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

module.exports = {

  getUser: async (username) => pool.query(`SELECT * FROM users where username=$1`, [username])

}
