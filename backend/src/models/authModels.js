import db from '../config/db.js';

export const findUserByName = (name)=>{
    return new Promise((resolve, reject)=>{
        const sql = "SELECT username FROM users WHERE username = ?";
        db.query(sql, [name], (err, data)=>{
            if(err) reject(err);
            else resolve(data[0]);
        });
    });
}

export const createUser = (user)=>{
    const {name, email, password, phone} = user;
    return new Promise((resolve, reject)=>{
        const sql = "INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, email, password, phone], (err, result)=>{
            if(err) reject(err);
            else resolve(result)
        });
    });
}