class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      if (err.isOperational) {
    // Safe to show message to user
    res.json({ message: err.message });
    } else {
    // Don't expose internal details
    res.json({ message: "Something went wrong" });
    }
  
      Error.captureStackTrace(this, this.constructor);
      //It records exactly where in your code the error was created — which file, which line number.
    }
  }
  
  module.exports = AppError;