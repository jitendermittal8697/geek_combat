const { User } = require('../model/user')
const { io } = require('../utils/socket')
const { online_users } = require('../utils/onlineUser')
const { Sequelize } = require('sequelize');

const signup = async (req, res) => {

    try {
        const userModel = await User();

        const userObj = {
            username: req.body.username,
            password: req.body.password,
            gender: 'male',
            profile_image: '/images/male_avatar.png',
        }

        await userModel.create(userObj)
        login(req, res);
    }
    catch (error) {
        console.log(error);
    }
}

const login = async (req, res) => {

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
                socket.on('disconnect',async () => {
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
    signup,
    login,
}