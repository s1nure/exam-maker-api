const mongoose = require('mongoose')

const Schema = mongoose.Schema

const answerSchema = new Schema(
	{
		guest_name: String,

		finalMark: Number,

		userId: String,
		testId: String,
		craterName: {
			first_name: String,
			last_name: String,
		},
		test: {
			title: String,
			description: String,
			maxMark: Number,

			questions: [
				{
					title: String,
					questionRequired: Boolean,
					questionType: String,
					mark: Number,
					markGet: Number,
					answers: [
						{
							answer: String,
							correct: Boolean,
							isSelect: Boolean,
						},
					],
				},
			],
		},
	},
	{ timestamps: true }
)

const Answer = mongoose.model('Answer', answerSchema)

module.exports = Answer
