'use strict';

const fetch = require('node-fetch');
const express = require('express');

fetch('http://api.themoviedb.org/3/movie/now_playing?api_key=ea063f4f9f9c96a700b99b9737a83c80')
  .then(function(response){
    return response.json().then(function(json){
      json.results.map(function(item) {
        console.log(item.original_title)
      });
    });
  });


let app = express();

app.get('/hello', function(req, res) {
  res.send('world')
})

app.listen(process.env.PORT || 8080);
