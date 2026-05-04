const BASE_URL = "http://localhost:3000/api/user";

const getToken = () => {
    return localStorage.getItem("token");
}

export const handleSignup = async (username, email, password)  => {
    const response = await fetch(`${BASE_URL}/signup`,{
        method:'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({username, email, password})
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
            'Content-Type': 'application/json'  
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

// ── Notes API ──

export const createNote = async (title, content, subject, color) => {
    const response = await fetch(`${BASE_URL}/note`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'token': getToken()
        },
        body: JSON.stringify({ title, content, subject, color })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create note");
    return data;
};

export const getNotes = async (subject, search) => {
    const params = new URLSearchParams();
    if (subject && subject !== "All") params.append("subject", subject);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";

    const response = await fetch(`${BASE_URL}/notes${query}`, {
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch notes");
    return data.notes;
};

export const updateNote = async (noteId, fields) => {
    const response = await fetch(`${BASE_URL}/note/${noteId}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'token': getToken() },
        body: JSON.stringify(fields)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update note");
    return data;
};

export const deleteNote = async (noteId) => {
    const response = await fetch(`${BASE_URL}/note/${noteId}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete note");
    return data;
};

export const pinNote = async (noteId, pinned) => {
    return updateNote(noteId, { pinned });
};

// ── Assignments API ──

export const createAssignment = async (title, description, subject, dueDate) => {
    const response = await fetch(`${BASE_URL}/assignment`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'token': getToken() },
        body: JSON.stringify({ title, description, subject, dueDate })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create assignment");
    return data;
};

export const getAssignments = async (status, subject, search) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (subject && subject !== "All") params.append("subject", subject);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";

    const response = await fetch(`${BASE_URL}/assignments${query}`, {
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch assignments");
    return data.assignments;
};

export const updateAssignment = async (assignmentId, fields) => {
    const response = await fetch(`${BASE_URL}/assignment/${assignmentId}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'token': getToken() },
        body: JSON.stringify(fields)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update assignment");
    return data;
};

export const deleteAssignment = async (assignmentId) => {
    const response = await fetch(`${BASE_URL}/assignment/${assignmentId}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete assignment");
    return data;
};

export const getAssignment = async (assignmentId) => {
    const response = await fetch(`${BASE_URL}/assignment/${assignmentId}`, {
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch assignment");
    return data.assignment;
};

export const linkNotesToAssignment = async (assignmentId, noteIds) => {
    const response = await fetch(`${BASE_URL}/assignment/${assignmentId}/link-notes`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'token': getToken() },
        body: JSON.stringify({ noteIds })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to link notes");
    return data.assignment;
};

export const unlinkNoteFromAssignment = async (assignmentId, noteId) => {
    const response = await fetch(`${BASE_URL}/assignment/${assignmentId}/unlink-note/${noteId}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to unlink note");
    return data.assignment;
};

// ── Study Sessions API ──

export const createSession = async (subject, task, duration) => {
    const response = await fetch(`${BASE_URL}/session`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'token': getToken() },
        body: JSON.stringify({ subject, task, duration })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to save session");
    return data;
};

export const getSessions = async (days) => {
    const query = days ? `?days=${days}` : "";
    const response = await fetch(`${BASE_URL}/sessions${query}`, {
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch sessions");
    return data.sessions;
};

export const getWeeklySummary = async () => {
    const response = await fetch(`${BASE_URL}/sessions/weekly`, {
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch summary");
    return data.summary;
};

export const deleteSession = async (sessionId) => {
    const response = await fetch(`${BASE_URL}/session/${sessionId}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json', 'token': getToken() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete session");
    return data;
};