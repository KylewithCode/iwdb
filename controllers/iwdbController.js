const bodyParser = require('body-parser');
const urlencodeParser = bodyParser.urlencoded({extended: false});

function fixSqlQuotes(str) {
  return str.toString().split('\"').join('\"\"');
}
// function tableify(str) {
//   str = str.toString().split(' ').join('_');
//   return str.toString().split('\'').join('_') + '_reviews';
// }

function deUnderscore(str) {
  return str.toString().split('_').join(' ');
}

module.exports = function(app, db, passport) {

  // HOMEPAGE
  app.get('/', function(req, res) {
    var sql = 'SELECT * FROM websites;'
    db.query(sql, (err, results) => {
      if (err) throw err;

      if (req.query.loggedout === 'true') var message = 'Logged out successfully.';
      else var message = null;

      res.render('homepage', {websites: results, user: req.user, message: message});
      console.log('Everything is fine.');
    })
  });

  // display sign up
  app.get('/signup', function(req, res) {
    if (req.query.failed === 'true') var message = ['Something went wrong with your signup.', 'Your username or email may have already been taken.'];
    else var message = null;
    res.render('signup', {message: message});
  });

  // handling sign up form
  app.post('/signup', passport.authenticate('local-signup',  {
     successRedirect: '/',
     failureRedirect: '/signup?failed=' + true}
    )
  );

  // displaying sign in
  app.get('/signin', function(req,res){
  	res.render('signin', { message: req.flash('loginMessage') } );
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
    var loggedout = true;
    res.redirect('/?loggedout=' + loggedout);
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

      // var table = tableify(results[req.params.id].title);
      // console.log(table);
      // var sql2 =  `SELECT * FROM ${table};`;

      var table = 'reviews';
      console.log(table);
      var sql2 =  `SELECT * FROM reviews WHERE websiteID=${results[req.params.id].id}`;

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
    // var table = tableify(item.title);
    var title = fixSqlQuotes(item.title);
    var description = fixSqlQuotes(item.description);
    var link = fixSqlQuotes(item.link);

    var sql1 = `INSERT INTO websites (title,description,link) ` +
      `VALUES ("${title}","${description}","${link}");`
    // var sql2 = `CREATE TABLE ${table} ` +
    //   `(id int AUTO_INCREMENT NOT NULL, rating int, title varchar(255), review text, malicious varchar(3), originalPoster varchar(255), PRIMARY KEY(id));`
    // console.log(sql1);
    // console.log(sql2);

    db.query(sql1, (err, results) => {
      if (err) throw err;
      // db.query(sql2, (err, results) => {
      //   if (err) throw err;
      //   console.log(results);
      //   res.json(results);
      // })
      res.json(results);
    })
  });
  app.post('/search', function(req, res) {
    console.log(req.body);
    var sql = `SELECT * From websites WHERE link = "${req.body.search}" OR title = "${req.body.search}";`
    db.query(sql, (err, results) => {
      if (err) throw (err);
      console.log(results);
      res.render('homepage', {websites: results, user: req.user, message: null});
    })
  })
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
    var sql2 = `DELETE FROM reviews WHERE websiteID=${req.params.id}`
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

    //Get website ID
    var getSiteId = `SELECT id FROM websites WHERE title="${deUnderscore(req.params.title)}";`
    db.query(getSiteId, (err, getIdResults) => {
      if (err) throw err;
      var siteId = getIdResults[0].id

      //Create SQL command
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
      fields += `,malicious, originalPoster, websiteID)`
      values += `,"${item.malicious}", "${req.user.id}", "${siteId}")`

      var sql = `INSERT INTO reviews ${fields} VALUES ${values};`
      console.log(sql);

      db.query(sql, (err,results) => {
        if (err) throw err;
        res.json(results);
      })
    });
  });

  app.delete('/delete-review/:title/:id', isLoggedIn, function (req,res) {
    var sql = `DELETE FROM reviews WHERE id=${req.params.id};`
    console.log(sql);
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    })
  });

  app.post('/edit-review/:title/:id', isLoggedIn, urlencodeParser, function (req,res) {
    var item = req.body;
    sql = `UPDATE reviews SET rating=${item.rating}, title="${item.title}", review="${item.review}" ` +
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
