const bodyParser = require('body-parser');
const urlencodeParser = bodyParser.urlencoded({extended: false});

function fixSqlQuotes(str) {
  return str.toString().split('\"').join('\"\"');
}
function tableify(str) {
  str = str.toString().split(' ').join('_');
  return str.toString().split('\'').join('_') + '_reviews';
}

module.exports = function(app, db, passport) {

  // HOMEPAGE
  app.get('/', function(req, res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err, results) => {
      if (err) throw err;
      // console.log(results);
      res.render('homepage', {websites: results, user: req.user});
      console.log('Everything is fine.');
    })
  });

  // display sign up
  app.get('/signup', function(req, res) {
    res.render('signup');
  });

  // handling sign up form
  app.post('/signup', passport.authenticate('local-signup',  {
     successRedirect: '/',
     failureRedirect: '/signup'}
    )
  );

  // displaying sign in
  app.get('/signin', function(req,res){
  	res.render('signin',  { message: req.flash('loginMessage') } );
  });

  // handling sign in form
  app.post('/signin', passport.authenticate('local-signin',  {
     successRedirect: '/',
     failureRedirect: '/signin'}
    )
  );

  // destorying sessions
  app.get('/logout', function(req,res) {
    req.session.destroy(function(err) {
    res.redirect('/signin');
    })
  });

  /**************************
    Brought in from Garfelo
  **************************/

  app.get('/website/:id', function (req, res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err, results) => { //First database query
      if (err) throw err;
      console.log(results[req.params.id].title); //Logs title of website with :id
      //turns title into table name: Replaces all spaces with underscores and adds '_reviews' to the end.
      var table = tableify(results[req.params.id].title);
      console.log(table);
      var sql2 =  `SELECT * FROM ${table};`;
      console.log(sql2);
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
        averageRating = Math.round(averageRating * 100) / 100
        if (averageRating < 4) var status = 'Low Rating';
        else if (averageRating < 7) var status = 'Mixed Rating';
        else var status = 'High Rating'

        // Percentage of people who said website was malicious
        var totalMalicious = 0;
        for (var i = 0; i < results2.length; i++) {
          if (results2[i].malicious === 'yes') totalMalicious++;
        }

        var maliciousPercent = (100 * totalMalicious) / results2.length;
        maliciousPercent = Math.round(maliciousPercent * 100) / 100
        console.log('user: ' + req.user);

        res.render('website', {
          reviews: results2,
          website: results,
          id: req.params.id,
          average: averageRating,
          status: status,
          maliciousPercent: maliciousPercent,
          user: req.user
        }); //Renders page (finally)
      })
    })
  });

  app.get('/add-new-site', isLoggedIn, function (req,res) {
    res.render('addWebsite', {user: req.user});
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
      `(id int AUTO_INCREMENT NOT NULL, rating int, title varchar(255), review text, malicious varchar(3), originalPoster varchar(255), PRIMARY KEY(id));`
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

  app.get('/remove-site', isLoggedIn, function (req,res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err, results) => {
      if (err) throw err;
      console.log(results);
      res.render('removeWebsite', {websites: results, user: req.user});
      console.log('Everything is fine.');
    })
  });
  app.delete('/remove-site/:title/:id', function (req,res) {
    var sql1 = `DELETE FROM websites WHERE id=${req.params.id}`
    var sql2 = `DROP TABLE ${tableify(req.params.title)}`
    db.query(sql1, (err, results) => {
      if (err) throw err;
      db.query(sql2, (err, results) => {
        if (err) throw err;
        res.json(results);
      })
    })
  })

  app.get('/add-review/:title', isLoggedIn, function (req,res) {
    res.render('addReview', {title: req.params.title, user: req.user});
  });
  app.post('/add-review/:title', isLoggedIn, urlencodeParser, function (req,res) {
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
      fields += `,malicious, originalPoster)`
      values += `,"${item.malicious}", "${req.user.username}")`

      var sql = `INSERT INTO ${tableify(req.params.title)} ${fields} VALUES ${values};`
      console.log(sql);
    }
    db.query(sql, (err,results) => {
      if (err) throw err;
      res.json(results);
    })
  });

  app.delete('/delete-review/:title/:id', isLoggedIn, function (req,res) {
    var sql = `DELETE FROM ${tableify(req.params.title)} WHERE id=${req.params.id};`
    console.log(sql);
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    })
  });

  app.post('/edit-review/:title/:id', isLoggedIn, urlencodeParser, function (req,res) {
    var item = req.body;
    var tableName = tableify(req.params.title);
    sql = `UPDATE ${tableName} SET rating=${item.rating}, title="${item.title}", review="${item.review}" ` +
      `WHERE id=${req.params.id};`;
    db.query(sql, (err,results) => {
      if (err) throw err;
      res.json(results);
    })
  });

  app.get('/edit-site/:id', isLoggedIn, function (req,res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err,results) => {
      if (err) throw err;
      res.render('editWebsite', {title: req.params.title, id: req.params.id, websites: results, user: req.user});
    })
  });
  app.post('/edit-site/:id', isLoggedIn, urlencodeParser, function (req,res) {
    item = req.body;
    var sql = `UPDATE websites SET link="${item.link}", description="${item.description}" WHERE id=${req.params.id};`;
    console.log(sql);
    db.query(sql, (err,results) => {
      if (err) throw err;
      res.json(results);
    })
  });

};
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/signin');
}
