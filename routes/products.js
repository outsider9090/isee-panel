let express = require('express');
let router = express.Router();
let multiparty = require('multiparty');
let fs = require('fs');
let json_encode = require('json_encode');
let path = require('path');
let validator = require("validator");
let util = require("util");
let client = require('../config/db/db');
let esclient = require('../config/db/elasticssearch');
const b2CloudStorage = require('b2-cloud-storage');



router.get('/add',function () {
    res.render('dashboard/add_product', {
        page_name: 'addProduct',
        validation_errors: ''
    });
});


router.post('/add',function (req, res) {
    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        let partnumber = fields.partnumber;
        let description = fields.description;
        let detaileddescription = fields.detaileddescription;
        const oldValues = new Object();
        oldValues.partnumber = partnumber;
        oldValues.description = description;

        const errors = new Object();
        if (validator.equals(partnumber[0],''))
        {
            errors.partnumber = 'لطفا شماره قطعه را وارد کنید!';
        }
        if(validator.equals(description[0],'')){
            errors.description = 'لطفا توضیحات قطعه را وارد کنید!';
        }


        // Images
        let imgArray = files.part_image;
        let imageNames = [];
        let image_json = '';
        let bb_images_ids = [];

        for (let j = 0; j < imgArray.length; j++) {
            let uploadImageOk = 1;
            let newPath = './public/uploads/images/';
            let singleImg = imgArray[j];
            let fileType = getExtension(singleImg.originalFilename);
            if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png" ){
                uploadImageOk = 0;
            }
            if (uploadImageOk !== 0){
                let hostname = req.headers.host;
                let timeNow = Date.now();
                // newPath+=  timeNow + '-' + singleImg.originalFilename;
                // readAndWriteImage(singleImg, newPath);
                const b2 = new b2CloudStorage({
                    auth: {
                        accountId: BB_KEY_ID, // NOTE: This is the accountId unique to the key
                        applicationKey: BB_APP_KEY
                    }
                });
                b2.authorize(function (err) {
                    if (err) {throw err;}
                    b2.uploadFile(singleImg.path, {
                        bucketId: BB_BUCKET_ID,
                        fileName: BB_SITE_UPLOAD_URL_PREFIX + timeNow + '-' + singleImg.originalFilename, // this is the object storage "key". Can include a full path
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            bb_images_ids.push(result.fileId);
                        }
                    });
                });
                //imageNames.push('http://' + hostname + '/uploads/images/' + timeNow + '-' + imgArray[j].originalFilename);
                imageNames.push(BB_FILE_URL + timeNow + '-' + imgArray[j].originalFilename);
            }
        }


        if (imageNames.length !== 0){
            image_json = '"Image":' + json_encode(imageNames) ;
        } else {
            image_json = '' ;
            errors.part_image = 'حداقل یک تصویر انتخاب کنید!';
        }


        // Documents
        let doc_types = fields.docType;
        let doc_names = fields.docName;
        let filesArray = files.docUrl;
        let documentsArray = {};
        let docs_json = '';
        let bb_docs_ids = [];

        for (let k = 0; k < filesArray.length; k++) {
            let uploadFileOk = 1;
            let hostname = req.headers.host;
            let newPath = './public/uploads/documents/';
            let singleFile = filesArray[k];
            let fileType =getExtension(singleFile.originalFilename);
            if (fileType !== 'pdf' && fileType !== 'html' && fileType !== 'htm' ){
                uploadFileOk = 0;
            }
            if (uploadFileOk !== 0){
                let timeNow = Date.now();
                //newPath+= timeNow + '-' + singleFile.originalFilename;
                //readAndWriteFile(singleFile, newPath);
                const b3 = new b2CloudStorage({
                    auth: {
                        accountId: BB_KEY_ID, // NOTE: This is the accountId unique to the key
                        applicationKey: BB_APP_KEY
                    }
                });
                b3.authorize(function(err){
                    if(err){ throw err; }
                    b3.uploadFile(singleFile.path, {
                        bucketId: BB_BUCKET_ID,
                        fileName: BB_SITE_UPLOAD_URL_PREFIX + timeNow + '-' + singleFile.originalFilename, // this is the object storage "key". Can include a full path
                    }, function(err, result){
                        if (err) {
                            console.log(err);
                        }else {
                            bb_docs_ids.push(result.fileId);
                        }
                    });
                });

                documentsArray[doc_types[k]]=[{
                    'Name':doc_names[k],
                    //'Url':'http://' + hostname + '/uploads/documents/' + timeNow + '-' + filesArray[k].originalFilename,
                    'Url':BB_FILE_URL + timeNow + '-' + filesArray[k].originalFilename,
                }];
            }
        }
        if (objectSize(documentsArray) !== 0){
            let documentsArrayJson = json_encode(documentsArray).replace(/\[/g, "").replace(/\]/g, "");
            docs_json = '"Documents":' + documentsArrayJson;
            docs_json = docs_json.replace(/\\/g, "");
        } else {
            docs_json = '';
            errors.docUrl = 'لطفا فایل سند را انتخاب کنید!';
        }


        // Attributes
        let attr_names = fields.attribNames;
        let attr_values = fields.attribValues;
        let attr_array = {};
        let attr_json = '';
        let counter = 0;
        for (let i = 0; i < attr_names.length; i++) {
            if (attr_names[i] === ''){counter++;}
            attr_array[attr_names[i]] = attr_values[i];
        }
        if (counter === 0){
            attr_json = '"Attributes":' + json_encode(attr_array) ;
            attr_json = attr_json.replace(/\[/g, "").replace(/\]/g, "");
        }else {
            attr_json = '';
        }


        if (! isEmpty(errors)){
            //req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
            //res.redirect('/dashboard');
            res.render('dashboard/add_product', {
                title: 'افزودن محصول',
                page_name : 'addProduct',
                validation_errors: errors,
                old_values: oldValues
            });
        }else {
            if (image_json === '' && docs_json === '' && attr_json === ''){
                req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
                res.render('dashboard/add_product', {title: 'افزودن محصول',validation_errors: errors});
            } else {
                let check_ids = setInterval(function () {
                    if (bb_images_ids.length === imgArray.length && bb_docs_ids.length === filesArray.length ){
                        const dkj_json = '{' + image_json + ','  + docs_json + ',' + attr_json + '}';
                        const sij_json = '{' + image_json + ','  + docs_json + '}';
                        const query = {
                            text: 'insert into '+ PRODUCT_TABLE_NAME +'(pkey,dkpartnumber,partnumber, description, detaileddescription,sij,dkj,user_id,bbimagesids,bbdocsids) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
                            values: [0,partnumber[0],partnumber[0],description[0],detaileddescription[0],sij_json,dkj_json ,req.user.id,json_encode(bb_images_ids),json_encode(bb_docs_ids) ],
                        };
                        client.query(query, (err, response) => {
                            if (err) {
                                console.log(err.stack);
                                req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
                                res.redirect('/dashboard/add_product');
                            } else {
                                // Add to elastic search
                                esclient.index({
                                    index: ES_INDEX,
                                    type: ES_TYPE,
                                    body: {
                                        "partnumber" : partnumber[0],
                                        "description" : description[0],
                                        "detaileddescription" : detaileddescription[0],
                                        "sij" : sij_json,
                                        "dkj" : dkj_json
                                    }
                                });
                                //console.log(response.rows[0]);
                                req.session.sessionFlash = {type: 'addSuccessMsg', message: 'محصول اضافه شد.'};
                                res.redirect('/dashboard/add_product');
                            }
                        });
                        clearInterval(check_ids);
                    }
                },3000);
            }
        }
    });


    function objectSize(obj) {
        let size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
    function readAndWriteImage(singleImg, newPath) {
        fs.readFile(singleImg.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
            })
        })
    }
    function readAndWriteFile(singleFile, newPath) {
        fs.readFile(singleFile.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
            })
        })
    }
    function getExtension(filename) {
        let ext = path.extname(filename||'').split('.');
        return ext[ext.length - 1];
    }
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
});


