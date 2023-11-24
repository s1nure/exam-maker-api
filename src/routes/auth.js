const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const secretKey = 'your-secret-key'

router.post('/register', async (req, res) => {
	try {
		const { email, login, password } = req.body

		const existingUserLogin = await User.findOne({ 'auth_data.login': login })
		const existingUserEmail = await User.findOne({ 'auth_data.email': email })
		if (existingUserLogin || existingUserEmail) {
			return res
				.status(402)
				.json({ message: 'A user with the same name already exists' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const newUser = new User({
			auth_data: {
				email: email,
				login: login,
				password: hashedPassword,
			},
			name: {
				first_name: '',
				last_name: '',
			},
			description: '',
			avatarPath:
				'/Users/volodumurivanov/college/Project/exam-maker-api/data/avatars/default_avatar.jpeg',
			avatarUrl: 'http://localhost:3000/source/avatars/default_avatar.jpeg',
		})

		await newUser.save()
		res.status(201).json({ message: 'User successfully registered' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Something went wrong' })
	}
})

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body

		const user = await User.findOne({
			$or: [{ 'auth_data.email': username }, { 'auth_data.login': username }],
		})

		if (!user) {
			return res.status(400).json({ message: 'User not found' })
		}
		const isPasswordValid = await bcrypt.compare(
			password,
			user.auth_data.password
		)

		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Invalid password' })
		}

		const token = jwt.sign({ userId: user._id }, secretKey, {
			expiresIn: '365d',
		})
		
		
		res.status(200).json({ user, token })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Something goes wrong...' })
	}
})

module.exports = router
