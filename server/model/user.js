const { DataTypes, Sequelize } = require('sequelize');
var { dbconn } = require('../utils/dbconn')


const UserModel = async () => {

    try {
        const sequelize = await dbconn()

        const User = sequelize.define('User', {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            profile_image: {
                type: DataTypes.STRING,
                allowNull: false
            },
            gender: {
                type: DataTypes.ENUM,
                values: ['male', 'female'],
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
        }, {
            tableName: 'users'
        });

        // User.sync({ alter: true })
        User.sync()

        return User;

    }
    catch (error) {
        console.log(error)
    }

};

module.exports = {
    User: UserModel,
}