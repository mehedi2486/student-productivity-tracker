import { useEffect, useState } from "react";
import { addTask, getTask, updateTask } from "../services/api";
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

      await fetchTasks(); 
    } catch (err) {
      setError("Failed to add task");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      setLoading(true)
      await deleteTask(taskId)

      await fetchTasks();
    } catch (error) {
      setError("Faild to delete tha task")
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (taskId, currentStatus) => {

    try {
      setLoading(true)
      await updateTask(taskId, !currentStatus)
      await fetchTasks()
    } catch (err) {
      setError("Fail to update")
      console.log(err.message)
    } finally {
      setLoading(false)
    }

  }


  return (
    <div className="min-h-screen bg-gray-100 p-6">

 
      <h2 className="text-2xl font-bold mb-6 text-center">My Tasks</h2>

  
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-3">

        <input
          className="border p-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={handleAddTask}
        >
          Add Task
        </button>
      </div>

      
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

     
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks available</p>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (

            <div
              key={task._id}
              className="bg-white p-4 rounded-lg shadow flex flex-col gap-2"
            >

              <h3 className="text-lg font-semibold">{task.title}</h3>

              <p className="text-gray-600">{task.description}</p>

             
              <p
                className={`font-medium ${task.status ? "text-green-600" : "text-yellow-600"
                  }`}
              >
                {task.status ? "Done" : "Pending"}
              </p>

       
              <div className="flex gap-2 mt-2"> 

                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </button>

                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  onClick={() => handleUpdate(task._id, task.status)}
                >
                  Toggle
                </button>

              </div>
            </div>

          ))}
        </div>
      )}
    </div>
  );
}