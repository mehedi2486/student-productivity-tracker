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
    console.log(data);
    return data; // token
};


export const getTask = () => {
    const token = localStorage.getItem("token");
    console.log(token);
    console.log('hitting this url:', 'http://localhost:3000/api/user/tasks');
    return fetch('http://localhost:3000/api/user/tasks', {
        // method: 'GET',
        headers: {
            'token': token // Removed Bearer prefix as per backend expectation
        },
    })
    .then(res => res.json())
    .then(data => data.task);
};