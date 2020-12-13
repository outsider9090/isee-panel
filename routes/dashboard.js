let express = require('express');
let router = express.Router();
let client = require('../config/db/db-dev');
let util = require('util');
let paginate = require('express-paginate');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('dashboard/dashboard', {
        title: 'Dashboard',
        page_name: 'dashboard'
    });
});

router.get('/add_product', function(req, res, next) {
    res.render('dashboard/add_product', {
        title: 'Add Product' ,
        page_name: 'addProduct',
        validation_errors: '',
        old_values : ''
    });
});

router.get('/products', function(req, res, next) {
    let itemCount = 0;
    function objectSize(obj) {
        let size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
    const query0 = {
        text: 'select * from '+ PRODUCT_TABLE_NAME +' WHERE user_id=$1',
        values: [req.user.id],
    };
    client.query(query0, (err, resp) => {
        itemCount = objectSize(resp.rows);
    });
    const query = {
        text: 'SELECT * FROM '+ PRODUCT_TABLE_NAME +' WHERE user_id=$1 ORDER BY id DESC limit $2 offset $3 ',
        values: [req.user.id, req.query.limit , req.skip],
    };
    client.query(query, (err, response) => {
        if (err) {
            console.log(err.stack);
            res.redirect('/dashboard');
        } else {
            let products = response.rows;
            const pageCount = Math.ceil(itemCount / req.query.limit);

            res.render('dashboard/products', {
                title: 'Products List',
                page_name: 'productsList',
                products: products,
                pageCount,
                itemCount,
                currentPage : req.query.page,
                pages: paginate.getArrayPages(req)('', pageCount, req.query.page)
            });
        }
    });

});

router.get('/products/search/:query' , function (req , res) {
    let itemCount = 0;
    function objectSize(obj) {
        let size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
    const query0 = {
        text: 'select * from '+ PRODUCT_TABLE_NAME +' WHERE partnumber like $1 AND user_id=$2 ',
        values: ['%' + req.params.query + '%' , req.user.id]
    };
    client.query(query0, (err, resp) => {
        itemCount = objectSize(resp.rows);
    });

    const query = {
        text: 'select * from '+ PRODUCT_TABLE_NAME +' WHERE partnumber like $1 AND user_id=$2 ORDER BY id DESC limit $3 offset $4',
        values: ['%' + req.params.query + '%' , req.user.id, req.query.limit , req.skip]
    };
    client.query(query, (err, response) => {
        if (err) {
            console.log(err.stack);
            res.redirect('/dashboard');
        } else {
            let products = response.rows;
            const pageCount = Math.ceil(itemCount / req.query.limit);

            res.render('dashboard/products', {
                title: 'Products List',
                page_name: 'productsList',
                products: products,
                pageCount,
                itemCount,
                currentPage : req.query.page,
                pages: paginate.getArrayPages(req)('', pageCount, req.query.page)
            });
        }
    });

});




module.exports = router;
