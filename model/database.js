const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost', //localhost
  user: 'root', // username sa mySQL
  password: 'admin', // password sa mySQL
  database: 'gasstation_db', // si schema/database
  waitForConnections: true,
});

module.exports = pool;