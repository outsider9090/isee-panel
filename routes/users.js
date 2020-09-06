let express = require('express');
let router = express.Router();
let { check, validationResult } = require('express-validator');
const util = require('util');
const bcrypt = require('bcryptjs');
let Regex = require("regex");
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let client = require('../config/db/db');



router.post('/signup' ,[
    check('email').notEmpty().withMessage(''),
    check('email').isEmail().withMessage(''),
    check('password').notEmpty().withMessage(''),
    check('password_repeat').custom((value, { req }) => value === req.body.password).withMessage('')
], function (req,res,next) {
    let email = req.body.email;
    let password = req.body.password;

    // let regex = new Regex(/^[a-zA-Z0-9!@#$%^&*_+\-=\[\]{};':"\\|,.<>\/?]*$/);
    // if(regex.test(password)) {
    //   console.log(util.inspect('valid'));
    // }
    // else{
    //   console.log(util.inspect('invalid'));
    // }

    let errors = validationResult(req);
    if ( ! errors.isEmpty()){
        req.session.sessionFlash = {type:'signupError', message: 'مشکل در ثبت نام!'};
        res.redirect('/');
    }else {
        console.log(util.inspect('No error'));
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
                        res.redirect('/');
                    } else {
                        console.log(response.rows[0]);
                        req.session.sessionFlash = {type: 'SignupSuccess', message: 'ثبت نام با موفقیت انجام شد.'};
                        res.redirect('/');
                    }
                });
            });
        });
    }
});


router.post('/signin', passport.authenticate(
    'local',{session:true}),
    function (req, res) {
        req.session.sessionFlash = {type: 'loginSuccess', message: 'ورود موفقیت آمیز'};
        res.redirect('/dashboard');
    });
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});
passport.deserializeUser((id, cb) => {
    client.query('SELECT id, email FROM users WHERE id = $1', [parseInt(id, 10)], (err, results) => {
        if(err) {
            console.log('err: ' + err);
            throw err;
        }
        cb(null, results.rows[0]);
    })
});
passport.use(new LocalStrategy({usernameField:"email", passwordField:"password"} , function (username, password, cb) {
    const query = {
        text: 'select id,email,password FROM users WHERE email=$1',
        values: [username],
    };
    client.query(query, (err, response) => {
        if (err){
            throw err;
        }
        if(response.rows.length > 0) {
            const first = response.rows[0];
            bcrypt.compare(password, first.password, function(err, res) {
                if(res) {
                    cb(null, { id: first.id, email: first.email });
                } else {
                    cb(null, false);
                }
            })
        } else {
            cb(null, false);
        }
    });
}));


router.get('/logout', function (req, res) {
    req.logOut();
    req.session.sessionFlash = {type: 'logoutSuccess', message: 'از سایت خارج شدید.'};
    res.redirect('/');
});


module.exports = router;
