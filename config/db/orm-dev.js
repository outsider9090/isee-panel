const Sequelize  = require('sequelize');


const connection = new Sequelize('postgres','postgres','172839',{
    host:'localhost',
    port:5432,
    dialect: 'postgres',
    define: {
        freezeTableName: false
    }
});


module.exports = {
    connection
};


