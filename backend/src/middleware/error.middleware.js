export function errorHandler(err, req, res, _next) {
	const statusCode = err.statusCode || 500;
	const isServerError = statusCode >= 500; // Something unexpected happened but we don't want to leak details to the client

	const payload = {
		success: false,
		message: isServerError ? 'Internal Server Error' : (err.message || 'Unknown Error Occurred')
	};

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
