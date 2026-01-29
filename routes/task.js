const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const requireAuth = require("../middleware/auth");

router.get("/tasks", requireAuth, taskController.getTasks);
router.post("/tasks", requireAuth, taskController.createTask);

router.post("/tasks/:id/complete", requireAuth, taskController.completeTask);
router.post("/tasks/:id/delete", requireAuth, taskController.deleteTask);

module.exports = router;
