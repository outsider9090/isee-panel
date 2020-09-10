const elasticsearch = require('elasticsearch');
const esclient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.x', // use the same version of your Elasticsearch instance
});


global.ES_INDEX = 'myproducts21';
global.ES_TYPE = '_doc';

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


