class AppError extends Error {
  status: string;
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message); //Message is the parameter built in Error accept
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor); //When a new object is created constructor function is called and that constructor will not appear in the stack trace
  }
}

export default AppError;
