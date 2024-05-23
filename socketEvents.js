// socketEvents.js
module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('A user co2222nnected');
     socket.on('mobile-action', (data) => {
      io.emit(data.action, data);
    });

    socket.on('image-selected', (data) => {
      // 廣播消息到所有連接的客戶端，除了發送者
      // socket.broadcast.emit('image-selection-changed', data);
      io.emit('image-selection-changed', data);
    });

    socket.on('control-action', (data) => {
      // 廣播控制信號到所有客戶端
      io.emit('control-action', data);
    });
    socket.on('close-action', (data) => {
     
      io.emit('close-action', data);
    });

    socket.on('Midjourney-action', (data) => {
     
      io.emit('Midjourney-action', data);
    });

    socket.on('Phone-controller', (data) => {
     
      io.emit('Phone-controller', data);
    });

    

    // 添加更多的事件监听器...
  });
};
