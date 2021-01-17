'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
// const client = new pg.Client(process.env.DATABASE_URL);


// app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// client.on('error', err => {
//   throw err;
// });

app.get('/', (req, res) => res.status(200).send('Hello Folks'));

app.get('/hello', (req, res) => res.render('pages/index'));


app.get('*', (req, res) => res.status(404).send('Not found'));

app.listen(PORT, () => console.log(`Port => ${PORT}`));
