require("dotenv").config();
const express = require("express");
const app = express();
const {taskrouter} = require("./src/routes/task.router");
const {Authrouter} = require("./src/routes/auth.routes");
const {noterouter} = require("./src/routes/note.routes");
const {assignmentrouter} = require("./src/routes/assignment.routes");
const {sessionrouter} = require("./src/routes/session.routes");
const { default: mongoose } = require("mongoose");
mongoose.connect(process.env.database);
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.use("/api/user",Authrouter);
app.use("/api/user",taskrouter);
app.use("/api/user",noterouter);
app.use("/api/user",assignmentrouter);
app.use("/api/user",sessionrouter);

app.listen(process.env.port , () => {
    console.log("server is running on port", process.env.port)
})  