let express = require('express');
let router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('dashboard/dashboard', {title: 'Add Product'});
});



module.exports = router;
