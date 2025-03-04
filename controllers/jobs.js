
 
 const { Job, validStatuses } = require('../models/Job');
 const { StatusCodes } = require('http-status-codes')
 const { BadRequestError, NotFoundError } = require('../errors/index')

 const jobShowAll = async (req, res) => {
	const jobs = await Job.find({ createdBy: req.user?._id }).sort('createdAt');

	res.render('jobs', { jobs });
};

const jobShowAllError = async (req, res) => {
	const jobs = await Job.find({ createdBy: req.user?._id }).sort('createdAt');
	res.render('jobs', { jobs, errors: req.flash('error') });
};

 const jobShow = async (req, res) => {
    
	const job = await Job.findOne({
		createdBy: req.user?._id,
		_id: req.params.id
	});

	if (!job) {
		req.flash('error', 'Job not found.');
		jobShowAllError();
		return;
	}

	res.render('job', { job });
   // res.render('job', { job, validStatuses, _csrf: req.csrfToken() })
    //res.render("job", { job: null, validStatuses, _csrf: req.csrfToken() });
};

const jobShowError = async (req, res) => {
	const job = await Job.findOne({
		createdBy: req.user?._id,
		_id: req.params.id
	});

	if (!job) {
		req.flash('error', 'Job not found.');
		jobShowAllError();
		return;
	}

	res.render('job', { job, errors: req.flash('error') });
};

 const jobCreate = async (req, res) => {
	const newJob = { ...req.body };
	newJob.createdBy = req.user._id;
	const job = await Job.create(newJob);
	if (!job) {
		req.flash('error', 'Job creation failed.');
		jobShowCreateError();
		return;
	}

	jobShowAll(req, res);
};

 const jobUpdate = async (req, res) => {
	const { company, position, status } = req.body;
	if (company === '' || position === '' || status === '') {
		req.flash('error', 'Invalid, empty field(s) provided.');
		jobShowError();
		return;
	}

	const job = await Job.findOneAndUpdate(
		{
			createdBy: req.user?._id,
			_id: req.params.id
		},
		{ company, position, status },
		{ new: true, runValidators: true }
	);

	if (!job) {
		req.flash('error', 'Job not found.');
		jobShowAllError();
		return;
	}

	jobShowAll(req, res);
};

 const jobDelete = async (req, res) => {
	const job = await Job.findOneAndDelete({
		createdBy: req.user?._id,
		_id: req.params.id
	});

	if (!job) {
		req.flash('error', 'Job not found. You may have sent multiple requests.');
		jobShowAllError();
		return;
	}

	jobShowAll(req, res);
};

 const jobShowCreate = (req, res) => {
	res.render('job', { job: null });
};

const jobShowCreateError = (req, res) => {
	res.render('job', { job: null, errors: req.flash('error') });
};

module.exports = {
    
    jobShowAll,
    jobShow,
  jobCreate,
  jobUpdate,
  jobDelete,
  jobShowCreate,
}