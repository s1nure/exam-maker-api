function handleError(res, message) {
	res.status(500).json({ error: message })
}

module.exports = handleError