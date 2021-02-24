const { User } = require('../model/user')

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
            req.session.userDetails = userDetails[0];
            res.redirect('/chats');
        }
        else {
            res.redirect('/geek-combat');
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