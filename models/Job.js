const mongoose = require('mongoose')

 const validStatuses = ['previous', 'current', 'future', 'pending'];
 module.exports.validStatuses = validStatuses;
const JobSchema = new mongoose.Schema(
	{
		company: {
			type: String,
			required: [true, 'Company required.'],
			maxLength: 50
		},
		position: {
			type: String,
			required: [true, 'Position required.'],
			maxLength: 100
		},
		status: {
			type: String,
			enum: validStatuses,
			default: 'pending'
		},
		createdBy: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: [true, 'Created by user required.']
		}
	},
	{ timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

module.exports = { Job, validStatuses };