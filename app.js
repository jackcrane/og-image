const express = require('express');
const app = express();
const port = 80;
let ejs = require('ejs');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const mysql = require('mysql');
require('dotenv').config()

const toUnnamed = require('named-placeholders')();
const originalQuery = require('mysql/lib/Connection').prototype.query;

require('mysql/lib/Connection').prototype.query = function (...args) {
    if (Array.isArray(args[0]) || !args[1]) {
        return originalQuery.apply(this, args);
    }

    ([
        args[0],
        args[1]
    ] = toUnnamed(args[0], args[1]));

    return originalQuery.apply(this, args);
};

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: 'apps',
  password: process.env.DB_PASS,
  database: 'og-image'
})

connection.connect();

registerFont('./public/fonts/Atkinson-Regular.ttf', { family: 'atkinson' })
registerFont('./public/fonts/Menlo-Regular.ttf', { family: 'menlo' })

console.log('running')

app.set('view engine', 'ejs')
app.use(express.static('public'))

let count = 0;

app.get('/og/:title/:subtitle/:url/:protocol/:font/:image/:color/data.png', (req, res) => {
  // res.send(req.params);
  res.contentType('image/png');
  // res.send(tile);

  console.log(`${count}: {title: '${req.params.title}', subtitle: '${req.params.subtitle}', url: '${req.params.url}', image: '${req.params.image}', font: '${req.params.font}'}`)

  if(req.params.title == ' ') req.params.title = '';
  if(req.params.subtitle == ' ') req.params.subtitle = '';
  if(req.params.url == ' ') req.params.url = '';
  if(req.params.protocol == ' ') { req.params.protocol = '' } else { req.params.protocol += '://' };
  if(req.params.image == ' ') req.params.title = 'candybar';
  if(req.params.color == ' ') req.params.color = 'black';
  if(req.params.font == ' ') req.params.font = 'menlo';

  connection.query(`INSERT INTO uses (title, subtitle, protocol, url, font, color, background) VALUES (:title, :subtitle, :protocol, :url, :font, :color, :background)`, {
    title: req.params.title,
    subtitle: req.params.subtitle,
    protocol: req.params.protocol,
    url: req.params.url,
    font: req.params.font,
    color: req.params.color,
    background: req.params.background
  }, (err, result, fields) => {
    if(err) throw err;
  })

  const img_map = {
    candybar:'./public/backgrounds/candy-bar.jpg',
    cheerfulorange: './public/backgrounds/cheerful-orange.jpg',
    renownedred: './public/backgrounds/renowned-red.jpg',
    unmatchedeclipse: './public/backgrounds/unmatched-eclipse.jpg',
    virtualshapes: './public/backgrounds/virtual-shapes.jpg',
    flawlessaffinity: './public/backgrounds/flawless-affinity.jpg',
    prettyheroic: './public/backgrounds/pretty-heroic.jpg',
    irritablehero: './public/backgrounds/irritable-hero.jpg',
    circleacquired: './public/backgrounds/circle-acquired.jpg',
    descendsun: './public/backgrounds/descend-sun.jpg',
    shatteredfeelings: './public/backgrounds/shattered-feelings.jpg'
  }

  const getImage = (name) => {
    return img_map[name]
  }

  let promises = [];

  const width = 1200;
  const height = 627;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  promises.push(
    loadImage(getImage(req.params.image))
      .then(image => {
        context.drawImage(image, 0, 0, width, height);
      })
      .catch(e => console.log(e))
  )

  Promise.all(promises).then(values => {

    context.strokeStyle = req.params.color.replace('{{h}}', '#');
    context.lineWidth = 5;

    context.beginPath();
    context.rect(10, 10, width - 20, height - 20)
    context.stroke();

    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(50, height - 150);
    context.lineTo(250, height - 150);
    context.stroke();

    // context.font = 'bold 70pt Menlo';
    context.font = `bold 70pt ${req.params.font}`;
    context.textAlign = 'left';
    context.fillStyle = req.params.color.replace('{{h}}', '#');
    
    let text = req.params.title;
    context.fillText(text.split('{{n}}').join('\n'), 50, 170);

    // context.font = 'bold 40pt Menlo';
    context.font = `bold 40pt ${req.params.font}`;
    text = req.params.subtitle;
    context.fillText(text.split('{{n}}').join('\n'), 50, 270);

    // context.font = 'bold 40pt Menlo';
    context.font = `bold 40pt ${req.params.font}`;
    text = `${req.params.protocol}${req.params.url.split('{{s}}').join('/')}`;
    context.fillText(text, 50, height - 60);

    const buffer = canvas.toBuffer('image/png');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': buffer.length
   });
   
   res.end(buffer);
  })
})

app.get('/', (req, res) => {
  res.render('index');
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})