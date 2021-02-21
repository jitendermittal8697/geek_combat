const readFile = require('fs-readfile-promise');
const ejs = require('ejs');
const { User } = require('../model/user')
const { Chat } = require('../model/chat')
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
        console.log('>>>',online_users)
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

const compileSingleChatTemplate = async (req, res) => {
    let selfUuid = req.session.userDetails.uuid;
    // let friendUuid = req.session.userDetails.uuid;
    if (selfUuid) {
        let ChatModel = await Chat();
        let UserModel = await User();

        let friendDetails = await UserModel.findAll({
            where: {
                uuid: Object.keys(online_users).filter(function(item) {
                    return item !== selfUuid
                })
            }
        });
        let chatDetails = await ChatModel.findAll({
            where: {
                to: ['7a96aaf6-7ed2-4c06-95e3-794c89d452e0', '6e351c95-82a5-4576-9d81-2392b1d88d7a'],
                from: ['7a96aaf6-7ed2-4c06-95e3-794c89d452e0', '6e351c95-82a5-4576-9d81-2392b1d88d7a']
            },
            order: [
                ['createdAt', 'ASC'],
            ],
        });
        // console.log(chatDetails)
        try {
            let path = __dirname + "/../views/partials/chatBody.ejs"
            const chatInterfaceFile = await readFile(path, 'utf-8')
            const chatInterfaceTemplate = ejs.compile(chatInterfaceFile, {
                filename: path
            })
            const html = chatInterfaceTemplate({ friend:friendDetails[0], chats: chatDetails })
            res.send({html: html})
        }
        catch (error) {
            console.log(error)
            res.status(500).send({error: error});
        }
    }
    else {
        console.log("Error Fetching Chats Of The Users")
        res.status(500).send({html: "Error Fetching Data Of The User"})
    }
}

module.exports = {
    compileFriendListTemplate,
    compileSingleChatTemplate
}