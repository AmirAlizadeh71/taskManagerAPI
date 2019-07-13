const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const personSchema = new mongoose.Schema({
    pFirstName: {
        type: String,
        require: true
    },
    pLastName: {
        type: String,
        require: true
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    // Photo: {
    //     type: Blob
    // },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('password is invalid')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true // save create and update time in db
})

personSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'personID'
})

personSchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'personID'
})

//methods method -> instance method -> access by instances
personSchema.methods.generateAuthToken = async function() {
    const person = this

    const token = jwt.sign({ _id: person._id.toString() }, process.env.JWT_SECRET)
    person.tokens = person.tokens.concat({ token })
    await person.save()

    return token
}

personSchema.methods.toJSON = function() {
    const person = this

    const personObject = person.toObject()

    delete personObject.password
    delete personObject.tokens

    return personObject
}

// statics method -> model method -> access by model
personSchema.statics.findByCredentials = async(userName, password) => {
    const person = await Person.findOne({ userName })

    if (!person) {
        throw new Error('wrong userName')
    }

    const isMatch = await bcrypt.compare(password, person.password)

    if (!isMatch) {
        throw new Error('wrong password')
    }

    return person
}

// hash person plain text password before saving
personSchema.pre('save', async function(next) {
    const person = this

    if (person.isModified('password')) {
        person.password = await bcrypt.hash(person.password, 8)
    }

    next()
})

//delete person task on deleting person
personSchema.pre('remove', async function(next) {
    const person = this

    await Task.deleteMany({ personID: person._id })

    next()
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person