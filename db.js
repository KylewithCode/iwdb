module.exports = function (mysql) {

  //Database connection
  const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'irsc',
    database : 'garfelo'
  });

  db.connect(function (err) {
    if (err) throw err;
    console.log('MySql is connected');
  });

  return db;
}
