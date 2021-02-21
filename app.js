const expressApp = require('./server/utils/expressApp')();
const app = expressApp.app;
const express = expressApp.express;
const http = expressApp.http;

const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const { signup, login } = require('./server/controller/user');
const { sendMessage, receiveMessage } = require('./server/controller/chat');
const { redirectUserCallback, checkSession } = require('./server/middleware/restrictAccess')
const { compileFriendListTemplate, compileSingleChatTemplate } = require('./server/controller/compileTemplates')


const { io } = require('./server/utils/socket')
const { online_users } = require('./server/utils/onlineUser')

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
app.post('/refresh-message-list', compileSingleChatTemplate)

// app.all('*', redirectUserCallback)


http.listen(PORT, function () {
    console.log(`Geek Combat Chat App is listening on PORT ${PORT}`)
})