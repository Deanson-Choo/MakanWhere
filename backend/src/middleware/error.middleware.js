export function errorHandler(err, req, res, _next) {
	const statusCode = err.statusCode || 500;

	const payload = {
		success: false,
		message: err.message || 'Internal Server Error'
	};

	// Validation middleware adds structured field-level errors in err.details
	if (Array.isArray(err.details) && err.details.length > 0) {
		payload.errors = err.details;
	}

	// Include stack only during development for easier debugging
	if (process.env.NODE_ENV !== 'production') {
		payload.stack = err.stack;
	}

	res.status(statusCode).json(payload);
}
