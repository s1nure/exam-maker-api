const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')

const Test = require('../models/test') 
const handleError = require('../utils/errorHandler')


// Получить тест опираясь на пользователя 
router.post('/tests/getTest', (req, res) => {
	const user = req.body.user
	Test.find({ userId: user._id })
		.sort({ title: 1 })
		.then(tests => {
			res.status(200).json(tests)
		})
		.catch(() => handleError(res, 'Something goes wrong...'))
})

// Получить тест по ID
router.get('/tests/:id', (req, res) => {
	Test.findById(req.params.id)
		.then(test => {
			res.status(200).json(test)
		})
		.catch(() => handleError(res, 'Something goes wrong...'))
})
router.use(authMiddleware)

// Удалить тест по ID
router.delete('/tests/:id', (req, res) => {
	Test.findByIdAndDelete(req.params.id)
		.then(result => {
			res.status(205).json(result)
		})
		.catch(() => handleError(res, 'Something goes wrong...'))
})

// Создать новый тест
router.post('/tests/createNewTest', (req, res) => {
	const test = new Test(req.body)
	console.log(test)
	test
		.save()
		.then(result => {
			res.status(203).json(result)
		})
		.catch((error) => { 
			handleError(res, 'Something goes wrong...')
		})
})

// Обновить тест по ID
router.patch('/tests/:id', (req, res) => {
	Test.findByIdAndUpdate(req.params.id, req.body, { new: true })
		.then(result => {
			res.status(202).json(result)
		})
		.catch((error) => {
			console.log(error)
			handleError(res, 'Something goes wrong...')
		})
})

module.exports = router
