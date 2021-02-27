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
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
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
            friend_list: {
                type: Sequelize.STRING(5000),
                get() {
                    if (this.getDataValue('friend_list') != null) {
                        return this.getDataValue('friend_list').split(';')
                    }
                    return "";
                },
                set(val) {
                    if (this.getDataValue('friend_list') == null) {
                        this.setDataValue('friend_list', val)
                    }
                    else {
                        if (val.split(',').join(';').indexOf(";") != -1) {
                            this.setDataValue('friend_list', val.split(',').join(';'))
                        }
                        else if (this.getDataValue('friend_list').indexOf(val) == -1) {
                            this.setDataValue('friend_list', val + ";" + this.getDataValue('friend_list'))
                        }
                    }
                },
            },
            group_list: {
                type: Sequelize.STRING(5000),
                get() {
                    return this.getDataValue('group_list') != null ? this.getDataValue('group_list').split(';') : "";
                },
                set(val) {
                    this.setDataValue('group_list', this.getDataValue('group_list') == null ? val : this.getDataValue('group_list') + ';' + val);
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
                defaultValue: new Date((new Date()).getTime() + 19800000)
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: new Date((new Date()).getTime() + 19800000)
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: new Date((new Date()).getTime() + 19800000)
            }
        }, {
            indexes: [
                { unique: true, fields: ['username'] },
                { unique: true, fields: ['uuid'] }
            ],
            tableName: 'users',
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