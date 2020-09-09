const {Client} = require('pg');


const client = new Client({
    // user: 'aliturbo',
    // host: '95.217.191.187',
    // database: 'zbot',
    // password: '2qidDnY0gFoW6nW',
    // port: 5432
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '172839',
    port: 5432
});
client.connect();

global.PRODUCT_TABLE_NAME = 'xproducts';
global.USERS_TABLE_NAME = 'users';


module.exports = {
    client,
    query: (text, params, callback) => {
        return client.query(text, params, callback)
    }
};


