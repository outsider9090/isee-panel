const elasticsearch = require('elasticsearch');
const esclient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.x', // use the same version of your Elasticsearch instance
});


/* For develop */
global.ES_INDEX = 'myproducts21';
global.ES_TYPE = '_doc';
global.BB_KEY_ID = '002a40660e78bfd0000000001';
global.BB_APP_KEY = 'K002XRhYXLQ4J4WlJ1YofNPuPFRUs2s';
global.BB_BUCKET_ID = 'ea9400e606908e17784b0f1d';
global.BB_SITE_UPLOAD_URL = 'https://f002.backblazeb2.com/file/zmedia/ufiles/';
global.BB_FILE_URL = 'https://f002.backblazeb2.com/file/nodejs/zmedia/ufiles/';
global.BB_SITE_UPLOAD_URL_PREFIX = 'zmedia/ufiles/';
global.BB_SPLIT_INDEX = 7;



module.exports = {
    esclient,
    search: (text, params, callback) => {
        return esclient.search(text, params, callback)
    },
    delete: (text, params, callback) => {
        return esclient.delete(text, params, callback)
    },
    update: (text, params, callback) => {
        return esclient.update(text, params, callback)
    },
    index: (text, params, callback) => {
        return esclient.index(text, params, callback)
    }
};


