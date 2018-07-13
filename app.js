const express = require('express');
const app = express();
const wrController = require('./controllers/wrController');
const mysql = require('mysql');
const myDatabase = require('./db');

// setting temlating engling
app.set('view engine', 'ejs');

// static file managment
app.use(express.static('./public'));

wrController(app, myDatabase(mysql));

app.listen(3000);
console.log('You are listening to port 3000');
