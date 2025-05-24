export class LambdaError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message 
   * @param {any} data 
   */
  constructor(statusCode, message, data = null) {
    super(message);
    this.name = "LambdaError";
    this.statusCode = statusCode;
    this.data = data;
  }
  
  static handle(fn) {
    return async (event) => {
      try {
        return {
          statusCode: 200,
          body: JSON.stringify(await fn(event) ?? null)
        }
      } catch(err) {
        if (err instanceof LambdaError) {
          return {
            statusCode: err.statusCode,
            body: JSON.stringify({
              "error": err.message,
              "data": err.data
            })
          }
        }
  
        throw err;
      }
    }
  }
}
