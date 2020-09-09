let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let session = require('express-session');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let flash = require('express-flash');
let passport = require('passport');
const { requiresLogin } = require('./config/middlewares/auth');
let paginate = require('express-paginate');
let compression = require('compression');
let favicon = require('serve-favicon');



// Init App
let app = express();

// Paginate
app.use(paginate.middleware(10, 50));

// Optimization
app.use(compression()); //Compress all routes


// Route Files
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let dashboardRouter = require('./routes/dashboard');
let productsdRouter = require('./routes/products');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Logger
app.use(logger('dev'));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//Handle Sessions
app.use(session({
	secret:'secret',
	saveUninitialized: true,
	resave: true
}));
// Passport
app.use(passport.initialize());
app.use(passport.session());
//Connect Flash
app.use(flash());
// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
	res.locals.sessionFlash = req.session.sessionFlash;
	delete req.session.sessionFlash;
	next();
});


// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dashboard' , requiresLogin , dashboardRouter);
app.use('/products', productsdRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	res.render('site/404');
});


app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function(){
	console.log('Server started on port: '+app.get('port'));
});
