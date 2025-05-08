/**
 * Wrong request format exception
 */
export class RequestFormatException extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestFormatException';
  }
}
