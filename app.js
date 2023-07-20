import express from 'express'

const app = express()
app.use(express.json())

// DB CONNECTION
import conn from './backend/db/mongo.js'
conn();

const apiPort = 5000
app.listen(apiPort)
console.log(`API running on port ${apiPort}`)

// Routes
import routes from './backend/routes/router.js'
routes(app)