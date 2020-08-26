let express = require('express');
let router = express.Router();
let multer = require('multer');
let upload = multer({ dest: './public/uploads' });
let { check, validationResult } = require('express-validator');
const { Client } = require('pg');
let multiparty = require('multiparty');
let fs = require('fs');
let json_encode = require('json_encode');
let path = require('path');
const util = require('util');
let validator = require("validator");
let url = require("url");


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '172839',
    port: 5432
});
client.connect();


router.get('/add',function () {
    res.render('dashboard/dashboard', {validation_errors: ''});
});

router.post('/add',function (req, res) {

    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        let partnumber = fields.partnumber;
        let description = fields.description;
        let detaileddescription = fields.detaileddescription;


        const errors = new Object();
        if (validator.equals(partnumber[0],''))
        {
            errors.partnumber = 'لطفا شماره قطعه را وارد کنید!';
        }
        if(validator.equals(description[0],'')){
            errors.description = 'لطفا توضیحات قطعه را وارد کنید!';
        }


        if (errors.isEmpty){
            res.render('dashboard/dashboard', {validation_errors: errors});
            return;
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
                newPath+= singleImg.originalFilename;
                readAndWriteImage(singleImg, newPath);
                imageNames.push('http://' + hostname + '/uploads/images/' + imgArray[j].originalFilename);
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
        let documentsArray = [];
        let docs_json = '';
        for (let k = 0; k < filesArray.length; k++) {
            let uploadFileOk = 1;
            let tempArray = [];
            let hostname = req.headers.host;
            let newPath = './public/uploads/documents/';
            let singleFile = filesArray[k];
            let fileType =getExtension(singleFile.originalFilename);
            if (fileType !== 'pdf' && fileType !== 'html' && fileType !== 'htm' ){
                uploadFileOk = 0;
            }
            if (uploadFileOk !== 0){
                newPath+= singleFile.originalFilename;
                readAndWriteFile(singleFile, newPath);
                tempArray.push({
                    "Name:"  : doc_names[k],
                    "Url:"  : 'http://' + hostname + '/uploads/documents/' + filesArray[k].originalFilename
                });
                documentsArray.push( doc_types[k] + ":" + json_encode(tempArray));
            }
        }
        if (documentsArray.length !== 0){
            let documentsArrayJson = json_encode(documentsArray).replace(/\[/g, "").replace(/\]/g, "");
            docs_json = '"Documents":{' + documentsArrayJson + '}';
            docs_json = docs_json.replace(/\\/g, "");
        } else {
            docs_json = '';
            errors.docUrl = 'لطفا فایل سند را انتخاب کنید!';
        }



        // Attributes
        let attr_names = fields.attribNames;
        let attr_values = fields.attribValues;
        let attr_array = [];
        let attr_json = '';
        let counter = 0;
        for (let i = 0; i < attr_names.length; i++) {
            if (attr_names[i] === ''){counter++;}
            attr_array.push(attr_names[i] + ':' + attr_values[i]);
        }
        if (counter === 0){
            attr_json = '"Attributes":{' + json_encode(attr_array) + '}';
            attr_json = attr_json.replace(/\[/g, "").replace(/\]/g, "");
        }else {
            attr_json = '';
        }




        if (image_json === '' && docs_json === '' && attr_json === ''){
            req.session.sessionFlash = {type: 'danger', message: 'خطا در افزودن محصول!'};
            res.render('dashboard/dashboard', {validation_errors: errors});
           // res.redirect('/dashboard');
        } else {
            const dkj_json = image_json + ','  + docs_json + ',' + attr_json;
            const sij_json = image_json + ','  + docs_json;
            const query = {
                text: 'insert into xproduct_202008041139(partnumber, description, detaileddescription,sij,dkj) VALUES($1,$2,$3,$4,$5)',
                values: [partnumber[0],description[0],detaileddescription[0],sij_json,dkj_json],
            };
            client.query(query, (err, response) => {
                if (err) {
                    //console.log(err.stack);
                    req.session.sessionFlash = {type: 'danger', message: 'خطا در افزودن محصول!'};
                    res.redirect('/dashboard');
                    //return;
                } else {
                    console.log(response.rows[0]);
                    req.session.sessionFlash = {type: 'success', message: 'محصول اضافه شد.'};
                    res.redirect('/dashboard');
                    //return;
                }
            });

        }

    });



    function readAndWriteImage(singleImg, newPath) {
        fs.readFile(singleImg.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
                console.log('Fitxer: '+singleImg.originalFilename +' - '+ newPath);
            })
        })
    }
    function readAndWriteFile(singleFile, newPath) {
        fs.readFile(singleFile.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
                console.log('Fitxer: '+singleFile.originalFilename +' - '+ newPath);
            })
        })
    }
    function getExtension(filename) {
        let ext = path.extname(filename||'').split('.');
        return ext[ext.length - 1];
    }
});

module.exports = router;
