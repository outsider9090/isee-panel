let express = require('express');
let router = express.Router();
let util = require('util');
let client = require('../config/db/db-dev');
let esclient = require('../config/db/elasticssearch-dev');
let fs = require('fs');
let path = require('path');
const b2CloudStorage = require('b2-cloud-storage');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('site/index', { title: 'Home' });
});
router.get('/403', function(req, res, next) {
  res.render('site/403');
});


/* Ajaxes */
global.images_src = [];
global.images_ids = [];
global.docs_src = [];
global.docs_ids = [];
global.temp_images = {};
global.temp_images_array = [];
global.temp_docs = {};
global.temp_docs_array = [];



router.post('/remove_image' , function (req, res) {
  let image_name = req.body.img_name;
  let image_id = req.body.img_id;

  temp_images = {
    'name': image_name,
    'id': image_id
  };
  temp_images_array.push(temp_images);

  console.log(util.inspect(temp_images_array));

  let result1 = images_src.push(image_name);
  let result2 = images_ids.push(image_id);
  if (result1 && result2){
    res.json({msg:1});
  } else {
    res.json({msg:0});
  }
});

router.post('/remove_document' , function (req, res) {
  let doc_name = req.body.doc_name;
  let doc_id = req.body.file_id;

  temp_docs = {
    'name': doc_name,
    'id': doc_id
  };
  temp_docs_array.push(temp_docs);

  let result1 = docs_src.push(doc_name);
  let result2 = docs_ids.push(doc_id);
  if (result1 && result2){
    res.json({msg:1});
  } else {
    res.json({msg:0});
  }
});

router.post('/delete_product' , function (req, res) {
  let product_id = req.body.product_id;
  let product_number = req.body.product_number;
  let imgs = [];
  let imgs_ids = [];
  let docs_ids = [];
  let docs = [];
  //let appDir = path.dirname(require.main.filename);

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
      imgs_ids = JSON.parse(response.rows[0].bbimagesids);
      docs = Object.entries(json_parse['Documents']);
      docs_ids = JSON.parse(response.rows[0].bbdocsids);
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
      const b2 = new b2CloudStorage({
        auth: {
          accountId: BB_KEY_ID,
          applicationKey: BB_APP_KEY
        }
      });
      let delete_images_timer = setInterval(function () {
        if (imgs.length !== 0) {
          try {
            imgs.forEach(img => {
              let img_split = img.split('/');
              console.log(img_split);
              imgs_ids.forEach(img_id =>{
                b2.authorize(function(err){
                  if(err){ throw err; }
                  b2.deleteFileVersion( {
                    fileName: BB_SITE_UPLOAD_URL_PREFIX + img_split[BB_SPLIT_INDEX],
                    fileId : img_id.id
                  }, function(err){
                    if (err) {
                      console.log(err);
                    }else {
                      console.log('success');
                    }
                  });
                });
              });

              // fs.unlink( appDir +'\\public\\uploads\\images\\' + img_split[5] , (err) => {
              //   if (err) {
              //     console.error(err);
              //   }
              // });
            });
          }catch (e) {
            console.log(e);
          }
        }
        clearInterval(delete_images_timer);
      },2000);

      // delete product docs
      let docsArray = [];
      docs.forEach(doc => {
        docsArray.push(doc[1]['Url']);
      });
      let delete_docs_timer = setInterval(function () {
        if (docsArray.length !== 0){
          try {
            docsArray.forEach(doc_src => {
              let src_split = doc_src.split('/');
              docs_ids.forEach(doc_id =>{
                b2.authorize(function(err){
                  if(err){ throw err; }
                  b2.deleteFileVersion( {
                    fileName: BB_SITE_UPLOAD_URL_PREFIX + src_split[BB_SPLIT_INDEX],
                    fileId : doc_id.id
                  }, function(err ,result){
                    if (err) {
                      console.log(err);
                    }else {
                      console.log('success');
                    }
                  });
                });
              });
              // fs.unlink( appDir +'\\public\\uploads\\documents\\' + src_split[5] , (err) => {
              //   if (err) {
              //     console.error(err);
              //   }
              // });
            });
          }catch (e) {
            console.log(e);
          }
        }
        clearInterval(delete_docs_timer);
      },2000);
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
