/*
 * Module dependencies
 */


var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib');
  
/*
 *	Express app
 */
  
var app = express();
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));
app.use(express.static(__dirname + '/public'));
// don't forget the .ico link in general_layout
app.use(express.favicon(__dirname + '/public/images/Misrab.ico'));

// Passport and Sessions
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
/*
app.use(express.session({ 
  store: redisClient 
  , secret: 'teafortwo'
  }, function() {
    app.use(app.router);
  }));
app.use(passport.initialize());
app.use(passport.session());
*/

/*
 *	Routes
 */
app.get('/', function(req, res) {
	res.render('index');
});


// !! Change this back!!	
//var port = process.env.PORT || 5555;
var port = 5555;


app.listen(port, function() {
	console.log('### Environment is: ' + process.env.NODE_ENV);
	console.log('### Listening on ' + port);
});	
