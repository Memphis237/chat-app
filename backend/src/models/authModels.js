import db from '../config/db.js';

export const findUserByName = (name)=>{
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM users WHERE username = ?";
        db.query(sql, [name], (err, data)=>{
            if(err) reject(err);
            else resolve(data[0]);
        });
    });
}

export const createUser = (user)=>{
    const {name, email, password, phone, avatar = null} = user;
    return new Promise((resolve, reject)=>{
        const sql = "INSERT INTO users (username, email, password, telephone, avatar) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [name, email, password, phone, avatar], (err, result)=>{
            if(err) reject(err);
            else resolve(result)
        });
    });
}
