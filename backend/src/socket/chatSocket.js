import { createMessage } from "../controllers/messageControllers.js";

const onlineUsers = new Map();

export default (io)=>{
    io.on('connection', (socket)=>{
        let connectUserId = null;

        socket.on("user-online", (userId)=>{
            connectUserId = userId;
            onlineUsers.set(userId, socket.id);

            io.emit("online-users", Array.from(onlineUsers.keys()));
        });

        //gestion des users qui écrit
        socket.on("typing", (data)=>{
            socket.broadcast.emit("typing", data);
        });

        socket.on("stop-typing", (data)=>{
            socket.broadcast.emit("stop-typing", data);
        });

        //message envoyer
        socket.on("send-message", async(msg)=>{
            
            const savedMessage = await createMessage(msg);

            io.emit("new-message", savedMessage);

            //update-chat-list en temps réel
            io.emit("update-chat-list", savedMessage);
        });

        //message reçu
        socket.on("message-delivered", ({messageId})=>{
            io.emit("message-status", {
                messageId,
                status: "delivered"
            });
        });

        //message lu par l'users
        socket.on("message-read", ({conversationId})=>{
            io.emit("message-read-update", {
                conversationId,
                status: "read"
            });
        });

        //disconnect
        socket.on("disconnect", ()=>{
            if(connectUserId){
                onlineUsers.delete(connectUserId);
                //mise à jour users connecter
                io.emit("online-users", Array.from(onlineUsers.keys()));
            }
        });


    });

}
