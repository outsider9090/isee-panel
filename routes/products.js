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
let url = require('url');
const util = require('util');



const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '172839',
    port: 5432
});
client.connect();



router.post('/add', function (req, res, next) {

    let form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        let partnumber = fields.partnumber;
        let description = fields.description;
        let detaileddescription = fields.detaileddescription;

        if (partnumber !== '' || description !== '') {
            res.send('Fill the filelds.');
            return;
        }

        // Images
        let imgArray = files.part_image;
        let imageNames = [];
        for (let j = 0; j < imgArray.length; j++) {
            let uploadImageOk = 1;
            let newPath = './public/uploads/images/';
            let singleImg = imgArray[j];
            let fileType = getExtension(singleImg.originalFilename);
            if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png" ){
                uploadImageOk = 0;
            }
            if (uploadImageOk === 0){
                res.send('Sorry, your images was not uploaded.');
            } else {
                let hostname = req.headers.host;
                newPath+= singleImg.originalFilename;
                readAndWriteImage(singleImg, newPath);
                imageNames.push('http://' + hostname + '/uploads/images/' + imgArray[j].originalFilename);
            }
        }
        // var pathname = url.parse(req.url).pathname; // pathname = '/MyApp'
        let image_json = '"Image":' + json_encode(imageNames) ;


        // Documents
        let doc_types = fields.docType;
        let doc_names = fields.docName;
        let filesArray = files.docUrl;
        let documentsArray = [];
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
            if (uploadFileOk === 0){
                res.send('Sorry, your files was not uploaded.');
            } else {
                newPath+= singleFile.originalFilename;
                readAndWriteFile(singleFile, newPath);
                tempArray.push({
                    "Name:"  : doc_names[k],
                    "Url:"  : 'http://' + hostname + '/uploads/documents/' + filesArray[k].originalFilename
                });
                documentsArray.push( doc_types[k] + ":" + json_encode(tempArray));
            }
        }
        console.log(util.inspect( documentsArray, {depth: null}));
        let docs_json = '"Documents":' + json_encode(documentsArray);


        // Attributes
        let attr_names = fields.attribNames;
        let attr_values = fields.attribValues;
        let array = [];
        for (let i = 0; i < attr_names.length; i++) {
            array.push(
                attr_names[i] + ':' + attr_values[i]
            );
        }
        let attr_json = '"Attributes":{' + json_encode(array);
        console.log('attrjson: ' + util.inspect(attr_json));



        const dkj_json = image_json + ','  + docs_json + ',' + attr_json;
        const sij_json = image_json + ','  + docs_json;
        const query = {
            text: 'insert into xproduct_202008041139(partnumber, description, detaileddescription,sij,dkj) VALUES($1,$2,$3,$4,$5)',
            values: [partnumber[0],description[0],detaileddescription[0],sij_json,dkj_json],
        };
        client.query(query, (err, res) => {
            if (err) {
                console.log(err.stack)
            } else {
                console.log(res.rows[0])
            }
        });

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