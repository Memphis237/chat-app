import React, {useState} from "react";


export function Login(){
    const [isLogin, setIsLogin] = useState(true);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");

    const sendForm = (e) =>{
        e.preventDefault();

        if(password !== confirmPassword){
            setConfirmPassword("Les mots de passes ne correspondent pas !");
            return;
        }
        if(password.length < 8){
            setError("Le mot de passe doit contenir aumoins 8 caractères !");
            return;
        }
    }
    

    return <div className="bg-[#0D1528] min-h-screen flex justify-center items-center overflow-x-auto py-10">
        <form onSubmit={sendForm} className="flex flex-col justify-center items-center bg-[#0E162A] w-[500px] rounded-t-2xl border">
            <div className="bg-[#009C5C] w-[500px] p-8 flex flex-col justify-center items-center rounded-t-2xl">
                <span className="bg-[#33B277] rounded-3xl px-3 py-2 mb-2 w-[100px] h-[100px] flex justify-center items-center"><i className="fa fa-comment-o text-5xl text-[#ffff]" aria-hidden="true"></i></span>
                <h1 className="text-white text-4xl font-bold my-2">ChatApp</h1>
                <h3 className="text-white text-lg font-light">Messagerie instantanée sécurisée</h3>
            </div>
            
            {error &&
                <div className="text-red-500 bg-red-950/70 px-6 py-3 mt-3 rounded-lg text-lg">{error}</div>
            }

            <div className="flex justify-center space-x-4 mt-4">
                <button type="button" onClick={() =>{setIsLogin(true)}} className={`text-xl px-10 py-2 rounded-xl my-4 ${isLogin ? 'bg-[#00A63E] text-white' : 'bg-[#1D293D] text-gray-500'}`}>Connexion</button>
                <button type="button" onClick={() =>{setIsLogin(false)}} className={`text-xl px-10 py-2 rounded-xl my-4 ${!isLogin ? 'bg-[#00A63E] text-white' : 'bg-[#1D293D] text-gray-500'}`}>Inscription</button>
            </div>

            <div>
                <label htmlFor="name" className="text-white text-xl">Nom</label><br/>
                <input type="text" id="name" value={name} onChange={(e)=>{setName(e.target.value)}} className="bg-[#1D293D] w-[350px] text-xl px-4 py-1 text-white rounded-lg mt-1" placeholder="Entrez votre nom"/><br/><br/>
                {!isLogin && 
                <>
                <label htmlFor="email" className="text-white text-xl">Email</label><br/>
                <input type="email" id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} className="bg-[#1D293D] w-[350px] text-xl px-4 py-1 text-white rounded-lg mt-1" placeholder="exemple@gmail.com"/><br/><br/>
                </>
                }
                
                <label htmlFor="password" className="text-white text-xl mb-1">Mot de passe</label><br/>
                <input type="password" id="password" value={password} onChange={(e) =>{setPassword(e.target.value)}} className="bg-[#1D293D] w-[350px] text-xl text-white px-4 py-1 rounded-lg mt-1 placeholder:text-4xl placeholder:text-white" placeholder=".........."/><br/><br/>
                
                
                {!isLogin && 
                <>
                <label htmlFor="confirmPassword" className="text-white text-xl mb-1">Confirmation mot de passe</label><br/>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) =>{(setConfirmPassword(e.target.value))}} className="bg-[#1D293D] w-[350px] text-xl text-white px-4 py-1 rounded-lg mt-1 placeholder:text-4xl placeholder:text-white" placeholder=".........."/><br/><br/>
                <label htmlFor="phone" className="text-white text-xl mb-1">Numéro de Téléphone</label><br/>
                <input type="number" id="phone" value={phone} onChange={(e)=>{setPhone(e.target.value)}} className="bg-[#1D293D] w-[350px] text-xl text-white px-4 py-1 rounded-lg mt-1" placeholder="0778956237"/>
                </>
                }
            </div>

            <button type="submit" className="bg-[#00A63E] text-white text-xl px-10 py-2 rounded-xl mt-6 mb-8 w-[350px]">{isLogin ? "Se connecter" : "S'inscrire"}</button>

            <div className="flex items-center">
                <div className="border-t mb-5 mr-2 w-20 border-gray-600"></div>
                <span className="text-gray-400 text-xl mb-6">Ou continuer avec</span>
                <div className="border-t mb-5 ml-2 border-gray-600 w-20"></div>
            </div>

            <div className="flex justify-center space-x-4">
                <button className="text-white text-xl px-10 py-2 bg-[#1D293D] rounded-lg mb-6"><span><i className="fa fa-google text-[#2B7FFF] mx-3" aria-hidden="true"></i></span>Google</button>
                <button className="text-white text-xl px-10 py-2 bg-[#1D293D] rounded-lg mb-6"><span><i className="fa fa-qrcode mx-3 text-[#01B1D3] text-xl" aria-hidden="true"></i></span>Face ID</button>
            </div>
        </form>
    </div>
}