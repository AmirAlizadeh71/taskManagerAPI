const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router();

router.post('/tasks', auth, async(req, res) => {
    //initial task
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        personID: req.person._id
    })

    try {
        //save task in db
        await task.save()
        res.status(201).send(task) // 201 status => created
    } catch (e) {
        res.status(400).send(e) // 400 status => bad request
    }
})

router.get('/tasks', async(req, res) => {
    //example filtering data
    // GET /tasks?completed=true
    // const match = {}

    // if(req.query.completed){
    //     match.completed = req.query.completed === 'true'
    // }
    // try{
    //     await req.user.populate({
    //         path: 'tasks',
    //         match
    //     }).exexPopulate()
    // }


    //example pagination data
    // GET /tasks?limit=10&skip=10

    // try{
    //     await req.user.populate({
    //         path: 'tasks',
    //         options: {
    //              limit: parseInt(req.query.limit)
    //              skip: parseInt(req.query.skip)
    //     }).exexPopulate()
    // }


    //example sorting data
    // GET /tasks?sortBy=createAt:desc
    // const sort = {}

    // if(req.query.sortB){
    // const parts = req.query.sortBy.split(':')
    // sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    // }
    // try{
    //     await req.user.populate({
    //         path: 'tasks',
    //         sort
    //     }).exexPopulate()
    // }
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', async(req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findById(_id)
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', async(req, res) => {
    //below protect from send request for update not existed property
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const _id = req.params.id
        const task = await Task.findById(_id)

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', async(req, res) => {
    try {
        const _id = req.params.id
        const task = await Task.findByIdAndDelete(_id)
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router