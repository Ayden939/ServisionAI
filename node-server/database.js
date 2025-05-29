const mysql = require("mysql2");

const db = mysql.createPool({
  host: "mariadb",
  user: "root",
  password: "rootpassword",
  database: "mydb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.on('error', function (err) {
  console.error('Database error:', err);
});

const queryDatabase = (query, params, callback) => {
  db.execute(query, params, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


module.exports = queryDatabase;
