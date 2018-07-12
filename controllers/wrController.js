const bodyParser = require('body-parser');
const urlencodeParser = bodyParser.urlencoded({extended: false});

function fixSqlQuotes(str) {
  return str.toString().split('\"').join('\"\"');
}
function tableify(str) {
  return str.toString().split(' ').join('_') + '_reviews';
}

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
      var table = tableify(results[req.params.id].title);
      var sql2 =  `SELECT * FROM ${table};`;
      db.query(sql2, (err, results2) => { //Second database query (Within first query)
        console.log(results2);

        // Calculate average review score
        var total = 0;
        var amountOfRatings = 0
        for (var i = 0; i < results2.length; i++) {
          if (results2[i].rating !== null) {
            total += results2[i].rating;
            amountOfRatings++;
          }
        }
        var averageRating = total/amountOfRatings;

        res.render('website', {reviews: results2, website: results, id: req.params.id, average: averageRating}); //Renders page (finally)
      })
    })
  });

  app.get('/add-new-site', function (req,res) {
    res.render('addWebsite');
  });
  app.post('/add-new-site', urlencodeParser, function (req, res) {

    var item = req.body;
    var table = tableify(item.title);
    var title = fixSqlQuotes(item.title);
    var description = fixSqlQuotes(item.description);
    var link = fixSqlQuotes(item.link);

    var sql1 = `INSERT INTO websites (title,description,link) ` +
      `VALUES ("${title}","${description}","${link}");`
    var sql2 = `CREATE TABLE ${table} ` +
      `(id int AUTO_INCREMENT NOT NULL, rating int, title varchar(255), review text, PRIMARY KEY(id));`
    console.log(sql1);
    console.log(sql2);

    db.query(sql1, (err, results) => {
      if (err) throw err;
      db.query(sql2, (err, results) => {
        if (err) throw err;
        console.log(results);
        res.json(results);
      })
    })
  });

  app.get('/remove-site', function (req,res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err, results) => {
      if (err) throw err;
      console.log(results);
      res.render('removeWebsite', {websites: results});
      console.log('Everything is fine.');
    })
  });
  app.delete('/remove-site/:table/:id', function (req,res) {
    var sql1 = `DELETE FROM websites WHERE id=${req.params.id}`
    var sql2 = `DROP TABLE ${req.params.table}`
    db.query(sql1, (err, results) => {
      if (err) throw err;
      db.query(sql2, (err, results) => {
        if (err) throw err;
        res.json(results);
      })
    })
  })

  app.get('/add-review/:title', function (req,res) {
    res.render('addReview', {title: req.params.title});
  });
  app.post('/add-review/:title', urlencodeParser, function (req,res) {
    if (true) { //Create SQL command
      var item = req.body;
      var fields = `(title`;
      var values = `("${fixSqlQuotes(item.title)}"`;
      if (item.rating != "") {
        fields += `,rating`
        values += `,${item.rating}`
      } if (item.review != "") {
        fields += `,review`
        values += `,"${fixSqlQuotes(item.review)}"`
      }
      fields += `)`
      values += `)`

      var sql = `INSERT INTO ${tableify(req.params.title)} ${fields} VALUES ${values};`
      console.log(sql);
    }
    db.query(sql, (err,results) => {
      if (err) throw err;
      res.json(results);
    })
  });

  app.delete('/delete-review/:title/:id', function (req,res) {
    var sql = `DELETE FROM ${tableify(req.params.title)} WHERE id=${req.params.id};`
    console.log(sql);
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    })
  });

  app.post('/edit-review/:title/:id', urlencodeParser, function (req,res) {
    var item = req.body;
    var tableName = tableify(req.params.title);
    sql = `UPDATE ${tableName} SET rating=${item.rating}, title="${item.title}", review="${item.review}" ` +
      `WHERE id=${req.params.id};`;
    db.query(sql, (err,results) => {
      if (err) throw err;
      res.json(results);
    })
  });

}
