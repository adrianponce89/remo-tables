const router = require('express').Router();
const {
  initializateTables,
  assignTable,
  unAssignTable,
  moveTable,
} = require('../controllers/tables.controller');

router.get('/', (req: any, res: any) => res.send('Hello World!'));
router.get('/initializate', initializateTables);
router.post('/assign-table', assignTable);
router.post('/unassign-table', unAssignTable);
router.post('/move-table', moveTable);

module.exports = router;
