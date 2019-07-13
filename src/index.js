const express = require('express')
require('./db/mongoose')

const personRouter = require('./routers/person')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

//express middleware
//  with middleware : new request -> do something -> run route handler 
//  without middleware : new request -> run route handler

// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         console.log('GET request does not availeble for this server')
//     } else {
//         next()
//     }
// })

app.use(express.json())
app.use(personRouter)
app.use(taskRouter)



app.listen(port, () => {
    console.log('Server is running up on port ' + port)
})