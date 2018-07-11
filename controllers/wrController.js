const bodyParser = require('body-parser');
const urlencodeParser = bodyParser.urlencoded({extended: false});

module.exports = function(app, db) {

  app.get('/', function (req, res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err, results) => {
      if (err) throw err;
      console.log(results);
      res.render('homepage', {websites: results});
      console.log('Everything is fine.');
    })
  });

  app.get('/website/:id', function (req, res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err, results) => { //First database query
      if (err) throw err;
      console.log(results[req.params.id].title); //Logs title of website with :id
      //turns title into table name: Replaces all spaces with underscores and adds '_reviews' to the end.
      var table = results[req.params.id].title.split(' ').join('_') + '_reviews';
      var sql2 =  `SELECT * FROM ${table};`;
      db.query(sql2, (err, results2) => { //Second database query (Within first query)
        console.log(results2);
        res.render('website', {reviews: results2, website: results, id: req.params.id}); //Renders page (finally)
      })
    })
  });

  app.get('/add-new-site', function (req,res) {
    res.render('addWebsite');
  });
  app.post('/add-new-site', urlencodeParser, function (req, res) {
    var item = req.body;
    var tableName = item.title.split(' ').join('_') + '_reviews';
    var sql = `INSERT INTO websites (title,description,link) ` +
      `VALUES ("${item.title}","${item.description}","${item.link}"); ` +
      `CREATE TABLE ${tableName} ` +
      `(id int AUTO_INCREMENT NOT NULL, rating int, title varchar(255), review text, PRIMARY_KEY(id));`
    console.log(item);
    console.log(tableName);
    console.log(sql);
    })

}
