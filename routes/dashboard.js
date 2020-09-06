let express = require('express');
let router = express.Router();
let client = require('../config/db/db');



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('dashboard/dashboard', {
        title: 'Dashboard'
    });
});

router.get('/add_product', function(req, res, next) {
    res.render('dashboard/add_product', {
        title: 'Add Product' ,
        validation_errors: '',
        old_values : ''
    });
});

router.get('/products', function(req, res, next) {
    const query = {
        text: 'SELECT * FROM xproducts WHERE user_id=$1',
        values: [req.user.id],
    };
    client.query(query, (err, response) => {
        if (err) {
            console.log(err.stack);
            //req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
            res.redirect('/dashboard');
        } else {
            //req.session.sessionFlash = {type: 'addSuccessMsg', message: 'محصول اضافه شد.'};
            res.render('dashboard/products', {
                title: 'لیست محصولات',
                products: response.rows
            });
        }
    });

});



module.exports = router;
