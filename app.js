let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let session = require('express-session');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let flash = require('express-flash');
let passport = require('passport');
const { requiresLogin } = require('./config/middlewares/auth');




// Route Files
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let dashboardRouter = require('./routes/dashboard');
let productsdRouter = require('./routes/products');


// Init App
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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


// //catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });



app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function(){
	console.log('Server started on port: '+app.get('port'));
});
