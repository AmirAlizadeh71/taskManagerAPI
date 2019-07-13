const jwt = require('jsonwebtoken')
const Person = require('../models/person')

const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisismyfirstjsonwebtoken')
        const person = await Person.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!person) {
            throw new Error()
        }

        req.person = person
        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth