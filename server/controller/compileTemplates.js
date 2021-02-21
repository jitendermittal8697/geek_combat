const readFile = require('fs-readfile-promise');
const ejs = require('ejs');
const { User } = require('../model/user')
const { online_users } = require('../utils/onlineUser')

const compileFriendListTemplate = async (req, res) => {

    let uuid = req.session.userDetails.uuid;
    if (uuid) {
        // let UserModel = await User();

        // let userDetails = await UserModel.findAll({
        //     where: {
        //         uuid: Object.keys(online_users).filter(function(item) {
        //             return item !== uuid
        //         })
        //     }
        // });

        let userDetails =  Object.values(online_users).filter(function (item) {
            return item.uuid !== uuid
        })

        try {
            let path = __dirname + "/../views/partials/friendList.ejs"
            const friendListFile = await readFile(path, 'utf-8')
            const friendListTemplate = ejs.compile(friendListFile, {
                filename: path
            })
            const html = friendListTemplate({ friends: userDetails })
            res.send({ html: html })
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ error: error });
        }
    }
    else {
        console.log("Error Fetching Session Of The User")
        res.status(500).send({ html: "Error Fetching Session Of The User" })
    }
}

module.exports = {
    compileFriendListTemplate
}