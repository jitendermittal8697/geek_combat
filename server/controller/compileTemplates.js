const readFile = require('fs-readfile-promise');
const ejs = require('ejs');
const { User } = require('../model/user')
const { Chat } = require('../model/chat')
const { online_users } = require('../utils/onlineUser')
const { Sequelize, QueryTypes } = require('sequelize');
var { dbconn } = require('../utils/dbconn')

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

        let UserModel = await User();
        const sequelize = await dbconn()

        let othersDetails = await UserModel.findAll({
            where: {
                uuid: { [Sequelize.Op.not]: uuid }
            }
        })

        let selfDetails = await UserModel.findAll({
            where: {
                uuid: uuid
            }
        });

        let latestChats = `SELECT
            \`to\`,
            \`from\`,
            \`msg_type\`,
            \`message\`,
            \`createdAt\`
        FROM
            chat
        where
            createdAt IN (
            select
                DISTINCT(GREATEST(t1.createdAt, t2.createdAt))
            FROM
                (
                SELECT
                    m.to,
                    m.from,
                    \`msg_type\`,
                    \`message\`,
                    \`createdAt\`
                FROM
                    chat AS m
                    INNER JOIN (
                    SELECT
                        \`to\`,
                        \`from\`,
                        MAX(STR_TO_DATE(\`createdAt\`, '%Y-%m-%d %H:%i:%s')) AS maxDate
                    FROM
                        chat
                    GROUP BY
                        \`to\`,
                        \`from\`
                    ORDER BY
                        maxDate DESC
                    ) AS l ON l.to = m.to
                    AND l.from = m.from
                    AND l.maxDate = STR_TO_DATE(m.\`createdAt\`, '%Y-%m-%d %H:%i:%s')
                WHERE
                    m.to = '${uuid}'
                    OR m.from = '${uuid}'
                ) t1
                INNER JOIN (
                SELECT
                    m.to,
                    m.from,
                    \`msg_type\`,
                    \`message\`,
                    \`createdAt\`
                FROM
                    chat AS m
                    INNER JOIN (
                    SELECT
                        \`to\`,
                        \`from\`,
                        MAX(STR_TO_DATE(\`createdAt\`, '%Y-%m-%d %H:%i:%s')) AS maxDate
                    FROM
                        chat
                    GROUP BY
                        \`to\`,
                        \`from\`
                    ORDER BY
                        maxDate DESC
                    ) AS l ON l.to = m.to
                    AND l.from = m.from
                    AND l.maxDate = STR_TO_DATE(m.\`createdAt\`, '%Y-%m-%d %H:%i:%s')
                WHERE
                    m.to = '${uuid}'
                    OR m.from = '${uuid}'
                ) t2
            WHERE
                t1.to = t2.from
                AND t1.from = t2.to
        )`;

        const friendChats = await sequelize.query(latestChats, { type: QueryTypes.SELECT });
        console.log(friendChats);

        var friendListArray = selfDetails[0].friend_list

        let sortedUserDetails = othersDetails.sort(function (a, b) {
            return friendListArray.indexOf(a.uuid) - friendListArray.indexOf(b.uuid);
        });
        console.log(sortedUserDetails)


        for (friendKey in friendChats) {
            if (friendChats[friendKey]['from'] != uuid) {
                for (sortedUserKey in sortedUserDetails) {
                    if (sortedUserDetails[sortedUserKey]['uuid'] == friendChats[friendKey]['from']) {
                        sortedUserDetails[sortedUserKey]['chat'] = friendChats[friendKey]
                    }
                }
            }
            else {
                for (sortedUserKey in sortedUserDetails) {
                    if (sortedUserDetails[sortedUserKey]['uuid'] == friendChats[friendKey]['to']) {
                        sortedUserDetails[sortedUserKey]['chat'] = friendChats[friendKey]
                    }
                }
            }
        };

        console.log(sortedUserDetails);


        const result = compileTemplate({
            path: __dirname + "/../views/partials/friendList.ejs",
            templateData: { friends: sortedUserDetails, onlineUsers: online_users },
        })

        result.then(function (data) {
            if (!data.response) res.status(500).send({ html: data.error })
            res.send({ html: data.data })
        }).catch(function (error) {
            res.status(500).send({ html: error })
        })


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

        result.then(function (data) {
            if (!data.response) res.status(500).send({ html: data.error })
            res.send({ html: data.data })
        }).catch(function (error) {
            res.status(500).send({ html: error })
        })

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

        result.then(function (data) {
            if (!data.response) res.status(500).send({ html: data.error })
            res.send({ html: data.data })
        }).catch(function (error) {
            res.status(500).send({ html: error })
        })

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