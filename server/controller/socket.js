const connect = (object) => {
    let uuid = object.userDetails[0]["uuid"];
    return (socket) => {
        console.log(uuid + ' connected');
        socket.on('disconnect', () => {
            console.log(uuid + ' disconnected');
        })
    }
}

module.exports = {
    connect
}