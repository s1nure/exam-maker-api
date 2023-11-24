const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
	auth_data: {
		email: String,
		login: String,
		password: String,
	},

	name: {
		first_name: String,
		last_name: String,
	},
	description: String,
	avatarPath: String,
	avatarUrl: String,
	user_settings: {
		blob: Boolean,
		background_color: String,
	},
})

const User = mongoose.model('User', userSchema)

module.exports = User
