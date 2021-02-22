const readFile = require('fs-readfile-promise');
const ejs = require('ejs');
const { User } = require('../model/user')
const { Chat } = require('../model/chat')
const { online_users } = require('../utils/onlineUser')

async function compileTemplate(data) {
    try {
        let path = data.path;
        const file = await readFile(path, 'utf-8')
        const fileTemplate = ejs.compile(file, {
            filename: path
        })
        const html = fileTemplate(data.templateData)
        return {
            response: true,
            data: html,
        }
    }
    catch (error) {
        console.log(error)
        return {
            response: false,
            error: error,
        }
    }
}


const compileFriendListTemplate = async (req, res) => {

    let uuid = req.session.userDetails.uuid;
    if (uuid) {
        let userDetails = Object.values(online_users).filter(function (item) {
            return item.uuid !== uuid
        })

        const result = compileTemplate({
            path: __dirname + "/../views/partials/friendList.ejs",
            templateData: { friends: userDetails },
        })
        if (result.response) {
            res.send({ html: result.data })
        }
        res.status(500).send({ html: result.error })

    }
    else {
        res.status(401).send({ html: "SESSION ID MISSING" })
    }
}

const compilePrivateChatBodyTemplate = async (req, res) => {
    let selfUuid = req.session.userDetails.uuid;
    if (selfUuid) {
        let data = req.body.data;
        let ChatModel = await Chat();
        let UserModel = await User();

        let friendDetails = await UserModel.findAll({
            where: {
                uuid: Object.keys(online_users).filter(function (item) {
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

        const result = compileTemplate({
            path: __dirname + "/../views/partials/chatBody.ejs",
            templateData: { friend: friendDetails[0], chats: chatDetails },
        })
        if (result.response) {
            res.send({ html: result.data })
        }
        res.status(500).send({ html: result.error })

    }
    else {
        res.status(401).send({ html: "SESSION ID MISSING" })
    }
}

const compileChatInterfaceTemplate = async (req, res) => {
    let selfUuid = req.session.userDetails.uuid;
    if (selfUuid) {
        let data = req.body.data;
        let ChatModel = await Chat();
        let UserModel = await User();

        let friendDetails = await UserModel.findAll({
            where: {
                uuid: data.friendDetails.uuid
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

        const result = compileTemplate({
            path: __dirname + "/../views/partials/chatInterface.ejs",
            templateData: { friend: friendDetails[0], chats: chatDetails },
        })
        if (result.response) {
            res.send({ html: result.data })
        }
        res.status(500).send({ html: result.error })

    }
    else {
        res.status(401).send({ html: "SESSION ID MISSING" })
    }
}

module.exports = {
    compileFriendListTemplate,
    compilePrivateChatBodyTemplate,
    compileChatInterfaceTemplate
}