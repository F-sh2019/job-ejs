

const express = require('express');
const router= express.Router(); 
const { jobShowAll, jobShow, jobCreate, jobUpdate, jobDelete, jobShowCreate } = require('../controllers/jobs.js');


router.route('/').get(jobShowAll).post(jobCreate);
router.get('/new', jobShowCreate);
router.get('/edit/:id', jobShow);
router.post('/update/:id', jobUpdate);
router.post('/delete/:id', jobDelete);

module.exports = router