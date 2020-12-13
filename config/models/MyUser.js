let {connection} = require('../db/orm-dev');
const Sequelize  = require('sequelize');



const MyUser = connection.define("MyUser", {
    // uuid: {
    //     type: Sequelize.UUID,
    //     primaryKey:true,
    //     defaultValue:Sequelize.UUIDV4
    // },
    email:{
        type: Sequelize.STRING,
        validate: {
            max: 20,
            isEmail: true
        }
    },
    first: Sequelize.STRING,
    last: Sequelize.STRING,
    full_name: Sequelize.STRING,
    bio:{
        type: Sequelize.TEXT,
        // validate: {
        // 	contains:{
        // 		args: ['foo'],
        // 		msg: 'Error'
        // 	}
        // }
    },
    password: Sequelize.STRING
},{
    hooks: {
        beforeValidate: () => {
            console.log('before validate');
        },
        afterValidate: () => {
            console.log('after validate');
        },
        beforeCreate: (user) => {
            user.full_name = `${user.first} ${user.last}`
            console.log('before create');
        },
        afterCreate: () => {
            console.log('after create');
        }
    },
    timestamps:true
});


module.exports = {
    MyUser
};
