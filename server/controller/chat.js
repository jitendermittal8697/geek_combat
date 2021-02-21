const { User } = require('../model/user')
const { Chat } = require('../model/chat')
const { io } = require('../utils/socket')
const { online_users } = require('../utils/onlineUser')
const { Sequelize } = require('sequelize');

const sendMessage = async (req, res) => {

    try {
        const chatModel = await Chat();

        const userObj = {
            from: req.body.from,
            to: req.body.to,
            msg_type: 'text',
            message: req.body.message,
        }

        await chatModel.create(userObj)
        // receiveMessage(req, res);
    }
    catch (error) {
        console.log(error);
    }
}

const receiveMessage = async (req, res) => {

    try {
        let UserModel = await User();

        let userObj = {
            username: req.body.username,
            password: req.body.password,
        }

        let userDetails = await UserModel.findAll({
            where: userObj
        });

        if (userDetails.length) {

            let uuid = userDetails[0]["uuid"]
            req.session.userDetails = userDetails[0];

            io.on('connection', (socket) => {

                online_users[uuid] = {
                    "name": userDetails[0]["username"],
                    'uuid': uuid,
                }

                console.log(uuid + ' connected');
                io.emit('client_connected', { uuid: uuid });
                socket.on('disconnect', async () => {
                    delete online_users[uuid];
                    await UserModel.update({
                        last_login: new Date((new Date()).getTime() + 19800000),
                    }, {
                        where: { uuid: uuid }
                    });

                    io.emit('client_disconnected', { uuid: uuid });

                    console.log(uuid + ' disconnected');
                })
            });

            res.redirect('/chats');
        }
        else {
            res.redirect('/signup');
        }
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    sendMessage,
    receiveMessage,
}