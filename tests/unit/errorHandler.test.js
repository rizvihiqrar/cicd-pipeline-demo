'use strict';

const errorHandler = require('../../src/middleware/errorHandler');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler middleware', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('responds with 500 and a generic message, not the raw error', () => {
    const res = mockResponse();
    errorHandler(new Error('db password is hunter2'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  test('logs the error stack to the console', () => {
    const err = new Error('boom');
    errorHandler(err, {}, mockResponse(), () => {});

    expect(consoleSpy).toHaveBeenCalledWith(err.stack);
  });

  test('does not call next, since the error is handled here', () => {
    const next = jest.fn();
    errorHandler(new Error('boom'), {}, mockResponse(), next);

    expect(next).not.toHaveBeenCalled();
  });
});
