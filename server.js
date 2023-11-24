const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')




const PORT = 3000
const URL = 'mongodb://localhost:27017/ExamMaker'

const app = express()
app.use(bodyParser.json())

const cors = require('cors')
app.use(cors())

mongoose
	.connect(URL)
	.then(() => console.log('Connected to database'))
	.catch(err => console.log(`Db connection error: ${err}`))

app.listen(PORT, err => {
	err
		? console.log(err, 'error')
		: console.log(`listening on port: ${PORT}. Will be started`)
})
/******************************USERS*********************************************/
const authRoutes = require('./src/routes/auth')
const userRouter = require('./src/routes/user')

app.use('/auth', authRoutes)

app.use('/source', userRouter)

// app.use('/protected', authMiddleware, (req, res) => {
// 	res.json({ message: 'Защищенный маршрут' })
// })

/******************************TESTS*********************************************/
const testsRouter = require('./src/routes/tests')
app.use('/data', testsRouter)
// app.use('/data', authMiddleware, testsRouter)
/******************************ANSWERS*********************************************/
const answerRouter = require('./src/routes/answer')

app.use(answerRouter)
