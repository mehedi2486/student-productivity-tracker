import { useState } from "react";
import { handleSignup } from "../services/api";
import { useNavigate } from "react-router-dom";

export function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignuphere = async () => {
        try {
            await handleSignup(username, email, password);
            navigate("/login");
        } catch (error) {
            console.log("Signup fail")
            console.error(error.message);

        }

    }


    return (
        <div>
            <h1>SignUp</h1>

            <input type="text" placeholder="Enter your username" value={username} onChange={(e) =>setUsername(e.target.value)} />
            <input type="text" placeholder="Enter your email" value={email} onChange={(e) =>setEmail(e.target.value)} />
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) =>setPassword(e.target.value)} />

            <button onClick={handleSignuphere}>Signup</button>

        </div>
    )
}