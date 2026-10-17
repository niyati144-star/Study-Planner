const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ---------- JSON FILE FUNCTIONS ----------

function getTasks() {
    return JSON.parse(
        fs.readFileSync("data/tasks.json", "utf8")
    );
}
function saveTasks(tasks) {
    fs.writeFileSync(
        "data/tasks.json",
        JSON.stringify(tasks, null, 2)
    );
}
function getSubjects() {
    return JSON.parse(
        fs.readFileSync("data/subjects.json", "utf8")
    );
}
function saveSubjects(subjects) {
    fs.writeFileSync(
        "data/subjects.json",
        JSON.stringify(subjects, null, 2)
    );
}
function getAttendance() {
    return JSON.parse(
        fs.readFileSync("data/attendance.json", "utf8")
    );
}
function saveAttendance(attendance) {
    fs.writeFileSync(
        "data/attendance.json",
        JSON.stringify(attendance, null, 2)
    );
}
function getSchedule() {
    return JSON.parse(
        fs.readFileSync("data/schedule.json", "utf8")
    );
}
// ---------- DASHBOARD ----------

app.get("/", function(req, res) {
    const tasks = getTasks();
    const subjects = getSubjects();
    const attendance = getAttendance();

    const completed = tasks.filter(function(item) {
        return item.completed === true;
    }).length;

    const pending = tasks.length - completed;
    let averageAttendance = 0;
    if (attendance.length > 0) {
        let totalPercentage = 0;
        attendance.forEach(function(item) {
            if (item.total > 0) {
                totalPercentage +=
                    (item.present / item.total) * 100;
            }
        });
        averageAttendance = Math.round(
            totalPercentage / attendance.length
        );
    }
    res.render("index", {
        tasks: tasks,
        subjects: subjects,
        completed: completed,
        pending: pending,
        averageAttendance: averageAttendance
    });
});

// ---------- TASKS PAGE ----------

app.get("/tasks", function(req, res) {

    const tasks = getTasks();

    res.render("tasks", {
        tasks: tasks
    });

});
// Add Task
app.post("/add-task", function(req, res) {
    const tasks = getTasks();
    const newTask = {
        id: Date.now(),
        task: req.body.task,
        subject: req.body.subject,
        date: req.body.date,
        priority: req.body.priority,
        completed: false
    };
    tasks.push(newTask);
    saveTasks(tasks);
    res.redirect("/tasks");
});
// Complete / Undo
app.post("/complete-task/:id", function(req, res) {
    const tasks = getTasks();
    const id = Number(req.params.id);
    tasks.forEach(function(item) {
        if (item.id === id) {
            item.completed = !item.completed;
        }
    });
    saveTasks(tasks);
    res.redirect("/tasks");
});
// Delete Task
app.post("/delete-task/:id", function(req, res) {
    const tasks = getTasks();
    const id = Number(req.params.id);
    const updatedTasks = tasks.filter(function(item) {
        return item.id !== id;
    });
    saveTasks(updatedTasks);
    res.redirect("/tasks");
});

// ---------- SCHEDULE ----------

app.get("/schedule", function(req, res) {
    const schedule = getSchedule();
    res.render("schedule", {
        schedule: schedule
    });
});
// ---------- ATTENDANCE ----------
app.get("/attendance", function(req, res) {
    const attendance = getAttendance();
    res.render("attendance", {
        attendance: attendance
    });
});
// Present
app.post("/attendance/:id/present", function(req, res) {
    const attendance = getAttendance();
    const id = Number(req.params.id);
    attendance.forEach(function(item) {
        if (item.id === id) {
            item.present++;
            item.total++;
        }
    });
    saveAttendance(attendance);
    res.redirect("/attendance");
});

// Absent
app.post("/attendance/:id/absent", function(req, res) {
    const attendance = getAttendance();
    const id = Number(req.params.id);
    attendance.forEach(function(item) {
        if (item.id === id) {
            item.total++;
        }
    });
    saveAttendance(attendance);
    res.redirect("/attendance");
});
// ---------- PROGRESS ----------
app.get("/progress", function(req, res) {
    const subjects = getSubjects();
    res.render("progress", {
        subjects: subjects
    });
});
app.post("/update-progress", function(req, res) {
    const subjects = getSubjects();
    const id = Number(req.body.id);
    let progress = Number(req.body.progress);
    if (progress < 0) {
        progress = 0;
    }
    if (progress > 100) {
        progress = 100;
    }
    subjects.forEach(function(item) {
        if (item.id === id) {
            item.progress = progress;
        }
    });
    saveSubjects(subjects);
    res.redirect("/progress");
});
// ---------- POMODORO ----------
app.get("/pomodoro", function(req, res) {
    res.render("pomodoro");
});
// ---------- REST API ----------
// GET
app.get("/api/tasks", function(req, res) {
    res.json(getTasks());
});
// POST
app.post("/api/tasks", function(req, res) {
    const tasks = getTasks();
    if (!req.body.task ||
        !req.body.subject ||
        !req.body.date) {
        return res.status(400).json({
            message: "Task, subject and date are required"
        });
    }
    const newTask = {
        id: Date.now(),
        task: req.body.task,
        subject: req.body.subject,
        date: req.body.date,
        priority: req.body.priority || "Medium",
        completed: false
    };
    tasks.push(newTask);
    saveTasks(tasks);
    res.status(201).json(newTask);
});
// PUT
app.put("/api/tasks/:id", function(req, res) {
    const tasks = getTasks();
    const id = Number(req.params.id);
    let found = false;
    tasks.forEach(function(item) {
        if (item.id === id) {
            found = true;
            if (req.body.task) {
                item.task = req.body.task;
            }
            if (req.body.subject) {
                item.subject = req.body.subject;
            }
            if (req.body.date) {
                item.date = req.body.date;
            }
            if (req.body.priority) {
                item.priority = req.body.priority;
            }
        }
    });
    if (!found) {
        return res.status(404).json({
            message: "Task not found"
        });
    }
    saveTasks(tasks);
    res.json({
        message: "Task updated successfully"
    });
});
// DELETE
app.delete("/api/tasks/:id", function(req, res) {
    const tasks = getTasks();
    const id = Number(req.params.id);
    const newTasks = tasks.filter(function(item) {
        return item.id !== id;
    });
    saveTasks(newTasks);
    res.json({
        message: "Task deleted successfully"
    });
});
// ---------- SERVER ----------
app.listen(PORT, function() {
    console.log("Study Planner is running");
    console.log("Open in browser: http://localhost:" + PORT);
});