const { taskModel } = require("../models/task.model");

exports.createTask = async (req, res) => {
  const userId = req.userId;
  const { title, description } = req.body;

  try {
    const task = await taskModel.create({
      title: title,
      description: description,
      userId: userId,
    });

    res.status(201).json({
      message: "task created",
      task,
    });
  } catch (error) {
    res.status(401).json({
      message: "task added fail",
    });
  }
}

exports.getTask =  async (req, res)=> {
  const userId = req.userId;

  const task = await taskModel.find({
    userId,
  });

  if (task) {
    res.json({
      task,
    });
  }
};

exports.updateTask =  async (req, res)=> {
  const taskId = req.params.id;
  const userId = req.userId;
  const {status} = req.body;
  try {
    const updateTask = await taskModel.findOneAndUpdate(
      {
        _id: taskId,
        userId: userId,
      },
      {
        status: status,
      },
      {
        new:true
      },
    );
    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    res.json({
      message: "Task updated",
      updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
    });
  }
};

exports.deleteTask =  async (req, res) =>{
  const taskId = req.params.id;
  const userId = req.userId;

  try {
    const deletedTask = await taskModel.findOneAndDelete({
        _id:taskId,
        userId:userId

    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
};
