import { useState } from "react";
import { handleSignup } from "../services/api";
import { useNavigate } from "react-router-dom";

export function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignuphere = async () => {
        try {
            await handleSignup(email, password);
            navigate("/login");
        } catch (error) {
            console.log("Login fail")
            console.error(error.message);

        }

    }


    return (
        <div>
            <h1>SignUp</h1>

            <input type="text" placeholder="Enter your email" value={email} onChange={(e) =>setEmail(e.target.value)} />
            <input type="text" placeholder="Enter your email" value={password} onChange={(e) =>setPassword(e.target.value)} />

            <button onClick={handleSignuphere}>Signup</button>

        </div>
    )
}