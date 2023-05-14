import request from 'supertest';
import app from '../app';

describe('Failing tests for API endpoints', () => {
  it('POST /auth/signup should return a 404 Not Found', async () => {
    const res = await request(app).post('/auth/signup').send({
      username: 'test',
      firstName: 'John',
      lastName: 'James',
      email: 'john@email.com',
      password: '12345',
    });
    expect(res.status).toBe(404);
  });

  it('POST /auth/login should return a 404 Not Found', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'test',
      password: '12345',
    });
    expect(res.status).toBe(404);
  });

  it('POST /auth/logout should return a 404 Not Found', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(404);
  });

  it('GET /users should return a 404 Not Found', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(404);
  });

  it('GET /file/{userId} should return a 404 Not Found', async () => {
    const res = await request(app).get('/file/test');
    expect(res.status).toBe(404);
  });

  it('POST /file/{userId} should return a 404 Not Found', async () => {
    const res = await request(app).post('/file/test').send();
    expect(res.status).toBe(404);
  });

  it('GET /file/{userId}/{filename} should return a 404 Not Found', async () => {
    const res = await request(app).post('/file/test/name').send();
    expect(res.status).toBe(404);
  });

  it('DELETE /file/{userId}/{fileId} should return a 404 Not Found', async () => {
    const res = await request(app).post('/file/test/id').send();
    expect(res.status).toBe(404);
  });

  it('POST /share/{userId}/{fileId} should return a 404 Not Found', async () => {
    const res = await request(app).post('/share/test/id').send();
    expect(res.status).toBe(404);
  });

  it('PUT /share/{userId}/{fileId} should return a 404 Not Found', async () => {
    const res = await request(app).put('/share/test/id').send();
    expect(res.status).toBe(404);
  });

  it('GET /share/{userId}/shared-files should return a 404 Not Found', async () => {
    const res = await request(app).put('/share/test/shared-files').send();
    expect(res.status).toBe(404);
  });
});
