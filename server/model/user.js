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
            friend_list: {
                type: Sequelize.STRING,
                get() {
                    return this.getDataValue('friend_list') != null ? this.getDataValue('friend_list').split(';') : "";
                },
                set(val) {
                    this.setDataValue('friend_list', val.join(';'));
                },
            },
            group_list: {
                type: Sequelize.STRING,
                get() {
                    return this.getDataValue('group_list') != null ? this.getDataValue('group_list').split(';') : "";
                },
                set(val) {
                    this.setDataValue('group_list', val.join(';'));
                },
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        }, {
            tableName: 'users'
        });

        User.sync({ alter: true })
        // User.sync()

        return User;

    }
    catch (error) {
        console.log(error)
    }

};

module.exports = {
    User: UserModel,
}