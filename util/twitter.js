//Personify.js
//For more information, visit http://personifyjs.github.io.
//Created by Essam Al Joubori, Rohan Agrawal, Phil Elauria
//Copyright 2014 - 2015 ssam Al Joubori, Rohan Agrawal, Phil Elauria 
//For user under the MIT license

var Twit = require('twit');
var personifyModule = require('./watson');
var geoLocations = require('../lib/geoLocations');
var translateModule = require('./translate');

var Personify = function(auth) {

  var twitterData = '';

  var T = new Twit({
          consumer_key        :  auth.twitterConfig.consumer_key,
          consumer_secret     :  auth.twitterConfig.consumer_secret,
          access_token        :  auth.twitterConfig.access_token,
          access_token_secret :  auth.twitterConfig.access_token_secret
  });
  
    // create a profile request with the text and the htpps options and call it
    // `req.body.subject` is the subject that was entered by the end user
    // TODO: to have the end user enter the date

// ========= Watson User Modeling and Twitter REST below =============================

// Takes a twitter handle and return personality traits, needs and values in a JSON object
  Personify.prototype.userPersonify = function(twitterHandle, callback) {

    T.get('statuses/user_timeline', { screen_name: twitterHandle, count: 100 },
        function(err, data, response) {
          if (data.length) {
            for (var i = 0; i < data.length; i++){
              twitterData += data[i].text;
            }
            personifyModule.watson(auth, twitterData, callback);
          } else {
            callback(data, err);
        }
    });
  };

// Returns a collection of the most recent Tweets and retweets posted by the authenticating 
// user and the users they follow. The home timeline is central to how most users interact with 
// the Twitter service.
  Personify.prototype.homePersonify = function(params, callback) {

    var getData = function(data) {
      if (data) {
        for (var i = 0; i < data.length; i++){
          twitterData += data[i].text;
        }
        personifyModule.watson(auth, twitterData, callback);
      } else {
        callback(null, 'No data found!')
      }   
    }; 

    if (arguments[0].constructor === Object){
      T.get('statuses/home_timeline', params, function(err, data, response) { getData(data); });
    } else {
      T.get('statuses/home_timeline', function(err, data, response) { getData(data); });
    }
  };


// Uses Twitter search/tweets GET request. Has all optional parameters available
// plus additional quick and conventient state and city search from geoLocations.js file
  Personify.prototype.searchPersonify = function(params, callback) {
    var geotype;
 
    if (typeof params.geocode === 'string') {
      if (geoLocations[params.geocode]) {
        geotype = geoLocations[params.geocode].geo;
        params.geocode = geotype;
      } else {
        callback(null, 'Geo location is not valid!')
      } 
    }
 
    T.get('search/tweets', params, function(err, data, response) {
      if (data) {
        for(var i = 0; i < data.statuses.length; i++) {
          // accumulate the data (each tweet as a text) received from twitter
          twitterData += data.statuses[i].text;
        }
        personifyModule.watson(auth, twitterData, callback);
      } else {
        callback(data, err);
      }
    });
  };

// ======================= Watson User Modeling and Twitter REST above =============================

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Personify methods above this line ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Translate methods below this line ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// =============================== Helper functions for Translate methods below ====================

//Take parameters object from user's method call 
//(eg, arguments[0] in P.translate({q: '#nike', fromLanguage: 'ar', toLanguage: 'en', etc...}, callback))
//and parse then reconstruct the language codes to send to Watson Machine Translate
  var  createLangs = function(params){
    var translateCode;
    //langs key is Twitter language code, value is Watson language code
    var langs = {
      ar: 'arar',  //Arabic
      en: 'enus',  //English
      fr: 'frfr',  //French
      pt: 'ptbr',  //Portuguese
      es: 'eses'   //Spanish
    };

    // adding extra key-value pair in params for Twitter language
    params.lang = params.fromLanguage;

    //construct the string value that Machine Translate is looking for
    translateCode = 'mt-'+ langs[params.fromLanguage] + '-' + langs[params.toLanguage];

    return translateCode;
  }

// Remove all characters that Machine Translate will not process (like emojis)
// Machine Translate will throw an error if wrong characters are sent to it
    var filterTweet = function(tweet) {
      var wantedChars = tweet.replace(/[^\u1f600-\u1f64f]/g, ' ');
      return wantedChars;
    };

// stop streaming with timer
    var stopStream = function(time, context){
      setTimeout(function () {
        context.stop();
      }, time);
    };

// call stream. Created to avoid duplication. Can be used more if more stream methods created
    var streams = function(parameterObj, cb, stream){
      var translateCode = createLangs(parameterObj);
      stream.on('tweet', function (tweet) {
        var texts = filterTweet(tweet.text);
        translateModule.translate(auth, texts, translateCode, parameterObj.outputType, cb);
      });

      stream.on('error', function(err){
        console.log(err)
        cb(null, err);
      });
    }
// =============================== Helper functions for Translate methods above ====================

// ======================= Watson Machine Translation and Twitter REST below =======================


//Take a Twitter handle and get back Twitter account's tweets translated
  Personify.prototype.userTranslate = function(params, callback){
    var translateCode = createLangs(params);

    T.get('statuses/user_timeline', params,
     function(err, data, response) {
      if (data.length) {
        for (var i = 0; i < data.length; i++){
          twitterData += filterTweet(data[i].text);
        }
        translateModule.translate(auth, twitterData, translateCode, params.outputType, callback);
      } else {
        callback(data, err);
      }
    });
  }


  //Get tweets found in user's home timeline and translate them to another language
  Personify.prototype.homeTranslate = function(params, callback) {
    var translateCode = createLangs(params);

    var getData = function(data) {
      if (data) {
        for (var i = 0; i < data.length; i++){
          twitterData += data[i].text;
        }
        translateModule.translate(auth, twitterData, translateCode, params.outputType, callback);
      } else {
        callback(null, 'No data found!')
      }
    }; 

    if (arguments[0].constructor === Object){
      T.get('statuses/home_timeline', params, function(err, data, response) { getData(data); });
    } else {
      T.get('statuses/home_timeline', function(err, data, response) { getData(data); });
    }
  };

  // Twitter search/tweets GET request combined with Watson Machine Translate
  Personify.prototype.searchTranslate = function (params, callback){
    var translateCode = createLangs(params);

    T.get('search/tweets', params, function(err, data, response) {
      if (data) {
        for(var i = 0; i < data.statuses.length; i++) {
          // accumulate the data (each tweet as a text) received from twitter
          twitterData += filterTweet(data.statuses[i].text);
        }
        translateModule.translate(auth, twitterData, translateCode, params.outputType, callback);
      } else {
        console.log(data)
        callback(data, err);
      }
    });
  }; 

// ======================= Watson Machine Translation and Twitter REST above =======================

// ==================== Watson Machine Translation and Twitter Streaming below =====================

  Personify.prototype.streamTranslate = function(params, callback){
    
    var stream = T.stream('statuses/filter', 
      { 
        track : params.track, 
        language : params.fromLanguage 
      });

    if (params.hasOwnProperty('stop')){
      streams(params, callback, stream);
      stopStream(params.stop, stream);
    } else {
      streams(params, callback, stream);
    }
  }

// ==================== Watson Machine Translation and Twitter Streaming above =====================

};

module.exports = Personify;
