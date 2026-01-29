const { Task } = require("../models");

function sanitizeFilter(filter) {
  if (filter === "completed") return "completed";
  return "pending";
}

exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const filter = sanitizeFilter(req.query.filter);

    const tasks = await Task.find({
      userId,
      status: filter
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.render("tasks", {
      filter,
      tasks,
      error: null
    });
  } catch (err) {
    return next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const title = (req.body.title || "").trim();

    if (!title) {
      const filter = sanitizeFilter(req.query.filter);
      const tasks = await Task.find({ userId, status: filter }).sort({ createdAt: -1 }).lean();
      return res.status(400).render("tasks", { filter, tasks, error: "Task title is required" });
    }

    const task = await Task.create({ userId, title, status: "pending" });

    console.log(
      JSON.stringify(
        { time: new Date().toISOString(), level: "info", message: "Task created", userId, taskId: task._id.toString() },
        null,
        2
      )
    );

    return res.redirect("/tasks?filter=pending");
  } catch (err) {
    return next(err);
  }
};

exports.completeTask = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const taskId = req.params.id;

    const updated = await Task.findOneAndUpdate(
      { _id: taskId, userId, status: "pending" },
      { status: "completed" },
      { new: true }
    );

    if (!updated) {
      const e = new Error("Task not found or not allowed");
      e.statusCode = 404;
      throw e;
    }

    console.log(
      JSON.stringify(
        { time: new Date().toISOString(), level: "info", message: "Task completed", userId, taskId },
        null,
        2
      )
    );

    return res.redirect("/tasks?filter=pending");
  } catch (err) {
    return next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const taskId = req.params.id;

    const updated = await Task.findOneAndUpdate(
      { _id: taskId, userId, status: { $ne: "deleted" } },
      { status: "deleted" },
      { new: true }
    );

    if (!updated) {
      const e = new Error("Task not found or not allowed");
      e.statusCode = 404;
      throw e;
    }

    console.log(
      JSON.stringify(
        { time: new Date().toISOString(), level: "info", message: "Task deleted", userId, taskId },
        null,
        2
      )
    );

    const back = req.query.back === "completed" ? "completed" : "pending";
    return res.redirect(`/tasks?filter=${back}`);
  } catch (err) {
    return next(err);
  }
};
