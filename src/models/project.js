const mongoose = require('mongoose')
const validator = require('validator')

var ObjectId = mongoose.Schema.Types.ObjectId;

const Project = mongoose.model('Project', {
    name: {
        type: String,
        require: true
    },
    description: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    estimateStartDate: {
        type: Date
    },
    estimateEndDate: {
        type: Date
    },
    personID: {
        type: ObjectId,
        required: true,
        ref: 'Person'
    }
})

module.exports = Project