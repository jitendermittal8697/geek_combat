const { User } = require('../model/user')
const { io } = require('../utils/socket')
const online_users = {};

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

            online_users[uuid] = {
                "name": userDetails[0]["username"],
                'uuid': uuid,
            }

            io.on('connection', (userDetails) => {
                let uuid = userDetails[0]["uuid"];
                return (socket) => {
                    console.log(uuid + ' connected');
                    socket.broadcast.emit('client_joined', {uuid: uuid});
                    socket.on('disconnect', () => {
                        console.log(uuid + ' disconnected');
                    })
                }
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