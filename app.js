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
const { compileFriendListTemplate } = require('./server/controller/compileTemplates')


const { io } = require('./server/utils/socket')
const { online_users } = require('./server/utils/onlineUser')
const { User } = require('./server/model/user')
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

app.post('/refresh-friend-list', compileFriendListTemplate)

// app.all('*', redirectUserCallback)
io.on('connection', (socket) => {

    socket.on('client_joined', async (data) => {

        let userid = data.uuid;
        online_users[userid] = {
            "uuid": userid,
            "socket_id": socket.id
        }

        socket.broadcast.emit('client_connected', {});
        console.log("After Connection", online_users)
    })

    socket.on('disconnect', async () => {

        if (!_.isEmpty(online_users)) {
            let disconnectedUuid;
            for (const uuid in online_users) {
                if (socket.id == online_users[uuid]["socket_id"]) {
                    disconnectedUuid = online_users[uuid]["uuid"];
                    delete online_users[uuid]
                }
            }

            let UserModel = await User();
            await UserModel.update({
                last_login: new Date((new Date()).getTime() + 19800000),
            }, {
                where: { uuid: disconnectedUuid }
            });

            socket.broadcast.emit('client_disconnected', {});
            socket.disconnect(true)
            console.log("After Disconnection", online_users)
        }
    })

});


http.listen(PORT, function () {
    console.log(`Geek Combat Chat App is listening on PORT ${PORT}`)
})