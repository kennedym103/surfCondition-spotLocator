
const mediablock = document.querySelectorAll('.msw-js-mediaBlock')

const spot_name = mediablock.getAttribute('data-spot-name');

const spot_id = mediablock.getAttribute('data-spot-id');



const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app     = express();

app.get('/', function(req, res){

url = 'http://magicseaweed.com/site-map.php';

request(url, function(error, response, html){
  if(!error){

  const $ = cheerio.load(html);
  const json = {

    spotList : {}

  };

  $('a').each(function(){

      const spotName = $(this).find('.msw-js-mediaBlock').data('spotName');
      const spotId = $(this).find('.msw-js-mediaBlock').data('spotId');


      json.spotList[spotName] = {};
      json.spotList[spotId] = {};

  })

  } else {

    console.log('error happened :' + error);

  }

  fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

    console.log('File successfully written! - Check your project directory for the output.json file');

  })

// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
  res.send('Check your console!')

  });
})

app.listen(8081);
console.log('Magic happens on port 8081');
exports = module.exports = app;