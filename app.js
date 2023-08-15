import express from 'express'

const app = express()

app.use(express.json())

// DB CONNECTION
import conn from './backend/db/mongo.js'
conn();

app.listen(process.env.API_PORT)

// Routes
import routes from './backend/routes/router.js'
routes(app)