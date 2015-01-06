var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Personify = require('personify');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var P = new Personify({
    watsonConfig : {
        service_url: "https://gateway.watsonplatform.net/systemu/service/",
        service_username: "12312a68-fdff-4064-9928-eb088a960815",
        service_password: "KUwy0neR5kpV"
    },
    twitterConfig : {
        consumer_key:         'nnnMzv63aJKbQgzF77vQLXCm0',
        consumer_secret:      'BAG1XL3PHUVw6AsW7K0dRcIv6qkITkWARmZL9Bb8nOKfTkbTpo',
        access_token:         '35398491-9KTshSy7QNiKh0Ia71AeZ6D1XMg6teKJWAwp6YNNE',
        access_token_secret:  'ivIGOcV4OHxW9lRrW7pevEcxwtk2RDGzVSW6IdOqz9R0D'
    }
});

//user method is Twitter's user_timeline get request
P.user('fr332th1nk', function(data, err){
    console.log('TTTTTTTTTTTTTTTTTT ' , data , 'TTTTTTTTTTTTTTTTTT');
});

//userHome method is Twitter's home_timeline get request
// W.userHome(function(data, err){
//     console.log('TTTTTTTTTTTTTTTTTT ' , data , 'TTTTTTTTTTTTTTTTTT')
// }, { count: 100 /*optional you may put as many params as you want*/});

// search all tweets params q is required
// W.searchGeo(function(data, err){
//    console.log(data, err);
// }, '#nike', 'NY');






// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
