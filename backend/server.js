import app from './src/routes/app.js';
import dotenv from 'dotenv';
import socketHandler from './src/socket/chatSocket.js';
import http from 'http';
import {Server} from 'socket.io';

dotenv.config();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin: process.env.HOST,
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 300 * 1024 * 1024
}
);

//injection de l'instance io
socketHandler(io);
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>{
    console.log(`le serveur démarre sur le port : ${PORT}`);
    
});
