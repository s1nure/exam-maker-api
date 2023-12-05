const mongoose = require('mongoose')
const User = require('../models/user')
const Test = require('../models/test')
const Answer = require('../models/answer')

async function deleteAccount(userId) {
	try {
    
    await User.findByIdAndDelete(userId)

		await Test.deleteMany({ userId: userId })
		await Answer.deleteMany({ userId: userId })
		

		console.log(
			`Account with userId ${userId} and associated tests deleted successfully.`
		)
	} catch (error) {
		console.error(`Error deleting account with userId ${userId}:`, error)
		throw error
	}
}

module.exports = deleteAccount
