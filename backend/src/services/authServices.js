import bcrypt from 'bcrypt';
import { findUserByName, createUser } from '../models/authModels.js';
import jwt from 'jsonwebtoken';

export const registerService = async(data)=>{
    const {name, email, password, phone} = data;

    const existingUser = await findUserByName(name);
    if(existingUser){
        throw new Error("Cet Utilisateur existe déjà");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await createUser({name, email, password: hashPassword, phone});

    return {message: "Utilisateurs créer avec succès"}
}

export const loginService = async(data)=>{
    const {name, password} = data;

    const user = await findUserByName(name);
    if(!user){
        throw new Error("Utilisateur introuvable: veuillez vérifier votre nom");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid){
        throw new Error("le mot de passe incorrect")
    }

    const token = jwt.sign(
        {id: user.id_users, name: user.username, email: user.email},
        process.env.JWT_SECRET,
        {algorithm: "HS256", expiresIn: "1d"}
    );

    return {
        token,
        user:{
            id: user.id_users,
            name: user.username,
            email: user.email
        }
    };
}