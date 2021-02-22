const expressApp = require('./server/utils/expressApp')();
const app = expressApp.app;
const express = expressApp.express;
const http = expressApp.http;
const cookie = expressApp.cookie;

const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const { signup, login } = require('./server/controller/user');
const { redirectUserCallback, checkSession } = require('./server/middleware/restrictAccess')
const { compileFriendListTemplate, compilePrivateChatBodyTemplate, compileChatInterfaceTemplate } = require('./server/controller/compileTemplates')

const { io } = require('./server/utils/socket')
const { online_users } = require('./server/utils/onlineUser')
const { User } = require('./server/model/user')
const { Chat } = require('./server/model/chat')
const _ = require('lodash')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));

app.use('/static', express.static(path.join(__dirname, '/server/public/css')))
app.use('/images', express.static(path.join(__dirname, '/server/public/images')))


app.post('/action', login)
app.get('/signup', redirectUserCallback)

app.use(checkSession);

app.get('/chats', function (req, res) {
    res.render('pages/index', { appData: { name: process.env.APP_NAME }, data: req.session });
})

app.post('/compile/template/friend-list', compileFriendListTemplate)
app.post('/compile/template/chat-body', compilePrivateChatBodyTemplate)
app.post('/compile/template/chat-interface', compileChatInterfaceTemplate)

// app.all('*', redirectUserCallback)
io.on('connection', (socket) => {

    async function insertTextChat(chatObj) {
        let ChatModel = await Chat();
        await ChatModel.create(chatObj);
    }

    async function updateLastLogin(uuid) {
        let UserModel = await User();
        await UserModel.update({
            last_login: new Date((new Date()).getTime() + 19800000),
        }, {
            where: { uuid: uuid }
        });
    }

    async function updateFriendListOrder(uuid) {
        try {
            let UserModel = await User();
            let self = await UserModel.findOne({
                where: { uuid: uuid }
            });
            console.log("????????", online_users[uuid]['friend_list']);
            self.friend_list = online_users[uuid]['friend_list']
            self.save()
        }
        catch (error) {
            console.log(error)
        }
    }

    async function addToFriendList(data) {
        try {
            let UserModel = await User();

            let record = await UserModel.findOne({ where: { uuid: data.senderUuid } });
            record.friend_list = data.receiverUuid;
            await record.save();

            record = await UserModel.findOne({ where: { uuid: data.receiverUuid } });
            record.friend_list = data.senderUuid;
            await record.save();
        }
        catch (error) {
            console.log(error);
        }
    }

    socket.on('connecting', async (data) => {

        let userid = data.uuid;
        let UserModel = await User();
        let userDetails = await UserModel.findAll({
            where: { uuid: userid }
        });

        online_users[userid] = {
            "uuid": userid,
            "socket_id": socket.id,
            "username": userDetails[0].username,
            "profile_image": userDetails[0].profile_image,
            "friend_list": userDetails[0].friend_list,
        }

        io.emit('connect_client', {});
        console.log("After Connection", online_users)
    })


    socket.on('send_text_message', async (data) => {

        let senderUuid = data.selfDetails.uuid;
        let receiverUuid = data.friendDetails.uuid;
        let receiverSocketID = online_users[receiverUuid]["socket_id"];
        let senderName = online_users[senderUuid]['username'];
        let msgType = data.msgDetails.messageType;
        let msg = data.msgDetails.message;

        insertTextChat({
            from: senderUuid,
            to: receiverUuid,
            msg_type: msgType,
            message: msg,
        })


        if (online_users[senderUuid]["friend_list"].indexOf(receiverUuid) == -1) {
            addToFriendList({
                senderUuid: senderUuid,
                receiverUuid: receiverUuid,
            })
        }
        online_users[senderUuid]["friend_list"] = [...new Set([receiverUuid, ...new Set(online_users[senderUuid]["friend_list"])])]

        io.to(receiverSocketID).emit('trigger_text_message', { name: senderName, message: msg, type: msgType });
        console.log("After Connection", online_users)
    })


    socket.on('disconnect', async () => {

        if (!_.isEmpty(online_users)) {
            let disconnectedUuid;
            for (const uuid in online_users) {
                if (socket.id == online_users[uuid]["socket_id"]) {
                    disconnectedUuid = online_users[uuid]["uuid"];
                }
            }

            updateLastLogin(disconnectedUuid)
            updateFriendListOrder(disconnectedUuid)
            delete online_users[uuid]
            socket.broadcast.emit('disconnect_client', {});
            socket.disconnect(true)
            console.log("After Disconnection", online_users)
        }
    })

});


http.listen(PORT, function () {
    console.log(`Geek Combat Chat App is listening on PORT ${PORT}`)
})