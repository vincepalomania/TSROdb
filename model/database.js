const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost', //localhost
  user: 'root', // username sa mySQL
  password: 'Abcd@123', // password sa mySQL
  database: 'adv.database', // si schema/database
  waitForConnections: true,
});

module.exports = pool;