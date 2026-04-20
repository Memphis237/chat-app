import app from './src/routes/app';
import dotenv from 'dotenv';

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`le serveur démarre sur le port : ${PORT}`);
    
});