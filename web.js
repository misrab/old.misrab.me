/*
 * Module dependencies
 */


var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , db_pg = require('./models').pg
  , knox = require('knox')
  , fs = require('fs')
  , async = require('async')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  

var client = knox.createClient({
    key: process.env.AWS_ACCESS_KEY_ID
  , secret: process.env.AWS_SECRET_ACCESS_KEY
  , bucket: process.env.S3_BUCKET_NAME
});


// Define local strategy for Passport
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  }, function(username, password, done) {
    db_pg.User.authenticate(username, password, done);
  }
));
// serialize user on login
passport.serializeUser(function(user, done) {
  //console.log('serializing user\n');
  done(null, user.id);
});
// deserialize user on logout
passport.deserializeUser(function(id, done) {
  db_pg.User.find(id).success(function(user) {
    done(null, user);
  }).error(function(error) {
    done(error, null);
  });
});
  
/*
 *  Redis Client
 */
/*
function createRedisClient() {
  if (process.env.REDISTOGO_URL) {
    var redisUrl = url.parse(process.env.REDISTOGO_URL);
    var redisAuth = redisUrl.auth.split(':');
    var client = require("redis").createClient(redisUrl.port, redisUrl.hostname);
    client.auth(redisAuth[1]);
  } else {
    var client = require("redis").createClient(6379, 'localhost');
  }
  return client;
}

var RedisStore = require('connect-redis')(express);
var client = createRedisClient();

if (process.env.REDISTOGO_URL) {
  console.log('###');
  // TODO: redistogo connection
  // redis store
  var redisUrl = url.parse(process.env.REDISTOGO_URL);
  var redisAuth = redisUrl.auth.split(':');
  
  var redisClient = new RedisStore({
                          host: redisUrl.hostname,
                          port: redisUrl.port,
                          db: redisAuth[0],
                          pass: redisAuth[1],
                          client: client
                        });
} else {
  //var redis = require("redis").createClient(6379, 'localhost');

  var redisClient = new RedisStore({
                          host: 'localhost',
                          port: 6379,
                          client: client
                        });
}*/




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
app.use(express.multipart());
/*
app.use(express.session({ 
  store: redisClient 
  , secret: 'teafortwo'
  }, function() {
    app.use(app.router);
  }));*/
app.use(express.session({ secret: 'teafortwo' }));
app.use(passport.initialize());
app.use(passport.session());




// functions
function verifyIsAdmin(req, res, next) {
  console.log('User is : ' + JSON.stringify(req.user));
  if (req.user!=null && req.user.isAdmin) {
    return next();
  }
  //console.log('didnt pass:' + req.user + ' and ');
  res.redirect('/admin/login');
};

/*
function verifyPassword(str) {
  var d = new Date();
  var truth = 'barsim' + d.getDate();

  if (truth===str) return true;
  return false;
};*/

// next(err, projects, blogs)
function getProjectsAndBlogposts(next) {
  async.parallel([
    function(cb) {
      db_pg.Project.findAll().success(function(projs) {
        cb(null, projs);
      }).error(cb);
    },
    function(cb) {
      db_pg.Blogpost.findAll().success(function(blogs) {
        cb(null, blogs);
      }).error(cb);
    }
    ], function(err, results) {
      if (err) return next(err);
      next(null, results[0], results[1]);
    });
};

/*
 *	Routes
 */
app.get('/', function(req, res) {
  getProjectsAndBlogposts(function(err, projs, blogs) {
    if (err) return res.json(400, err);
    var locals = { projects: projs, blogposts: blogs };
    res.render('landing/index', locals);
  });
});
app.get('/blog/:id', function(req, res) {
  var id = parseInt(req.param('id'));
  if (isNaN(parseInt(id))) return res.redirect('/');

  db_pg.Blogpost.find(id).success(function(blog) {
    res.render('landing/blog', { blog: blog });
  }).error(function(err) {
    return res.redirect('/');
  });
});
app.get('/fun', function(req, res) {
  res.render('landing/fun');
});

// admin pages
app.get('/admin', verifyIsAdmin, function(req, res) {
  getProjectsAndBlogposts(function(err, projs, blogs) {
    if (err) return res.json(400, err);
    var locals = { projects: projs, blogposts: blogs };
    res.render('admin/index', locals);
  });
});

