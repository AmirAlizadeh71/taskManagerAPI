const express = require('express')
const Person = require('../models/person')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router();
//create person -> use post http request
router.post('/persons', async(req, res) => {
    //initial person
    const person = new Person(req.body)

    try {
        await person.save() //save person in task
        const token = await person.generateAuthToken()
        res.status(201).send({ person, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/persons/login', async(req, res) => {
    try {
        const person = await Person.findByCredentials(req.body.userName, req.body.password)

        const token = await person.generateAuthToken()

        res.send({ person, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/persons/logout', auth, async(req, res) => {
    try {
        req.person.tokens = req.person.tokens.filter((token) => token.token !== req.token)

        await req.person.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/persons/logoutAll', auth, async(req, res) => {
    try {
        req.person.tokens = []

        await req.person.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// router.get('/persons', async(req, res) => {
//     try {
//         const persons = await Person.find({})
//         res.send(persons)
//     } catch (e) {
//         res.status(500).send()
//     }
// })
router.get('/persons/me', auth, async(req, res) => {
    res.send(req.person)
})

const upload = multer({
    // dest: 'avatar', // use if you want to save file in directory
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg | jpeg | png)$/)) { //$ -> means end
            return cb(new Error('Please upload an image'))
                //or cd(undefined, false)
        }
        cb(undefined, true)
    }
})

router.post('/person/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    const buffer = await sharp(req.file.avatar).resize({ width: 250, height: 250 }).png().toBuffer()
    req.person.avatar = buffer

    // req.person.avatar = req.file.buffer // req.file.buffer exist if dest not set for multer
    await req.person.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//get any user profile by id
router.get('/persons/:id', async(req, res) => {
    const _id = req.params.id
    try {
        const person = await Person.findById(_id)
        if (!person) {
            return res.status(404).send()
        }
        res.send(person)
    } catch (e) {
        res.status(500).send()
    }
})

//update person profile by auth
// router.patch('/persons/:id', auth, async(req, res) => {
//     //below protect from send request for update not existed property
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['userName', 'email', 'password']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     const _id = req.params.id
//     try {
//         // const person = await Person.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true }) //new for passing updated one to person
//         //this way can not hash the password on updated, then find person then save it to use mongoose middleware for saving 

//         const person = await Person.findById(_id)

//         updates.forEach((update) => person[update] = req.body[update])
//         await person.save()

//         if (!person) {
//             return res.status(404).send()
//         }
//         res.send(person)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

//update my profile -> must authorized
router.patch('/persons/me', auth, async(req, res) => {
    //below protect from send request for update not existed property
    const updates = Object.keys(req.body)
    const allowedUpdates = ['userName', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // const person = await Person.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true }) //new for passing updated one to person
        //this way can not hash the password on updated, then find person then save it to use mongoose middleware for saving 

        updates.forEach((update) => req.person[update] = req.body[update])
        await req.person.save()

        res.send(req.person)
    } catch (e) {
        res.status(400).send(e)
    }
})


//delete person profile by auth
// router.delete('/persons/:id', auth, async(req, res) => {
//     try {
//         const _id = req.params.id
//         const person = await Person.findByIdAndDelete(_id)
//         if (!person) {
//             return res.status(404).send()
//         }
//         res.send(person)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

//delete my profile, must authorized
router.delete('/persons/me', auth, async(req, res) => {
    try {
        const _id = req.params.id
            // const person = await Person.findByIdAndDelete(_id)
            // if (!person) { //not need because just fetch by auth
            //     return res.status(404).send()
            // }

        await req.person.remove()

        res.send(req.person)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/person/me/avatar', auth, async(req, res) => {
    req.person.avatar = undefined
    await req.person.save()
    res.send()
})

router.get('/person/:id/avatar', async(req, res) => {
    try {
        const person = await Person.findById(req.params.id)

        if (!person || !person.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(person.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router