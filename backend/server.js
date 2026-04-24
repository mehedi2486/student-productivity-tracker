require("dotenv").config();
const express = require("express");
const app = express();
const {taskrouter} = require("./src/routes/task.router");
const {Authrouter} = require("../backend/src/routes/auth.routes");
const { default: mongoose } = require("mongoose");
mongoose.connect(process.env.database);
const cors = require('cors');
app.use(cors()); // Add this before your routes

app.use(express.json());

app.use("/api/user",Authrouter);
app.use("/api/user",taskrouter);

app.listen(process.env.port)