router.get('/edit/:product_id' , function (req,res) {
    images_src = [];
    images_ids = [];
    docs_src = [];
    docs_ids = [];
    const query = {
        text: 'SELECT * FROM '+ PRODUCT_TABLE_NAME +' WHERE id=$1',
        values: [req.params.product_id],
    };
    client.query(query, (err, response) => {
        if (err) {
            console.log(err.stack);
            res.redirect('/dashboard');
        } else {
            json_parse = JSON.parse(response.rows[0].dkj);
            let attrs = Object.entries(json_parse['Attributes']);
            let docs = Object.entries(json_parse['Documents']);


            res.render('dashboard/edit_product' , {
                title: 'ویرایش محصول',
                page_name: 'addProduct',
                validation_errors : '',
                product : response.rows[0],
                images : json_parse['Image'],
                docs : docs,
                attrs : attrs,
                img_ids: JSON.parse(response.rows[0].bbimagesids),
                doc_ids: JSON.parse(response.rows[0].bbdocsids),
            });
        }
    });
});


router.post('/update',function (req, res) {
    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        let oldpartnumber = fields.old_part_number;
        let partnumber = fields.partnumber;
        let description = fields.description;
        let detaileddescription = fields.detaileddescription;
        let product_id = fields.product_id;

        const errors = new Object();
        if (validator.equals(partnumber[0],''))
        {
            errors.partnumber = 'لطفا شماره قطعه را وارد کنید!';
        }
        if(validator.equals(description[0],'')){
            errors.description = 'لطفا توضیحات قطعه را وارد کنید!';
        }


        // Old images
        let old_images = fields.old_part_image;
        let old_image_ids = fields.old_image_ids;
        let names = [];
        let old_image_ids_array = [];
        if (old_images !== undefined){
            for (let i = 0; i < old_images.length ; i++) {
                names.push(old_images[i]);
            }
        }
        if (old_image_ids !== undefined){
            for (let j = 0; j < old_image_ids.length ; j++) {
                old_image_ids_array.push(old_image_ids[j]);
            }
        }
        // New Images
        let imgArray = files.part_image;
        let imageNames = [];
        let image_json = '';
        let bb_images_ids = [];

        if (imgArray !== undefined){
            for (let j = 0; j < imgArray.length; j++) {
                let uploadImageOk = 1;
                let newPath = './public/uploads/images/';
                let singleImg = imgArray[j];
                let fileType = getExtension(singleImg.originalFilename);
                if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png" ){
                    uploadImageOk = 0;
                }
                if (uploadImageOk !== 0){
                    let hostname = req.headers.host;
                    let timeNow = Date.now();
                    //newPath+=  timeNow + '-' + singleImg.originalFilename;
                    //readAndWriteImage(singleImg, newPath);
                    const b2 = new b2CloudStorage({
                        auth: {
                            accountId: BB_KEY_ID, // NOTE: This is the accountId unique to the key
                            applicationKey: BB_APP_KEY
                        }
                    });
                    b2.authorize(function (err) {
                        if (err) {throw err;}
                        b2.uploadFile(singleImg.path, {
                            bucketId: BB_BUCKET_ID,
                            fileName: BB_SITE_UPLOAD_URL_PREFIX + timeNow + '-' + singleImg.originalFilename, // this is the object storage "key". Can include a full path
                        }, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                bb_images_ids.push(result.fileId);
                            }
                        });
                    });

                    imageNames.push(BB_FILE_URL + timeNow + '-' + imgArray[j].originalFilename);
                    //imageNames.push('http://' + hostname + '/uploads/images/' + timeNow + '-' + imgArray[j].originalFilename);
                }
            }
        }

        if (imageNames.length !== 0 && names.length !== 0){
            image_json = '"Image":[' + json_encode(names + '"' + ',' + '"' + imageNames) + ']';
            image_json = image_json.replace(/\\/g, "");
        }else if(imageNames.length !== 0 && names.length === 0){
            image_json = '"Image":[' + json_encode(imageNames) + ']';
            image_json = image_json.replace(/\\/g, "");
        }else if(names.length !== 0 && imageNames.length === 0) {
            image_json = '"Image":[' + json_encode(names) + ']';
            image_json = image_json.replace(/\\/g, "");
        }else {
            image_json = '' ;
            errors.part_image = 'حداقل یک تصویر انتخاب کنید!';
        }


        // Old Documents
        let old_doc_type = fields.oldDocType;
        let old_doc_name = fields.oldDocName;
        let old_doc_url = fields.oldDocUrl;
        let docs_array = {};
        let docs = [];
        let old_doc_ids = fields.old_doc_ids;
        let old_doc_ids_array = [];
        if (old_doc_url !== undefined){
            for (let i = 0; i < old_doc_url.length ; i++) {
                docs_array[old_doc_type[i]]=[{
                    'Name':old_doc_name[i],
                    'Url': old_doc_url[i]
                }];
                docs.push(old_doc_name[i]);
            }
        }
        if (old_doc_ids !== undefined){
            for (let j = 0; j < old_doc_ids.length ; j++) {
                old_doc_ids_array.push(old_doc_ids[j]);
            }
        }
        // New Documents
        let doc_types = fields.docType;
        let doc_names = fields.docName;
        let filesArray = files.docUrl;
        let docs_json = '';
        let bb_docs_ids = [];
        if (filesArray !== undefined){
            for (let k = 0; k < filesArray.length; k++) {
                let uploadFileOk = 1;
                let hostname = req.headers.host;
                let newPath = './public/uploads/documents/';
                let singleFile = filesArray[k];
                let fileType =getExtension(singleFile.originalFilename);
                if (fileType !== 'pdf' && fileType !== 'html' && fileType !== 'htm' ){
                    uploadFileOk = 0;
                }
                if (uploadFileOk !== 0){
                    let timeNow = Date.now();
                    //newPath+= timeNow + '-' + singleFile.originalFilename;
                    //readAndWriteFile(singleFile, newPath);
                    const b3 = new b2CloudStorage({
                        auth: {
                            accountId: BB_KEY_ID, // NOTE: This is the accountId unique to the key
                            applicationKey: BB_APP_KEY
                        }
                    });
                    b3.authorize(function(err){
                        if(err){ throw err; }
                        b3.uploadFile(singleFile.path, {
                            bucketId: BB_BUCKET_ID,
                            fileName: BB_SITE_UPLOAD_URL_PREFIX + timeNow + '-' + singleFile.originalFilename, // this is the object storage "key". Can include a full path
                        }, function(err, result){
                            if (err) {
                                console.log(err);
                            }else {
                                bb_docs_ids.push(result.fileId);
                            }
                        });
                    });

                    docs_array[doc_types[k]]=[{
                        'Name':doc_names[k],
                        'Url':BB_FILE_URL + timeNow + '-' + filesArray[k].originalFilename,
                        //'Url':'http://' + hostname + '/uploads/documents/' + timeNow + '-' + filesArray[k].originalFilename,
                    }];

                }
            }
        }
        let documentsArrayJson = json_encode(docs_array).replace(/\[/g, "").replace(/\]/g, "");
        docs_json = '"Documents":' + documentsArrayJson;
        docs_json = docs_json.replace(/\\/g, "");


        // Attributes
        let attr_names = fields.attribNames;
        let attr_values = fields.attribValues;
        let attr_array = {};
        let attr_json = '';
        let counter = 0;
        for (let i = 0; i < attr_names.length; i++) {
            if (attr_names[i] === ''){counter++;}
            attr_array[attr_names[i]] = attr_values[i];
        }
        attr_json = '"Attributes":' + json_encode(attr_array) ;
        attr_json = attr_json.replace(/\[/g, "").replace(/\]/g, "");


        if (! isEmpty(errors)){
            req.session.sessionFlash = {type: 'editErrorMsg', message: 'خطا در ویرایش محصول!'};
            res.redirect('/dashboard/products');
        }else {
            if (image_json === '' && docs_json === '' && attr_json === ''){
                req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
                res.render('dashboard/add_product', {title: 'افزودن محصول',validation_errors: errors});
            } else {
                let check_ids = setInterval(function () {
                    if ((bb_images_ids.length +names.length)===imgArray.length && (bb_docs_ids.length +docs.length)===filesArray.length  ){
                        const dkj_json = '{' + image_json + ','  + docs_json + ',' + attr_json + '}';
                        const sij_json = '{' + image_json + ','  + docs_json + '}';
                        const query = {
                            text: 'UPDATE '+ PRODUCT_TABLE_NAME +' SET partnumber=$1,description=$2,detaileddescription=$3,sij=$4,dkj=$5,bbimagesids=$6,bbdocsids=$7  WHERE id=$8 ',
                            values: [partnumber[0],description[0],detaileddescription[0],sij_json,dkj_json,json_encode(old_image_ids_array.concat(bb_images_ids)),json_encode(old_doc_ids_array.concat(bb_docs_ids)) ,product_id[0]],
                        };
                        client.query(query, (err, response) => {
                            if (err) {
                                //console.log(err.stack);
                                req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در ویرایش محصول!'};
                                res.redirect('/dashboard/products');
                            } else {
                                //let appDir = path.dirname(require.main.filename);
                                const b2 = new b2CloudStorage({
                                    auth: {
                                        accountId: BB_KEY_ID,
                                        applicationKey: BB_APP_KEY
                                    }
                                });


                                let docs_ids_json = JSON.parse(json_encode(docs_ids));
                                for (let ii=0 ; ii<docs_src.length ; ii++){
                                    for (let kk=0 ; kk<docs_src.length ; kk++){
                                        // console.log(docs_ids[ii]);
                                        b2.authorize(function(err){
                                            if(err){ throw err; }
                                            b2.deleteFileVersion( {
                                                fileName: BB_SITE_UPLOAD_URL_PREFIX + docs_src[ii],
                                                fileId : docs_ids_json[ii]
                                            }, function(err ,result){
                                                if (err) {
                                                    console.log(err);
                                                }else {
                                                    console.log('success');
                                                }
                                            });
                                        });
                                    }
                                }

                                let images_ids_json = JSON.parse(json_encode(images_ids));
                                for (let ii=0 ; ii<images_src.length ; ii++){
                                    for (let jj=0 ; jj<images_src.length ; jj++){
                                        console.log('dsasad: ' + images_ids_json[jj]);
                                        b2.authorize(function(err){
                                            if(err){ throw err; }
                                            b2.deleteFileVersion( {
                                                fileName: BB_SITE_UPLOAD_URL_PREFIX + images_src[jj],
                                                fileId : images_ids_json[jj]
                                            }, function(err ,result){
                                                if (err) {
                                                    console.log(err);
                                                }else {
                                                    console.log('success');
                                                }
                                            });
                                        });
                                    }
                                }

                                //for (let ii=0 ; ii<images_src.length ; ii++){
                                // fs.unlink( appDir +'\\public\\uploads\\images\\' + images_src[ii], (err) => {
                                //     if (err) {
                                //         console.error(err);
                                //     }
                                // });
                                //}
                                // for (let jj=0 ; jj<docs_src.length ; jj++){
                                //     fs.unlink( appDir +'\\public\\uploads\\documents\\' + docs_src[jj], (err) => {
                                //         if (err) {
                                //             console.error(err);
                                //         }
                                //     });
                                // }
                                // Add to elastic search
                                let product_id = 0;
                                esclient.search({
                                    index: ES_INDEX,
                                    type: ES_TYPE,
                                    body:{
                                        "query": {
                                            "match": {
                                                "partnumber": oldpartnumber[0]
                                            }
                                        }
                                    }
                                }).then(function(resp) {
                                    product_id =resp.hits.hits[0]._id;
                                    esclient.update({
                                        index: ES_INDEX,
                                        type: ES_TYPE,
                                        id: product_id,
                                        body: {
                                            doc:{
                                                "partnumber" : partnumber[0],
                                                "description" : description[0],
                                                "detaileddescription" : detaileddescription[0],
                                                "sij" : sij_json,
                                                "dkj" : dkj_json
                                            }
                                        }
                                    });
                                }, function(err) {
                                    console.trace(err.message);
                                });
                                req.session.sessionFlash = {type: 'editSuccessMsg', message: 'محصول ویرایش شد.'};
                                res.redirect('/dashboard/products');
                            }
                        });
                        clearInterval(check_ids);
                    }
                },3000);
            }
        }
    });



    function readAndWriteImage(singleImg, newPath) {
        fs.readFile(singleImg.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
            })
        })
    }
    function readAndWriteFile(singleFile, newPath) {
        fs.readFile(singleFile.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
            })
        })
    }
    function getExtension(filename) {
        let ext = path.extname(filename||'').split('.');
        return ext[ext.length - 1];
    }
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
});




module.exports = router;
