let express = require('express');
let router = express.Router();
let multiparty = require('multiparty');
let fs = require('fs');
let json_encode = require('json_encode');
let path = require('path');
let validator = require("validator");
let util = require("util");
let client = require('../config/db/db');
let async  = require("async");


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
                newPath+=  timeNow + '-' + singleImg.originalFilename;
                readAndWriteImage(singleImg, newPath);
                imageNames.push('http://' + hostname + '/uploads/images/' + timeNow + '-' + imgArray[j].originalFilename);
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
                newPath+= timeNow + '-' + singleFile.originalFilename;
                readAndWriteFile(singleFile, newPath);
                documentsArray[doc_types[k]]=[{
                    'Name':doc_names[k],
                    'Url':'http://' + hostname + '/uploads/documents/' + timeNow + '-' + filesArray[k].originalFilename,
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
                validation_errors: errors,
                old_values: oldValues
            });
        }else {
            if (image_json === '' && docs_json === '' && attr_json === ''){
                req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
                res.render('dashboard/add_product', {title: 'افزودن محصول',validation_errors: errors});
            } else {
                const dkj_json = '{' + image_json + ','  + docs_json + ',' + attr_json + '}';
                const sij_json = '{' + image_json + ','  + docs_json + '}';
                const query = {
                    text: 'insert into '+ PRODUCT_TABLE_NAME +'(partnumber, description, detaileddescription,sij,dkj,user_id) VALUES($1,$2,$3,$4,$5,$6)',
                    values: [partnumber[0],description[0],detaileddescription[0],sij_json,dkj_json ,req.user.id ],
                };
                client.query(query, (err, response) => {
                    if (err) {
                        //console.log(err.stack);
                        req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
                        res.redirect('/dashboard/add_product');
                    } else {
                        //console.log(response.rows[0]);
                        req.session.sessionFlash = {type: 'addSuccessMsg', message: 'محصول اضافه شد.'};
                        res.redirect('/dashboard/add_product');
                    }
                });
            }
        }
    });


    function objectSize(obj) {
        var size = 0, key;
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
                attrs : attrs
            });
        }
    });
});


router.post('/update',function (req, res) {
    console.log('sada');
    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
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
        let names = [];
        if (old_images !== undefined){
            for (let i = 0; i < old_images.length ; i++) {
                names.push(old_images[i]);
            }
        }
        // New Images
        let imgArray = files.part_image;
        let imageNames = [];
        let image_json = '';
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
                    newPath+=  timeNow + '-' + singleImg.originalFilename;
                    readAndWriteImage(singleImg, newPath);
                    imageNames.push('http://' + hostname + '/uploads/images/' + timeNow + '-' + imgArray[j].originalFilename);
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
        }
        else {
            image_json = '' ;
            errors.part_image = 'حداقل یک تصویر انتخاب کنید!';
        }


        // Old Documents
        let old_doc_type = fields.oldDocType;
        let old_doc_name = fields.oldDocName;
        let old_doc_url = fields.oldDocUrl;
        let docs_array = {};
        if (old_doc_url !== undefined){
            for (let i = 0; i < old_doc_url.length ; i++) {
                docs_array[old_doc_type[i]]=[{
                    'Name':old_doc_name[i],
                    'Url': old_doc_url[i]
                }];
            }
        }
        // New Documents
        let doc_types = fields.docType;
        let doc_names = fields.docName;
        let filesArray = files.docUrl;
        let docs_json = '';
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
                    newPath+= timeNow + '-' + singleFile.originalFilename;
                    readAndWriteFile(singleFile, newPath);
                    docs_array[doc_types[k]]=[{
                        'Name':doc_names[k],
                        'Url':'http://' + hostname + '/uploads/documents/' + timeNow + '-' + filesArray[k].originalFilename,
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
        if (counter === 0){
            attr_json = '"Attributes":' + json_encode(attr_array) ;
            attr_json = attr_json.replace(/\[/g, "").replace(/\]/g, "");
        }else {
            attr_json = '';
        }


        if (! isEmpty(errors)){
            req.session.sessionFlash = {type: 'editErrorMsg', message: 'خطا در ویرایش محصول!'};
            res.redirect('/dashboard/products');
        }else {
            if (image_json === '' && docs_json === '' && attr_json === ''){
                console.log('are empty');
                req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
                res.render('dashboard/add_product', {title: 'افزودن محصول',validation_errors: errors});
            } else {
                const dkj_json = '{' + image_json + ','  + docs_json + ',' + attr_json + '}';
                const sij_json = '{' + image_json + ','  + docs_json + '}';
                const query = {
                    text: 'UPDATE '+ PRODUCT_TABLE_NAME +' SET partnumber=$1,description=$2,detaileddescription=$3,sij=$4,dkj=$5  WHERE id=$6 ',
                    values: [partnumber[0],description[0],detaileddescription[0],sij_json,dkj_json ,product_id[0]],
                };
                client.query(query, (err, response) => {
                    if (err) {
                        //console.log(err.stack);
                        req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در ویرایش محصول!'};
                        res.redirect('/dashboard/products');
                    } else {
                        let appDir = path.dirname(require.main.filename);
                        for (let ii=0 ; ii<images_src.length ; ii++){
                            fs.unlink( appDir +'\\public\\uploads\\images\\' + images_src[ii], (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                        for (let jj=0 ; jj<docs_src.length ; jj++){
                            fs.unlink( appDir +'\\public\\uploads\\documents\\' + docs_src[jj], (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                        //console.log(response.rows[0]);
                        req.session.sessionFlash = {type: 'editSuccessMsg', message: 'محصول ویرایش شد.'};
                        res.redirect('/dashboard/products');
                    }
                });
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
