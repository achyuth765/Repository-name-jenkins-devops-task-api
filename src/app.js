const express = require("express");

const app = express();

app.use(express.json());

let tasks = [
    {
        id: 1,
        title: "Learn Jenkins",
        completed: false
    }
];

app.get("/", (req, res) => {
    res.json({
        message: "Task API is running"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// Create a new task
app.post("/api/tasks", (req, res) => {
    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

if (require.main === module) {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

module.exports = app;