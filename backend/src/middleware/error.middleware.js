export function errorHandler(err, req, res, _next) {
	const statusCode = err.statusCode || 500;
	const isServerError = statusCode >= 500;
	const isDev = process.env.NODE_ENV !== 'production';

	const payload = {
		success: false,
		message: isServerError && !isDev ? 'Internal Server Error' : (err.message || 'Unknown Error Occurred')
	};

	// Temporary debug details for local development only.
	if (isDev) {
		payload.debug = {
			name: err.name,
			stack: err.stack
		};
	}

	// Validation middleware adds structured field-level errors in err.details
	if (Array.isArray(err.details) && err.details.length > 0) {
		payload.errors = err.details;
	}

	/* Example Payload:
	{
		"success": false,
		"message": "Validation failed",
		"errors": [
			{ "field": "username", "message": "Username is already taken" },
			{ "field": "password", "message": "Password must be at least 6 characters" }
		]
	}
	*/
	res.status(statusCode).json(payload);
}
