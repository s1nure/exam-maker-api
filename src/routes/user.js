const express = require('express')
const bcrypt = require('bcrypt')
const authMiddleware = require('../middleware/auth')
const deleteAccount = require('../utils/deleteUser')

const User = require('../models/user')
const Test = require('../models/test')

const multer = require('multer')
const path = require('path')
const fs = require('fs').promises

const router = express.Router()

const dataFolderPath = path.join(__dirname, '../../data')
const avatarsFolderPath = path.join(dataFolderPath, 'avatars')

router.use('/avatars', express.static(avatarsFolderPath))

router.get('/user-name/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		res.status(200).json({
			name: user.name,
		})
	} catch (error) {
		console.error('Error fetching user info:', error)
		res.status(500).send('Internal Server Error')
	}
})
router.get('/user-name-of-test/:id', async (req, res) => {
	try {
		const test = await Test.findById(req.params.id)
		if (!test || !test.userId) return res.status(404)

		const user = await User.findById(test.userId)
		res.status(200).json({
			name: user.name,
			userId: user._id,
		})
	} catch (error) {
		console.error('Error fetching user info:', error)
		res.status(500).send('Internal Server Error')
	}
})

router.use(authMiddleware)
fs.mkdir(dataFolderPath, { recursive: true }).catch(err => console.error(err))

fs.mkdir(avatarsFolderPath, { recursive: true }).catch(err =>
	console.error(err)
)
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, avatarsFolderPath)
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
	},
})

const deleteAvatar = async filePath => {
	try {
		const defaultAvatarPath = path.join(
			__dirname,
			'../../data/avatars/default_avatar.jpeg'
		)

		if (filePath !== defaultAvatarPath) {
			await fs.unlink(filePath)
			console.log(`Deleted avatar: ${filePath}`)
		} else {
			console.log(`Not deleting default avatar: ${filePath}`)
		}
	} catch (error) {
		console.error(`Error deleting avatar: ${filePath}`, error)
	}
}

const upload = multer({ storage: storage })

router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
	try {
		const userId = req.body.userId
		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).send('User not found')
		}

		if (user.avatarPath && user.avatarPath !== 'path/to/default_avatar.jpeg') {
			await deleteAvatar(user.avatarPath)
		}

		user.avatarPath = req.file.path
		user.avatarUrl = `http://localhost:3000/source/avatars/${req.file.filename}`
		await user.save()

		res.status(200).json({
			user: user,
			message: 'Avatar uploaded successfully',
		})
	} catch (error) {
		console.error('Error uploading avatar:', error)
		res.status(500).send('Internal Server Error')
	}
})

router.get('/user-all-info', async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
		res.status(200).json({
			username: user.username,
			avatarUrl: user.avatarPath
				? `http://localhost:3000/source/avatars/${user._id}`
				: null,
		})
	} catch (error) {
		console.error('Error fetching user info:', error)
		res.status(500).send('Internal Server Error')
	}
})

router.post('/delete-account', async (req, res) => {
	try {
		const { userId, authData } = req.body

		const user = await User.findOne({
			$and: [
				{
					_id: userId,
				},
				{
					$or: [
						{ 'auth_data.email': authData.username },
						{ 'auth_data.login': authData.username },
					],
				},
			],
		})

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}
		const isPasswordValid = await bcrypt.compare(
			authData.password,
			user.auth_data.password
		)

		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Invalid password' })
		}
		await deleteAccount(userId)

		res.status(205).json({ message: 'Account deleted successfully.' })
	} catch (error) {
		console.error('Error deleting account:', error)
		res.status(500).send('Internal Server Error')
	}
})

router.patch('/user/:id', (req, res) => {
	User.findByIdAndUpdate(req.params.id, req.body, { new: true })
		.then(result => {
			res.status(202).json(result)
		})
		.catch(() => handleError(res, 'Something goes wrong...'))
})

router.patch('/change-email/:id', async (req, res) => {
	const { oldEmail, newEmail } = req.body.changeEmail
	const user = await User.findById(req.params.id)

	if (!user) return res.status(404).end()


	if (user.auth_data.email !== oldEmail || oldEmail == newEmail) {
		return res.status(410).end()
	}

	User.findByIdAndUpdate(
		req.params.id,
		{ 'auth_data.email': newEmail },
		{ new: true }
	)
		.then(result => {
			res.status(202).json(result)
		})
		.catch(() => handleError(res, 'Something goes wrong...'))
})

router.patch('/change-password/:id', async (req, res) => {
	const { oldPass, newPass } = req.body.changePassword

	const user = await User.findById(req.params.id)

	if (!user) return res.status(404).end()

	const isPasswordValid = await bcrypt.compare(oldPass, user.auth_data.password)
	if (!isPasswordValid) {
		return res.status(411).json({ message: 'Invalid password' }).end()
	}

	const hashedPassword = await bcrypt.hash(newPass, 10)

	User.findByIdAndUpdate(
		req.params.id,
		{ 'auth_data.password': hashedPassword },
		{ new: true }
	)
		.then(result => {
			res.status(202).json(result)
		})
		.catch(() => handleError(res, 'Something goes wrong...'))
})

module.exports = router
