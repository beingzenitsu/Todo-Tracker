import express from "express";
import jwt from "jsonwebtoken";
import Todo from "../models/todo.js";

const router = express.Router();


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, category } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const existing = await Todo.findOne({ user: req.user.id, title, deleted: false });
    if (existing) return res.status(400).json({ message: "Todo already exists" });

    const newTodo = new Todo({
      user: req.user.id,
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      category: category || "General",
      reminder: !!dueDate,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
});


router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const filter = { user: req.user.id, deleted: false };
    if (req.query.completed) filter.completed = req.query.completed === "true";
    if (req.query.status) filter.status = req.query.status;

    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    const todos = await Todo.find(filter).sort({ [sortField]: sortOrder });
    res.json(todos);
  } catch (err) {
    next(err);
  }
});


router.get("/search", authMiddleware, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query required" });

    const todos = await Todo.find({
      user: req.user.id,
      deleted: false,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    });

    res.json(todos);
  } catch (err) {
    next(err);
  }
});


router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id, deleted: false });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.title = req.body.title ?? todo.title;
    todo.description = req.body.description ?? todo.description;
    todo.status = req.body.status ?? todo.status;
    todo.completed = req.body.completed ?? todo.completed;
    todo.priority = req.body.priority ?? todo.priority;
    todo.dueDate = req.body.dueDate ?? todo.dueDate;
    todo.category = req.body.category ?? todo.category;

    await todo.save();
    res.json(todo);
  } catch (err) {
    next(err);
  }
});


router.patch("/:id/toggle", authMiddleware, async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id, deleted: false });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    next(err);
  }
});


router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id, deleted: false });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.deleted = true;
    await todo.save();
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    next(err);
  }
});


router.get("/stats", authMiddleware, async (req, res, next) => {
  try {
    const total = await Todo.countDocuments({ user: req.user.id, deleted: false });
    const completed = await Todo.countDocuments({ user: req.user.id, completed: true, deleted: false });
    res.json({ total, completed, pending: total - completed });
  } catch (err) {
    next(err);
  }
});

export default router;
