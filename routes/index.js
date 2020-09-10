let express = require('express');
let router = express.Router();
let util = require('util');
let client = require('../config/db/db');
let esclient = require('../config/db/elasticssearch');
// let elasticsearch = require('elasticsearch');
// let esclient = new elasticsearch.Client({
//   host: 'localhost:9200',
//   log: 'trace',
//   apiVersion: '7.x', // use the same version of your Elasticsearch instance
// });

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
  let product_number = req.body.product_number;



  // delete from elasticsearch
  let pid = 0;
  esclient.search({
    index: ES_INDEX,
    type: ES_TYPE,
    body:{
      "query": {
        "match": {
          "partnumber": product_number
        }
      }
    }
  }).then(function(resp) {
    pid =resp.hits.hits[0]._id;
    console.log("product_id: " + pid);
    esclient.delete({
      index : ES_INDEX,
      type : ES_TYPE,
      id : pid
    });
  }, function(err) {
    console.trace(err.message);
  });

  const query = {
    text: 'DELETE FROM '+ PRODUCT_TABLE_NAME +' WHERE id=$1',
    values: [product_id],
  };
  client.query(query, (err, response) => {
    if (err) {
      req.session.sessionFlash = {type: 'deleteSuccessMsg', message: 'محصول پاک شد.'};
      res.json({msg:response});
    } else {
      res.json({msg:1});
    }
  });
});


module.exports = router;
