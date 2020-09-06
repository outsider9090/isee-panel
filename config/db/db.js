const {Client} = require('pg');


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '172839',
    port: 5432
});
client.connect();


module.exports = {
    client,
    query: (text, params, callback) => {
        return client.query(text, params, callback)
    }
};
