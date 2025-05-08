/**
 * Exception while approaching external api
 */
export class ApiRequestException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiRequestException';
  }
}
