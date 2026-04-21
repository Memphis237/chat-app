import app from './src/routes/app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`le serveur démarre sur le port : ${PORT}`);
    
});