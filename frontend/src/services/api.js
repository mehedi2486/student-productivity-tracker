const BASE_URL = "http://localhost:3000/api/user";

const getToken = () => {
    return localStorage.getItem("token");
}

export const handleSignup = async (email, password)  => {
    const response = await fetch(`${BASE_URL}/signup`,{
        method:'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({email, password})
    })
    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "signup fail")
    }
    return data;
}

export const handleLogin = async (email, password) => {
    const response = await fetch(`${BASE_URL}/signin`, {
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
    return data; 
};


export const getTask = async() => {
  const response = await fetch(`${BASE_URL}/tasks`, {
        headers: {
            "Content-Type": "application/json",
            'token': getToken() 
        },
    })
    const data = await response.json();

     if (!response.ok) {
        throw new Error(data.message || "Fail to fetch tasks");
    }
    return data.task;
};

export const addTask = async(title, description) =>{

    const response = await fetch(`${BASE_URL}/task`,{
        method : "POST", 
        headers : {
            'Content-Type': 'application/json',
            'token': getToken()
        },
        body : JSON.stringify ({
            title,
            description
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data


}


export const deleteTask = async (taskId) => {
    const response = await fetch(`${BASE_URL}/task/${taskId}`,{
        method : "DELETE",
        headers : {
            'Content-Type' : 'application/json',
            'token':getToken(),
        },

    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "delete fail")
    }

    return data;

}

export const updateTask = async (taskId, status) =>{
    const response = await fetch(`${BASE_URL}/task/${taskId}`,{
        method:"PUT",
        headers: {
             'Content-Type' : 'application/json',
            'token':getToken(),

        },
        body: JSON.stringify ({
            status

        })
    })
    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "update fail")
    }

    return data;

}