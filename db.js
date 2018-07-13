module.exports = function (mysql) {

  //Database connection
  const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '140966',
    database : 'garfelo'
  });

  db.connect(function (err) {
    if (err) throw err;
    console.log('MySql is connected');
  });

  return db;
}
