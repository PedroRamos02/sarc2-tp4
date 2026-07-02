class AppError extends Error {
  constructor(statusCode, publicMessage, details) {
    super(publicMessage);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
    this.details = details;
  }
}

module.exports = AppError;
