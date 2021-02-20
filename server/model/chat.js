const { DataTypes, Sequelize } = require('sequelize');
var { dbconn } = require('../utils/dbconn')


const ChatModel = async () => {

    try {
        const sequelize = await dbconn()

        const Chat = sequelize.define('Chat', {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            from: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            to: {
                type: DataTypes.STRING,
                allowNull: false
            },
            msg_type: {
                type: DataTypes.ENUM,
                values: ['text', 'audio', 'file'],
                allowNull: false
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false
            },
        }, {
            indexes: [
                { unique: true, fields: ['uuid'] }
            ],
            tableName: 'chat',
            timezone: 'Asia/Calcutta', dialectOptions: { timezone: 'Asia/Calcutta', },
        });

        Chat.sync({ alter: true })
        // Chat.sync()

        return Chat;

    }
    catch (error) {
        console.log(error)
    }

};

module.exports = {
    Chat: ChatModel,
}