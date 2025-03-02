const { date } = require('joi')
const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide Student Name'],
      maxlength: 50,
    },
    StudentId: {
      type: String,
      required: [true, 'Please provide StudentId'],
      maxlength: 100,
    },
    StartDate: {
      type: Date ,
      required: [true, 'Please provide enteredDate'],
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('student', StudentSchema)
