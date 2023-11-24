const mongoose = require('mongoose')

const Schema = mongoose.Schema

const testSchema = new Schema(
	{
		userId: String,
		title: String,
		description: String,
		questions: [
			{
				title: String,
				questionRequired: Boolean,
				questionType: String,
				mark: Number,
				answers: [
					{
						answer: String,
						correct: Boolean,
					},
				],
			},
		],
	},
	{ timestamps: true }
)

const Test = mongoose.model('Test', testSchema)

module.exports = Test
