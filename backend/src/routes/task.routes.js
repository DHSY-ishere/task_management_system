const { Router } = require('express');
const controller = require('../controllers/task.controller');
const {
  validateCreateTask,
  validateUpdateTask,
  validateListQuery,
} = require('../middleware/validateTask');

const router = Router();

router.get('/', validateListQuery, controller.getTasks);
router.get('/:id', controller.getTask);
router.post('/', validateCreateTask, controller.createTask);
router.put('/:id', validateUpdateTask, controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
