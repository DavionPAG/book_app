'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const { search } = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

// Create my database connection
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', getAllBooks);
app.get('/new', (req, res) => res.render('searches/new'));
app.post('/show', searchHandler);
app.get('/show/:id', getOneBook);
app.post('/books', addBook);

function addBook(req, res) {
  console.log('Request Body ===> ', req.body);

  const SQL = 'INSERT INTO books (author, title, image_url, description, isbn, bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id';
  const vals = [req.body.author, req.body.title, req.body.img, req.body.description, req.body.isbn, req.body.bookshelf];

  console.log(vals);

  client.query(SQL, vals)
    .then(data => {
      console.log(data);
      console.log(data.rows);
      res.status(200).redirect(`/show/${data.rows[0].id}`);
    });
}

// Function handlers
function getAllBooks(req, res) {
  const SQL = 'SELECT * FROM books;';
  return client.query(SQL)
    .then(results => {
      res.render('pages/index', { data: results.rows });
    });
}

function getOneBook(req, res) {
  let SQL = 'SELECT * FROM books where id=$1';
  let q = [req.params.id];

  client.query(SQL, q)
    .then(data => {
      res.status(200).render('pages/books/show', { data: data.rows[0] });
    });
}

function searchHandler(req, res) {
  let key = process.env.GOOGLE_API_KEY;
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;

  if (req.body.select[1] === 'title') {
    url += 'intitle:' + req.body.select[0];
  }
  else if (req.body.select[1] === 'author') {
    url += 'inauthor:' + req.body.select[0];
  }

  superagent.get(url)
    .set('key', key)
    .then(data => {
      let bookArr = data.body.items.map(book => {
        return new Search(book);
      });
      res.render('searches/show', { books: bookArr });
    })
    .catch(error => {
      res.status(500).render('pages/error');
      console.log(error);
    });
}

function Search(data) {
  this.img_url = data.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = data.volumeInfo.title;
  this.authors = data.volumeInfo.authors || 'Unknown';
  this.desc = data.volumeInfo.description || 'A good read';
  this.bookshelf = data.volumeInfo.categories || 'Not specified';
  this.isbn = data.volumeInfo.industryIdentifiers ? data.volumeInfo.industryIdentifiers[0].identifier : 'No ISBN';
}

app.get('*', (req, res) => res.status(404).json('Not found'));

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`PORT => ${PORT}`);
      console.log(`DB => ${client.connectionParameters.database}`);
    });
  });
