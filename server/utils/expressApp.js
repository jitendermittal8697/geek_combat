const express = require('express');
const http = require('http');
const socketio = require('socket.io');

let io;
let app;
let server;
module.exports = () => {
    app = app || express()
    server = server || http.Server(app)
    io = io || socketio(http)
    return {
        express,
        app,
        http: server,
        io
    }
}