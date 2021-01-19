'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
// const pg = require('pg');
const { search } = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;
// const client = new pg.Client(process.env.DATABASE_URL);

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.status(200).send('Hello Folks'));
app.get('/hello', (req, res) => res.render('pages/index'));
app.get('/new', (req, res) => res.render('searches/new'));
app.post('/show', searchHandler);


function searchHandler(req, res) {
  let key = process.env.GOOGLE_API_KEY;
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;

  console.log(req.body);

  if (req.body.select[1] === 'title') {
    url += 'intitle:' + req.body.select[0] + '&maxResults=10';
  }

  else if (req.body.select[1] === 'author') {
    url += 'inauthor:' + req.body.select[0] + '&maxResults=10';
  }

  superagent.get(url)
    .set('key', key)
    .then(data => {

      let bookArr = data.body.items.map(book => {
        return new Search(book);
      });
      // console.log(bookArr);
      res.render('searches/show', { books: bookArr });
    })
    .catch(error => {
      res.status(500).send('Muchas problemas');
      console.log(error);
    });

}

function Search(data) {
  this.img_url = data.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = data.volumeInfo.title;
  this.authors = data.volumeInfo.authors || 'Unknown';
  this.desc = data.volumeInfo.description || 'A good read';
}


app.get('*', (req, res) => res.status(404).json('Not found'));

app.listen(PORT, () => console.log(`Port => ${PORT}`));
