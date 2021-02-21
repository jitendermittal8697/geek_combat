const express = require('express');
const http = require('http');
const socketio = require('socket.io');
var cookie = require("cookie");

let io;
let app;
let server;
module.exports = () => {
    app = app || express()
    server = server || http.Server(app)
    io = io || socketio(server)
    return {
        express,
        app,
        http: server,
        io,
        cookie
    }
}