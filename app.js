const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express()
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { signup, login } = require('./server/controller/user');
const { redirectUserCallback } = require('./server/middleware/restrictAccess')
const { sign } = require('crypto');

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


app.post('/action', login(io))


app.get('/signup', redirectUserCallback)

app.use(function (req, res, next) {
    if (!req.session.userDetails) {
        res.redirect('/signup');
    }
    else {
        next()
    }
});

app.get('/chats', function (req, res) {
    res.render('pages/index', { data: req.session });
})

app.all('*', redirectUserCallback)


http.listen(PORT, function () {
    console.log(`Geek Combat Chat App is listening on PORT ${PORT}`)
})