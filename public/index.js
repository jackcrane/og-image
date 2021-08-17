const image = document.querySelector('img.main');
const code = document.querySelector('code');

const updateImage = () => {
  construct.url = construct.url.replace('https://', '').replace('http://', '').replace('file://', '');

  if(construct.title == '') construct.title = ' ';
  if(construct.subtitle == '') construct.subtitle = ' ';
  if(construct.url == '') construct.url = ' ';

  construct.url = construct.url.split('/').join('{{s}}')
  construct.color = construct.color.replace('#', '{{h}}')

  const url = `https://og-image.xyz/og/${construct.title}/${construct.subtitle}/${construct.url}/${construct.protocol}/${construct.font}/${construct.image}/${construct.color}/data.png`;
  document.querySelector('#mainpreview').src = url;
  document.querySelector('#previewcode').innerText = url;
}

let construct = {
  title:'title',
  subtitle:'subtitle',
  url:'og-image.xyz',
  protocol:'https',
  font:'menlo',
  image:'candybar',
  color:'black'
}

document.querySelectorAll('img.selectable').forEach(e => {
  e.addEventListener('click', evt => {
    document.querySelector('img.selectable.active').classList.remove('active');
    evt.target.classList.add('active');
    construct.image = evt.target.getAttribute('data-eq');
    updateImage();
  })
})

document.querySelectorAll('input.update').forEach(e => {
  e.addEventListener('input', evt => {
    construct[evt.target.getAttribute('data-field')] = evt.target.value;
    updateImage();
  })
})

document.querySelectorAll('input.update_change').forEach(e => {
  e.addEventListener('change', evt => {
    construct[evt.target.getAttribute('data-field')] = evt.target.value;
    updateImage();
  })
})

document.querySelectorAll('select.url_protocol').forEach(e => {
  e.addEventListener('input', evt => {
    construct.protocol = evt.target.value;
    updateImage();
  })
})

document.querySelectorAll('select.font').forEach(e => {
  e.addEventListener('input', evt => {
    construct.font = evt.target.value;
    updateImage();
  })
})

updateImage();