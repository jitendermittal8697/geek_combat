const readFile = require('fs-readfile-promise');
const ejs = require('ejs');
const { User } = require('../model/user')
const { Chat } = require('../model/chat')
const { online_users } = require('../utils/onlineUser')

const compileFriendListTemplate = async (req, res) => {

    let uuid = req.session.userDetails.uuid;
    if (uuid) {
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
    let data = req.body.data;
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
                to: [data.selfDetails.uuid, data.friendDetails.uuid],
                from: [data.selfDetails.uuid, data.friendDetails.uuid]
            },
            order: [
                ['createdAt', 'ASC'],
            ],
        });

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
        res.status(500).send({html: "Error Fetching Chats Of The User"})
    }
}

const compileFriendChatTemplate = async (req, res) => {
    let selfUuid = req.session.userDetails.uuid;

    let data = req.body.data;

    if (selfUuid) {
        let ChatModel = await Chat();
        let UserModel = await User();

        let friendDetails = await UserModel.findAll({
            where: {
                uuid: data.friendDetails.uuid
            }
        });
        console.log(friendDetails);
        let chatDetails = await ChatModel.findAll({
            where: {
                to: [data.selfDetails.uuid, data.friendDetails.uuid],
                from: [data.selfDetails.uuid, data.friendDetails.uuid]
            },
            order: [
                ['createdAt', 'ASC'],
            ],
        });

        console.log(chatDetails);
        try {
            let path = __dirname + "/../views/partials/chatInterface.ejs"
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
        res.status(500).send({html: "Error Fetching Chats Of The User"})
    }
}

module.exports = {
    compileFriendListTemplate,
    compileSingleChatTemplate,
    compileFriendChatTemplate
}