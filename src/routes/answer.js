const express = require('express')

const authMiddleware = require('../middleware/auth')
const User = require('../models/user')
const Test = require('../models/test')
const Answer = require('../models/answer')
const handleError = require('../utils/errorHandler')

const router = express.Router()

router.post('/create-answer', async (req, res) => {
	const answer = new Answer(req.body.answer)
	if (!answer) return res.status(404)

	if (!answer.userId) {
		const test = await Test.findById(answer.testId)
		if (!test || !test.userId) return res.status(404)
		answer.userId = test.userId
	}
	answer.test.maxMark = 0
	answer.finalMark = 0
	answer.test.questions.forEach(question => {
		answer.test.maxMark += question.mark
	})

	answer.test.questions.forEach(question => {
		const isEveryAnswerCorrect = question.answers.every(
			answer => answer.correct === answer.isSelect
		)
		question.markGet = 0
		if (isEveryAnswerCorrect) {
			question.markGet = question.mark
			answer.finalMark += question.mark
		}
	})

	answer
		.save()
		.then(() => {
			res.status(203).json(answer)
		})
		.catch((error) => {
			console.log(error)
			handleError(res, 'Something goes wrong...')
		})
})
router.use(authMiddleware)

router.get('/get-answer/:id', async (req, res) => {
	const answer = await Answer.findById(req.params.id)

	if (!answer) return res.status(404)
	try {
		res.status(202).json(answer)
	} catch (error) {
		handleError(error, 'Something goes wrong...')
	}
})
router.post('/get-answers', async (req, res) => {
	if (!req.body) return res.status(500)
	const answer = await Answer.find({ testId: req.body.testId })

	if (!answer) return res.status(404)
	try {
		console.log(answer)
		res.status(202).json(answer)
	} catch (error) {
		handleError(error, 'Something goes wrong...')
	}
})
router.delete('/answer/:id', (req, res) => {
	Answer.findByIdAndDelete(req.params.id)
		.then(result => {
			res.status(205).json(result)
		})
		.catch(() => handleError(res, 'Something goes wrong...'))
})

module.exports = router
