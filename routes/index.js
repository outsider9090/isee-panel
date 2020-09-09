let express = require('express');
let router = express.Router();
let util = require('util');
let client = require('../config/db/db');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('site/index', { title: 'Home' });
});
router.get('/403', function(req, res, next) {
  res.render('site/403');
});


/* Ajaxes */
global.images_src = [];
global.docs_src = [];

router.post('/remove_image' , function (req, res) {
  let image_name = req.body.img_name;
  let result = images_src.push(image_name);
  console.log(util.inspect('imgArray: ' + images_src));
  if (result){
    res.json({msg:1});
  } else {
    res.json({msg:0});
  }
});

router.post('/remove_document' , function (req, res) {
  let doc_name = req.body.doc_name;
  let result = docs_src.push(doc_name);
  console.log(util.inspect('filesArray: ' + docs_src));
  if (result){
    res.json({msg:1});
  } else {
    res.json({msg:0});
  }
});

router.post('/delete_product' , function (req, res) {
  let product_id = req.body.product_id;
  const query = {
    text: 'DELETE FROM '+ PRODUCT_TABLE_NAME +' WHERE id=$1',
    values: [product_id],
  };
  client.query(query, (err, response) => {
    if (err) {
      res.json({msg:response});
    } else {
      res.json({msg:1});
    }
  });
});


module.exports = router;
