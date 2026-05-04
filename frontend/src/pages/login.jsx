import { useState } from "react";
import { handleLogin } from "../services/api";
import { useNavigate } from "react-router-dom";

export function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async () =>{

        try{
            const data = await handleLogin(email,password);
            localStorage.setItem("token", data.token);
            navigate("/dashboard");
        }catch(error){
            console.log("Login fail")
            console.error(error.message);
           
        }

    }

    return(
        <div>
            <h1>Log in</h1>

            <input type="text" placeholder="Enter your email" value={email} onChange={(e) => {setEmail(e.target.value)}} />

            <input type="password" placeholder="Enter your password" value={password} onChange={(p) => {setPassword(p.target.value)}} />

            <button onClick={handleSubmit}>Login</button>
        </div>
    )



}