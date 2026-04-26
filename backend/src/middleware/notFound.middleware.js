
export function notFoundHandler(req, res, next) {
    const err = new Error(`Route ${req.method} ${req.originalUrl} not found`)
    err.statusCode = 404
    next(err); // Send to global error handler
}