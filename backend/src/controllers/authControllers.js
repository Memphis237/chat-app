import { registerService, loginService } from "../services/authServices";

const register = async(req, res)=>{
    try{
        const result = await registerService(req.body);
        res.status(201).json(result);
    }catch(err){
        res.status(400).json({message: err.message});
    }
}

const login = async(req, res)=>{
    try{
        const result = await loginService(req.body);
        res.status(200).json(result);
    }catch(err){
        res.status(401).json({message: err.message});
    }
}