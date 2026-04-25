import { useEffect, useState } from "react";
import { getTask } from "../services/api";

export function Dashboard() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        getTask()
            .then(data => {
                console.log("API Response:", data); // Debugging log
                if (Array.isArray(data)) {
                    setTasks(data); // Set tasks if data is an array
                } else {
                    console.error("Unexpected API response format:", data);
                }
            })
            .catch(err => console.error("Error fetching tasks:", err));
    }, []); // empty dependency only when the first load

    console.log("Tasks in render:", tasks); // Debugging log

    return (
        <div>
            {tasks.length === 0 ? (
                <p>No tasks available</p> // Show a message if tasks are empty
            ) : (
                tasks.map(task => ( // loop through each task
                    <div key={task._id}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                    </div>
                ))
            )}
        </div>
    );
}