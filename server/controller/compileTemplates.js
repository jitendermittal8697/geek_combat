const readFile = require('fs-readfile-promise');
const ejs = require('ejs');
const { User } = require('../model/user')

const compileFriendListTemplate = async (req, res) => {

    let uuid = req.session.userDetails.uuid;

    let UserModel = await User();

    let userObj = {
        uuid: uuid,
    }

    let userDetails = await UserModel.findAll({
        where: userObj
    });

    try {
        let path = __dirname + "/../views/partials/friendList.ejs"
        const friendListFile = await readFile(path, 'utf-8')
        const friendListTemplate = ejs.compile(friendListFile, {
            filename: path
        })
        const html = friendListTemplate({ friends: userDetails })
        res.send({html: html})
    }
    catch (error) {
        console.log(error)
        res.status(500).send({error: error});
    }

}

module.exports = {
    compileFriendListTemplate
}