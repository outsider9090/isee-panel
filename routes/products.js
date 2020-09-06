let express = require('express');
let router = express.Router();
let multiparty = require('multiparty');
let fs = require('fs');
let json_encode = require('json_encode');
let path = require('path');
let validator = require("validator");
let util = require("util");
let client = require('../config/db/db');



router.get('/add',function () {
    res.render('dashboard/add_product', {validation_errors: '' });
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

        console.log(util.inspect('len: ' + objectSize(documentsArray)));

        if (objectSize(documentsArray) !== 0){
            console.log('11111');
            let documentsArrayJson = json_encode(documentsArray).replace(/\[/g, "").replace(/\]/g, "");
            docs_json = '"Documents":' + documentsArrayJson;
            docs_json = docs_json.replace(/\\/g, "");
        } else {
            console.log('2222');
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
                    text: 'insert into xproducts(partnumber, description, detaileddescription,sij,dkj,user_id) VALUES($1,$2,$3,$4,$5,$6)',
                    values: [partnumber[0],description[0],detaileddescription[0],sij_json,dkj_json ,req.user.id],
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
    const query = {
        text: 'SELECT * FROM xproducts WHERE id=$1',
        values: [req.params.product_id],
    };
    client.query(query, (err, response) => {
        if (err) {
            console.log(err.stack);
            //req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
            res.redirect('/dashboard');
        } else {
            //req.session.sessionFlash = {type: 'addSuccessMsg', message: 'محصول اضافه شد.'};
            json_str = json_encode(response.rows[0].dkj);
            json_parse = JSON.parse(response.rows[0].dkj);
            console.log(util.inspect('json: ' + typeof json_str));
            console.log(util.inspect('image: ' +  json_str.Image));
            console.log(util.inspect('image:3 ' +  json_str[0]['Image']));
            console.log(util.inspect('image2: ' +  response.rows[0].dkj));
            console.log(util.inspect('image4: ' +  json_parse['Image']));
            res.render('dashboard/edit_product' , {
                title: 'ویرایش محصول',
                validation_errors : '',
                product : response.rows[0]
            });
        }
    });
});

router.get('/delete/:product_id' , function (req,res) {
    const query = {
        text: 'DELETE FROM xproducts WHERE id=$1',
        values: [req.params.product_id],
    };
    client.query(query, (err, response) => {
        if (err) {
            console.log(err.stack);
            //req.session.sessionFlash = {type: 'addErrorMsg', message: 'خطا در افزودن محصول!'};
            res.redirect('/dashboard');
        } else {
            //req.session.sessionFlash = {type: 'addSuccessMsg', message: 'محصول اضافه شد.'};
            res.redirect('/dashboard/products');
        }
    });
});

module.exports = router;
