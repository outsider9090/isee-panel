let express = require('express');
let router = express.Router();
let { check, validationResult } = require('express-validator');
const util = require('util');
const {Client} = require('pg');
const bcrypt = require('bcryptjs');



const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '172839',
  port: 5432
});
client.connect();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


router.post('/signup' ,[
  check('email').notEmpty().withMessage(''),
  check('email').isEmail().withMessage(''),
  check('password').notEmpty().withMessage(''),
  check('password_repeat').custom((value, { req }) => value === req.body.password).withMessage('')
], function (req,res,next) {
  let email = req.body.email;
  let password = req.body.password;

  let errors = validationResult(req);
  if ( ! errors.isEmpty()){
    //console.log(util.inspect('errs: ' + errors));
    req.session.sessionFlash = {type:'signupError', message: 'مشکل در ثبت نام!'};
    res.redirect('/dashboard');
  }else {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        const query = {
          text: 'INSERT INTO users (email,password) VALUES($1,$2)',
          values: [email,hash],
        };
        client.query(query, (err, response) => {
          if (err) {
            console.log(err.stack);
            req.session.sessionFlash = {type: 'signupError', message: 'مشکل در ثبت نام!'};
            res.redirect('/dashboard');
          } else {
            console.log(response.rows[0]);
            req.session.sessionFlash = {type: 'SignupSuccess', message: 'ثبت نام با موفقیت انجام شد.'};
            res.redirect('/dashboard');
          }
        });
      });
    });
  }
});


router.post('/signin', function(req,res){
  let email = req.body.email;
  let pass = req.body.password;

  const query = {
    text: 'select * from users where email = $1',
    values: [email],
  };
  client.query(query, (err, response) => {
    if (err) {
      console.log(err.stack);
      req.session.sessionFlash = {type: 'loginError', message: 'خطا در ورود!'};
      res.redirect('/dashboard');
    } else {
      if (response.rows[0] !== undefined){
        bcrypt.compare(pass, response.rows[0].password, function(err, result) {
          if (result){
            req.session.sessionFlash = {type: 'loginSuccess', message: 'ورود موفقیت آمیز'};
            res.redirect('/dashboard');
          } else {
            req.session.sessionFlash = {type: 'loginError', message: 'خطا در ورود!'};
            res.redirect('/dashboard');
          }
        });
      } else {
        req.session.sessionFlash = {type: 'loginError', message: 'خطا در ورود!'};
        res.redirect('/dashboard');
      }
    }
  });

});



module.exports = router;
