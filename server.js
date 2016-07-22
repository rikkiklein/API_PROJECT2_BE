var express     = require('express');
var cors        = require('cors');
var bodyParser  = require('body-parser');
var mongodb     = require('mongodb');
var request     = require('request');
var app         = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var IMAGES_COLLECTION = "images";
var PLACES_COLLECTION = "places";

var url = 'mongodb://localhost:27017/weather_api';

mongodb.MongoClient.connect(process.env.MONGODB_URI || url, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  db = database;
  console.log("Database connection ready");

  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

app.get('/', function(request, response){
  response.json({"description":"Welcome to this AWESOME WEATHER API!"});
});

/*************************PLACES*********************************************/
  app.post('/places/search', function(req, res) {
    console.log("###### POST PLACES/SEARCH ############");
    console.log("REQ.BODY", req.body);
    var baseUrl = "http://api.openweathermap.org/data/2.5/weather";
    var tsQueryString = '?q=';
    var apiKeyQueryString = "&appid=";
    var WEATHER_KEY=process.env.WEATHER_KEY;
    var queryString = req.body.queryString;
    var metric = "&units=metric";
    var imperial = "&units=imperial";
    var fullQuery = baseUrl + tsQueryString + queryString + imperial + apiKeyQueryString + WEATHER_KEY;
    console.log("SEND REQ IN PLACES SEARCH");
    request({
      url: fullQuery,
      method: 'GET',
      callback: function(error, response, body) {
        console.log("BODY IN GET REQ IS", body);
        res.send(body);
      }
    })

  });

  app.get('/places', function(req, response) {
    console.log("###### GET PLACES ############");
    console.log("REQ.BODY", req.body);
    response.json({ "description" : "WEATHER ENDPOINT"});
  });
  app.delete('/places/', function(req, response){
    console.log("###### DELETE PLACES ALL############");
    console.log("REQ.BODY", req.body);
    db.collection(PLACES_COLLECTION).remove(),function(err, docs){
      if(err){
        console.log(err);
      }
      else {
        console.log(docs);
        response.send(docs);
      }
    }
  });

  app.get('/places/favorites', function(req, response){
    console.log("###### GET PLACES/FAVORITES ############");
    console.log("REQ.BODY", req.body);
    db.collection(PLACES_COLLECTION).find().toArray(function(err, docs){
      if(err){
        console.log(err);
      }
      else {
        console.log(docs);
        response.send(docs);
      }
    });
  });
  app.delete('/places/favorites', function(req, response){
    console.log("###### DELETE PLACES/FAVORITES ############");
    console.log("REQ.BODY", req.body);
    var placeToDel = req.body;
    console.log("placeToDel", placeToDel);
    db.collection(PLACES_COLLECTION).remove(placeToDel, function(err, docs){
      if(err){
        console.log(err);
      }
      else {
        db.collection(PLACES_COLLECTION).find(placeToDel).toArray(function(err, result){
          if(err){
            console.log("ERROR!", err);
            response.json("error");
          }
          else if(result.length){
            console.log("found result", result);
            response.json(result);
          }
          else{
            console.log("no docs found with find criteria");
            response.json("none found")
          }
        })//end of db find
      }
    }) //end db remove
  }); //end of app.delete
  app.post('/places/favorites', function(req, res){
    console.log("###### POST PLACES/FAVORITES ############");
    console.log("REQ.BODY", req.body);
    var newFav = req.body;
    console.log("newFav", newFav);

    db.collection(PLACES_COLLECTION).find(newFav).toArray(function(err, docs){
      console.log("docs", docs);
      if(docs.length<1){
        db.collection(PLACES_COLLECTION).insertOne(newFav, function (err, result) {
          if (err) {
            console.log(err);
            res.json("error");
          } else {
            console.log('Inserted.');
            console.log('RESULT!!!!', result);
            console.log("end result");
            res.json(result);
          }
        });
      }
    })
  }); //end app.post
/*************************END OF PLACES*****************************************/

/*************************IMAGES*********************************************/
  app.post('/images/search', function(req, res){
    console.log("###### POST IMAGES/SEARCH ############");
    console.log("REQ.BODY", req.body);
    var baseURL = "https://pixabay.com/api/"
    var key = "?key=";
    var PIX_KEY=process.env.PIX_KEY;
    var qString = "&q=";
    var queryString = req.body.queryString;
    var image_type = "&image_type=photo&pretty=true";
    var cat = "&category=places";
    var fullQuery = baseURL + key + PIX_KEY + qString + queryString + image_type + cat;
    console.log("SEND REQ IN IMAGES SEARCH");
    request({
      url: fullQuery,
      method: 'GET',
      callback: function(error, response, body){
        console.log("BODY IN GET REQ IS", body);
        res.send(body);
      }
    })
  });

  app.get('/images', function(req, response) {
    console.log("###### GET IMAGES ############");
    console.log("REQ.BODY", req.body);
    response.json({ "description" : "IMAGES ENDPOINT"});
  });
  app.delete('/images/', function(req, response){
    console.log("###### DELETE IMAGES ALL############");
    console.log("REQ.BODY", req.body);
    db.collection(IMAGES_COLLECTION).remove(),function(err, docs){
      if(err){
        console.log(err);
      }
      else {
        console.log(docs);
        response.send(docs);
      }
    }
  });

  app.get('/images/favorites', function(req, response){
    console.log("###### GET IMAGES/FAVORITES ############");
    console.log("REQ.BODY", req.body);
    db.collection(IMAGES_COLLECTION).find().toArray(function(err, docs){
      if(err){
        console.log(err);
      }
      else {
        console.log(docs);
        response.send(docs);
      }
    });
  });
  app.delete('/images/favorites', function(req, response){
    console.log("###### DELETE IMAGES/FAVORITES ############");
    console.log("REQ.BODY", req.body);
    var imgToDel = req.body;
    console.log("imgToDel", imgToDel);
    db.collection(IMAGES_COLLECTION).remove(imgToDel),function(err, docs){
      if(err){
        console.log(err);
      }
      else {
        console.log(docs);
        response.send(docs);
      }
    }
  });
  app.post('/images/favorites', function(req, res){
    console.log("###### POST IMAGES/FAVORITES ############");
    console.log("REQ.BODY", req.body);
    var newFav = req.body;
    console.log("newFav", newFav);
    db.collection(IMAGES_COLLECTION).find(newFav).toArray(function(err, docs){
      console.log("docs", docs);
      if(docs.length<1){
        db.collection(IMAGES_COLLECTION).insertOne(newFav, function (err, result) {
          if (err) {
            console.log(err);
            res.json("error");
          } else {
            console.log('Inserted.');
            console.log('RESULT!!!!', result);
            console.log("end result");
            res.json(result);
          }
        }); // end insert
      } // end if
    }); // end check
  }); // end post
/*************************END OF IMAGES*****************************************/
