const express = require('express');
const app = express();
const port = 80;
let ejs = require('ejs');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');


app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/og/:title/:subtitle/:url/:protocol/:image/:color/data.png', async (req, res) => {
  // res.send(req.params);
  res.contentType('image/png');
  // res.send(tile);

  if(req.params.title == ' ') req.params.title = '';
  if(req.params.subtitle == ' ') req.params.subtitle = '';
  if(req.params.url == ' ') req.params.url = '';
  if(req.params.protocol == ' ') { req.params.protocol = '' } else { req.params.protocol += '://' };
  if(req.params.image == ' ') req.params.title = 'candybar';
  if(req.params.color == ' ') req.params.title = 'black';

  const img_map = {
    candybar:'./public/backgrounds/candy-bar.jpg',
    cheerfulorange: './public/backgrounds/cheerful-orange.jpg',
    renownedred: './public/backgrounds/renowned-red.jpg',
    unmatchedeclipse: './public/backgrounds/unmatched-eclipse.jpg',
    virtualshapes: './public/backgrounds/virtual-shapes.jpg'
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

  promises.push(loadImage(getImage(req.params.image)).then(image => {
    context.drawImage(image, 0, 0, width, height);
  }))

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

    context.font = 'bold 70pt Menlo';
    context.textAlign = 'left';
    context.fillStyle = req.params.color.replace('{{h}}', '#');
    
    let text = req.params.title;
    context.fillText(text.split('{{n}}').join('\n'), 50, 170);

    context.font = 'bold 40pt Menlo';
    text = req.params.subtitle;
    context.fillText(text.split('{{n}}').join('\n'), 50, 270);

    context.font = 'bold 30pt Menlo';
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