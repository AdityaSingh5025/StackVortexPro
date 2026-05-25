const rateLimit = require("express-rate-limit");

const WINDOW_MS =
	parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;

const rateLimitHandler = (req, res) => {
	return res.status(429).json({
		success: false,
		message: "Too many requests, please try again later.",
	});
};

const limiterOptions = {
	windowMs: WINDOW_MS,
	standardHeaders: true,
	legacyHeaders: false,
	handler: rateLimitHandler,
};

const globalLimiter = rateLimit({
	...limiterOptions,
	max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
});

const authLimiter = rateLimit({
	...limiterOptions,
	max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
});

module.exports = { globalLimiter, authLimiter };
