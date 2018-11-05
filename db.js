const { Client, Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

module.exports = {

  getUser: async (username) => pool.query(`SELECT users.id, users.org_id, users.username, users.role, orgs.name org_name FROM users JOIN orgs ON users.org_id = orgs.id WHERE username=$1`, [username])

}
