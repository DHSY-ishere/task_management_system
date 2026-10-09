const taskService = require('../services/task.service');

const getTasks = (req, res) => {
  const { data, meta } = taskService.list(req.listQuery);
  res.status(200).json({ success: true, data, meta });
};

const getTask = (req, res) => {
  res.status(200).json({ success: true, data: taskService.getById(req.params.id) });
};

const createTask = (req, res) => {
  res.status(201).json({ success: true, data: taskService.create(req.body) });
};

const updateTask = (req, res) => {
  res.status(200).json({ success: true, data: taskService.update(req.params.id, req.body) });
};

const deleteTask = (req, res) => {
  const data = taskService.remove(req.params.id);
  res.status(200).json({ success: true, message: 'Task deleted successfully', data });
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
