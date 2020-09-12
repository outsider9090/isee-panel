let express = require('express');
let router = express.Router();
let util = require('util');
let client = require('../config/db/db');
let esclient = require('../config/db/elasticssearch');
let fs = require('fs');
let path = require('path');


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
  if (result){
    res.json({msg:1});
  } else {
    res.json({msg:0});
  }
});

router.post('/remove_document' , function (req, res) {
  let doc_name = req.body.doc_name;
  let result = docs_src.push(doc_name);
  if (result){
    res.json({msg:1});
  } else {
    res.json({msg:0});
  }
});

router.post('/delete_product' , function (req, res) {
  let product_id = req.body.product_id;
  let product_number = req.body.product_number;
  let imgs = [];
  let docs = [];
  let appDir = path.dirname(require.main.filename);


  const query0 = {
    text: 'SELECT * FROM '+ PRODUCT_TABLE_NAME +' WHERE id=$1',
    values: [product_id],
  };
  client.query(query0, (err, response) => {
    if (err) {
      console.log(err.stack);
      res.redirect('/dashboard');
    } else {
      let json_parse = JSON.parse(response.rows[0].dkj);
      imgs = json_parse['Image'];
      docs = Object.entries(json_parse['Documents']);
    }
  });


  const query = {
    text: 'DELETE FROM '+ PRODUCT_TABLE_NAME +' WHERE id=$1',
    values: [product_id],
  };
  client.query(query, (err, response) => {
    if (err) {
      res.json({msg:response});
    } else {
      // delete product images
      imgs.forEach(img => {
       console.log(util.inspect('imgs: ' + img));
       let img_split = img.split('/');
        fs.unlink( appDir +'\\public\\uploads\\images\\' + img_split[5] , (err) => {
          if (err) {
            console.error(err);
          }
        });
      });
      // delete product docs
      let docsArray = [];
      docs.forEach(doc => {
        docsArray.push(doc[1]['Url']);
      });
      docsArray.forEach(doc_src => {
        let src_split = doc_src.split('/');
        fs.unlink( appDir +'\\public\\uploads\\documents\\' + src_split[5] , (err) => {
          if (err) {
            console.error(err);
          }
        });
        console.log(util.inspect('src: ' + doc_src));
      });
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

      req.session.sessionFlash = {type: 'deleteSuccessMsg', message: 'محصول پاک شد.'};
      res.json({msg:1});
    }
  });
});


module.exports = router;
