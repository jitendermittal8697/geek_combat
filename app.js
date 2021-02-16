const express = require('express');
const app = express()
const debug = require('debug')('geek_combat:app.js');
const path = require('path');

app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, '/server/resources')))
app.use('/images', express.static(path.join(__dirname, '/server/public/images')))

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.render('index');
})

app.listen(PORT, function () {
    debug(`Geek Combat Chat App is listening on PORT ${PORT}`)
})