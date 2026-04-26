import { useEffect, useState } from "react";
import { addTask, getTask } from "../services/api";
import { deleteTask } from "../services/api";

export function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTask();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add task
  const handleAddTask = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      await addTask(title, description);

      setTitle("");
      setDescription("");

      await fetchTasks(); // simple refresh approach
    } catch (err) {
      setError("Failed to add task");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete  = async (taskId) => {
    try{
        setLoading(true)
        await deleteTask(taskId)

        await fetchTasks();
    }catch(error){
        setError("Faild to delete tha task")
        console.log(error.message)
    }finally{
        setLoading(false)
    }
  }

  return (
    <div>
      <h2>My Tasks</h2>

    
      <div>
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={handleAddTask}>Add Task</button>
      </div>


      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {tasks.length === 0 ? (
        <p>No tasks available</p>
      ) : (
        tasks.map((task) => (
          <div key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <button onClick={() => handleDelete(task._id)}>
            Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}