abstract class ApplicationError extends Error {
  protected constructor(errorType: string, errorMessage: string) {
    super(errorMessage);
    this.name = errorType;
    this.captureStackTrace();
  }

  private captureStackTrace(): void {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NetworkError extends ApplicationError {
  constructor(message: string) {
    super("NetworkError", message);
  }
}

export class ServerError extends ApplicationError {
  constructor(message: string) {
    super("ServerError", message);
  }
}

export class DataError extends ApplicationError {
  constructor(message: string) {
    super("DataError", message);
  }
}
