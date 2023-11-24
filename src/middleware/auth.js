const jwt = require('jsonwebtoken')
const secretKey = 'your-secret-key' 

module.exports = (req, res, next) => {
	try {
    if (!req.headers.authorization)
      return res.status(400).json({ message: 'No authorization' })

		const token = req.headers.authorization.split(' ')[1]

		if (!token) {
			return res.status(400).json({ message: 'No authorization' })
		}

		const decodedToken = jwt.verify(token, secretKey)
		req.userData = { userId: decodedToken.userId }
		next()
	} catch (error) {
		console.error(error)
		res.status(400).json({ message: 'No authorization' })
	}
}
