export const handleLogin = async (email, password) => {
    const response = await fetch('http://localhost:3000/api/user/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // ✅ Fixed typo
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data; // token
};