const mongoose = require('mongoose')
const validator = require('validator')

var ObjectId = mongoose.Schema.Types.ObjectId;

const taskSchema = new mongoose.Schema({
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
    status: {
        type: String,
    },
    parentID: {
        type: ObjectId,
        ref: 'Task'
    },
    projectID: {
        type: ObjectId,
        require: true,
        ref: 'Project'
    },
    personID: {
        type: ObjectId,
        required: true,
        ref: 'Person'
    },
    createDate: {
        type: Date
    },
    priority: {
        type: Number
    }
})

taskSchema.virtual('childTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'parentID'
})

taskSchema.virtual('parentTask', {
    ref: 'Task',
    localField: 'parentID',
    foreignField: '_id'
})

taskSchema.virtual('project', {
    ref: 'Project',
    localField: 'projectID',
    foreignField: '_id'
})


// mongoose convert Task model to tasks in db for collection name
const Task = mongoose.model('Task', taskSchema)

module.exports = Task