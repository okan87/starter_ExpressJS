"use strict";

function sanitizeBody(body) {
    if (!body) return body;
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = "***";
    return sanitized;
}

module.exports = (err, req, res, next) => {
    // Duplicate key (unique) error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            error: true,
            message: `This ${field} is already registered.`,
            field,
            sent: sanitizeBody(req.body),
        });
    }

    // Validation error (Mongoose)
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            error: true,
            message: "Validation error.",
            details: errors,
            sent: sanitizeBody(req.body),
        });
    }

    // ObjectId (Cast) error
    if (err.name === "CastError") {
        return res.status(400).json({
            error: true,
            message: `Invalid ID format: ${err.value}`,
            sent: sanitizeBody(req.body),
        });
    }

    // Other errors
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        error: true,
        message: err.message || "Internal Server Error",
        cause: err.cause || undefined,
        sent: sanitizeBody(req.body),
    });
};