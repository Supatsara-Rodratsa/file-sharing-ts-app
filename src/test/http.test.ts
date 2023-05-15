import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import FormData from 'form-data';
import fs from 'fs';

let token = '';

describe('Test POST /auth/signup Response', () => {
  it('should return 200 Success when passing requestBody correctly ', async () => {
    const res = await request(app).post('/auth/signup').send({
      username: 'test',
      firstName: 'John',
      lastName: 'James',
      email: 'john@email.com',
      password: '12345',
    });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Success');
  });

  it('should return 400 Bad Request when passing requestBody incorrectly', async () => {
    const res = await request(app).post('/auth/signup').send({});
    expect(res.status).toBe(400);
    expect(res.body.description).toBe('Bad Request');
    expect(res.body.error).toBe('Invalid Request Body');
  });
});

describe('Test POST /auth/login Response', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return a valid accessToken JWT with userId when passing correct username and password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test',
        password: '12345',
      });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    // TODO: update key when implement JWT
    const decodedToken = jwt.verify(res.body.accessToken, 'secret-key') as {
      userId: string;
    };
    expect(decodedToken.userId).toBeDefined();
  });

  it('should return 401 Invalid username or password when passing incorrect username and password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test',
        password: '123456',
      });
    expect(res.status).toBe(401);
    expect(res.body.description).toBe('Unauthorized');
    expect(res.body.error).toBe('Invalid username or password');
  });

  it('should return 400 Bad Request when passing requestBody incorrectly', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'test',
      });
    expect(res.status).toBe(400);
    expect(res.body.description).toBe('Bad Request');
    expect(res.body.error).toBe('Invalid Request Body');
  });
});

describe('Test POST /auth/logout Response', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 200 Success when invalidating jwt token successfully', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Success');
  });

  it('should return 401 Unauthorized when not passing accessToken in the header', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send();
    expect(res.status).toBe(401);
  });
});

describe('Test GET /files/{userId}', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 200 Success when passing correct accessToken to the header and userId', async () => {
    const res = await request(app)
      .get('/files/123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Success');
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .get('/files/123')
      .set('Authorization', `Bearer ${invalidToken}`);
    expect(res.status).toBe(401);
  });
});

describe('Test POST /file/{userId}', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 200 Success when uploading a file with correct accessToken, userId, and file', async () => {
    const form = new FormData();
    form.append('file', fs.createReadStream('src/test/testFile/sally-2.jpeg'), {
      filename: 'sally-2.jpeg',
    });

    const res = await request(app)
      .post('/file/123')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .send(form);

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('File Uploaded Successfully');
  });

  it('should return 400 Bad Request when passing incorrect RequestBody', async () => {
    const res = await request(app)
      .post('/file/123')
      .set('Authorization', `Bearer ${token}`)
      .send({ test: 2 });

    expect(res.status).toBe(400);
  });

  it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .post('/file/123')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
  });
});

describe('Test GET /file/{userId}/{fileId}', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 200 Success when uploading a file with correct accessToken, userId, and file', async () => {
    const form = new FormData();
    form.append('file', fs.createReadStream('src/test/testFile/sally-2.jpeg'), {
      filename: 'sally-2.jpeg',
    });

    const res = await request(app)
      .post('/file/123/1')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .send(form);

    expect(res.status).toBe(200);
    expect({ fileId: 1, filename: 'sally-2.jpeg', format: 'jpg' });
  });

  it('should return 400 Bad Request when passing incorrect requestBody', async () => {
    const res = await request(app)
      .post('/file/123/1')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .send({ test: 2 });

    expect(res.status).toBe(400);
  });

  it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .post('/file/123/1')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send({ test: 2 });
    expect(res.status).toBe(401);
  });
});

describe('Test DELETE /file/{userId}/{fileId}', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 204 File successfully deleted when deleting a file with correct accessToken, userId, and fileId', async () => {
    const res = await request(app)
      .delete('/file/123/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(res.body.description).toBe('File successfully deleted');
  });

  it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .delete('/file/123/1')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
  });
});

describe('Test POST /share/{userId}/{fileId}', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 200 File successfully shared when passing correct userId, fileId and correct requestBody', async () => {
    const res = await request(app)
      .post('/share/123/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fileId: 1,
        listOfUserId: ['123', '456'],
      });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('File successfully shared');
  });

  it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .post('/share/123/1')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
  });

  it('should return 400 Bad Request when passing incorrect requestBody', async () => {
    const res = await request(app)
      .post('/share/123/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ test: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Body Request');
  });
});

describe('Test PUT /share/{userId}/{fileId}', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 200 shared file successfully updated when passing correct userId, fileId and correct requestBody', async () => {
    const res = await request(app)
      .put('/share/123/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fileId: 1,
        listOfUserId: ['123', '456'],
      });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated successfully');
  });

  it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .put('/share/123/1')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
  });

  it('should return 400 Bad Request when passing incorrect requestBody', async () => {
    const res = await request(app)
      .put('/share/123/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ test: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Body Request');
  });
});

describe('Test GET /share/{userId}/shared-files', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({ userId: '123' }, 'your-secret-key');
  });

  it('should return 200 when passing correct userId', async () => {
    const res = await request(app)
      .get('/share/123/shared-files')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .get('/share/123/shared-files')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
  });
});
