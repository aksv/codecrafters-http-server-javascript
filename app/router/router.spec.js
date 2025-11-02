const Router = require('./index');
const { ParsedRequest } = require('../request');

describe('Router', () => {
  it('should register handler with one positional parameter', async () => {
    const router = new Router();
    router.get('/users/:id', async (req, res) => {
      expect(req?.params?.id).toBe('42');
    });
    const req = new ParsedRequest();
    req.method = 'GET';
    req.target = '/users/42';
    router.handle(req, {});
  });

  it('should register handler with two positional parameters', async () => {
    const router = new Router();
    router.get('/users/:userId/books/:bookId', async (req, res) => {
      expect(req?.params?.userId).toBe('42');
      expect(req?.params?.bookId).toBe('10');
    });
    const req = new ParsedRequest();
    req.method = 'GET';
    req.target = '/users/42/books/10';
    router.handle(req, {});
  });

  it('should register handler without parameters', async () => {
    const router = new Router();
    router.get('/users', async (req, res) => {
      expect(req?.params).toBe(undefined);
    });
    const req = new ParsedRequest();
    req.method = 'GET';
    req.target = '/users';
    router.handle(req, {});
  });
})
