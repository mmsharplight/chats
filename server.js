var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];

app.use('/', express.static(__dirname + '/chat'));
// 连接端口3000
server.listen(process.env.PORT || 3000);

io.sockets.on('connection', function(socket) {
    // 检测昵称重复
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    // 用户离开
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //得到新的信息
    socket.on('postMsg', function(msg, color) {

        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //得到新的图片
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});