app.get('/admin/login', function(req, res) {
  if (req.user && req.user.isAdmin) return res.redirect('/admin');
  res.render('admin/login');
});
// not restful, sue me
app.get('/admin/logout', function(req, res) {
  req.logout();
  return res.redirect('/');
});
app.post('/admin/session', function(req, res) {
  async.waterfall([
    // checks to see if user is authenticated
    function(callback){
      passport.authenticate('local', function(err, user, info) {      
        return callback(err, user);
      })(req, res, callback);
    }, 
    //logs user in
    function(user, callback){
      // to avoid serializing
      if (!user) return callback(null, null);
      
      req.login(user, function(err) {
        if (err) return callback(err);
        return callback(null, user);
      });
    }
  ], function(err, user){
    if (err) return res.json(400, err);
    res.redirect('/admin');
  });
});



// temp signup routes
/*
app.get('/admin/signup', function(req, res) {
  res.render('admin/signup');
});
app.post('/admin/signup', function(req, res) {
  var user = db_pg.User.build({
    email:    req.body.email,
    //password: req.body.password,
    isAdmin:  true
  });

  user.setPassword(req.body.password, function(err, newUser) {
    newUser.save().success(function() {
      res.redirect('/admin/login');
    }).error(function(err) {
      return res.json(400, err);
    });
  });
});
*/

app.post('/admin/project', verifyIsAdmin, function(req, res) {

  //if (!verifyPassword(req.body.password)) return res.redirect('/');

  // first upload file to S3
  var file = req.files.file;
  console.log('## file is ' + file);
  if (file.name !== '') {
    var stream = fs.createReadStream(file.path)
    client.putStream(stream, file.name, {
          //'Content-Type': mimetype,
          'Cache-Control': 'max-age=604800',
          'x-amz-acl': 'public-read',
          'Content-Length': file.size
      }, function(err, result){
        if (err) return res.json(400, err);
        result.resume();

        var project = {
          title:          req.body.title
          , description:  req.body.description
          , static_url:   'https://s3.amazonaws.com/misrabme/' + file.name
          , link:         req.body.link 
        };
        db_pg.Project.create(project).success(function() {
          res.redirect('/admin');
        }).error(function(err) {
          return res.json(400, err);
        });
    }); 
  } else {
    var project = {
      title:          req.body.title
      , description:  req.body.description
      //, static_url:   'https://s3.amazonaws.com/misrabme/' + file.name
      , link:         req.body.link 
    };
    db_pg.Project.create(project).success(function() {
      res.redirect('/admin');
    }).error(function(err) {
      return res.json(400, err);
    });
  }
});

app.delete('/admin/project/:id', verifyIsAdmin, function(req, res) {
  // delete S3 file and project
  db_pg.Project.find(req.param('id')).success(function(proj) {
    if (proj.static_url) {
      client.del(proj.static_url.replace('https://s3.amazonaws.com/misrabme/', '')).on('response', function(s3res){
        console.log(s3res.statusCode);
        console.log(s3res.headers);
      }).end();
      res.redirect('/admin');
    }
    proj.destroy().success(function() {
      return res.redirect('/admin');
    }).error(function(err) {
      return res.json(400, err);
    });
    
  }).error(function(err) {
    return res.json(400, err);
  }); 
});

app.post('/admin/blogpost', verifyIsAdmin, function(req, res) {
  //if (!verifyPassword(req.body.password)) return res.redirect('/');

  var blog = {
    title:            req.body.title
    , description:    req.body.description
    , content:        req.body.content
  };
  db_pg.Blogpost.create(blog).success(function() {
    res.redirect('/admin');
  }).error(function(err) {
    return res.json(400, err);
  });
});
app.delete('/admin/blogpost/:id', verifyIsAdmin, function(req, res) {
  db_pg.Blogpost.find(req.param('id')).success(function(blog) {
    blog.destroy().success(function() {
      return res.redirect('/admin');
    }).error(function(err) {
      return res.json(400, err);
    });
  }).error(function(err) {
    res.json(400, err);
  });
});



/*
 *  Server listening
 */

var port = process.env.PORT || 5555;
var clearDB = null;
clearDB = function(next) { next(null); };
//clearDB = function(next) { db_pg.sequelize.drop().complete(next); };

clearDB(function(err) {
  db_pg.sequelize.sync().complete(function(err) {
    if (err) { throw err }
    console.log('### Succeeded connecting to: ' + db_pg.url + ' ###');
    app.listen(port, function() {
      console.log('### Environment is: ' + process.env.NODE_ENV);
      console.log('### Listening on ' + port);
    });
  });
});