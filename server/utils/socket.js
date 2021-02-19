const expressApp = require('./expressApp')();
const io = expressApp.io;

const MySocket = {
    emit: function (event, data) {
        io.sockets.emit(event, data);
    },
};

module.exports = {
    MySocket,
    io
}