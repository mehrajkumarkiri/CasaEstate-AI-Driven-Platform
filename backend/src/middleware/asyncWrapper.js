/**
 * Async wrapper to eliminate try/catch boilerplate in route controllers.
 * Automatically forwards errors to the Express error handler.
 */
const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;
