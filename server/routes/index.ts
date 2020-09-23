const router = require('express').Router();
const { initializateTables } = require('../controllers/tables.controller');

router.get('/', (req: any, res: any) => res.send('Hello World!'));
router.get('/initializate', initializateTables);

module.exports = router;
