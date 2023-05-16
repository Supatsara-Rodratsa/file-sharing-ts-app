import request from 'supertest';
import app from '../app';
import jwt, { Secret } from 'jsonwebtoken';
// import FormData from 'form-data';
// import fs from 'fs';
import dotenv from 'dotenv';
// import { CONSTANT } from '@/constants/constant';
// import { collections } from '@/services/database.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db, Document, Collection } from 'mongodb';
import { collections } from '@/services/database.service';
import { CONSTANT } from '@/constants/constant';
import { UserMock } from './mocks/userMock';

let token = '';
let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let usersCollection: Collection<Document>;
dotenv.config();

describe('Test POST /auth/signup Response', () => {
  it('should return 200 Success when passing requestBody correctly without duplicate username', async () => {
    const res = await request(app).post('/auth/signup').send({
      username: `test`,
      firstName: 'test',
      lastName: 'test',
      email: 'test@gmail.com',
      password: '1234578',
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
  beforeAll(async () => {
    await connectToMockDatabase();
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });

  it('should return success when passing correct username and password', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'test',
      password: '12345',
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('should return 401 Invalid username or password when passing incorrect username and password', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'test2',
      password: '123456789',
    });
    expect(res.status).toBe(401);
    expect(res.body.description).toBe('Unauthorized');
    expect(res.body.error).toBe('Invalid username or password');
  });

  it('should return 400 Bad Request when passing requestBody incorrectly', async () => {
    const res = await request(app).post('/auth/login').send({
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
    token = jwt.sign(
      { userId: '12345' },
      process.env[CONSTANT.SECRET_KEY] as Secret,
      { expiresIn: '1h' }
    );
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

describe('Test GET /users Response', () => {
  beforeEach(() => {
    if (token) return;
    token = jwt.sign(
      { userId: '12345' },
      process.env[CONSTANT.SECRET_KEY] as Secret,
      { expiresIn: '1h' }
    );
  });

  it('should return 200 status with all list of users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([...UserMock]);
  });

  it('should return 401 Unauthorized status when not passing invalid accessToken', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send();
    expect(res.status).toBe(401);
  });
});

// describe('Test GET /files/{userId}', () => {
//   beforeEach(() => {
//     if (token) return;
//     token = jwt.sign({ userId: '123' }, 'your-secret-key');
//   });

//   it('should return 200 Success when passing correct accessToken to the header and userId', async () => {
//     const res = await request(app)
//       .get('/files/123')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(200);
//     expect(res.body.description).toBe('Success');
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
//     const invalidToken = 'invalid-token';
//     const res = await request(app)
//       .get('/files/123')
//       .set('Authorization', `Bearer ${invalidToken}`);
//     expect(res.status).toBe(401);
//   });
// });

// describe('Test POST /file/{userId}', () => {
//   beforeEach(() => {
//     if (token) return;
//     token = jwt.sign({ userId: '123' }, 'your-secret-key');
//   });

//   it('should return 200 Success when uploading a file with correct accessToken, userId, and file', async () => {
//     const form = new FormData();
//     form.append('file', fs.createReadStream('src/test/testFile/sally-2.jpeg'), {
//       filename: 'sally-2.jpeg',
//     });

//     const res = await request(app)
//       .post('/file/123')
//       .set('Authorization', `Bearer ${token}`)
//       .set('Content-Type', 'multipart/form-data')
//       .send(form);

//     expect(res.status).toBe(200);
//     expect(res.body.description).toBe('File Uploaded Successfully');
//   });

//   it('should return 400 Bad Request when passing incorrect RequestBody', async () => {
//     const res = await request(app)
//       .post('/file/123')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ test: 2 });

//     expect(res.status).toBe(400);
//   });

//   it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
//     const invalidToken = 'invalid-token';
//     const res = await request(app)
//       .post('/file/123')
//       .set('Authorization', `Bearer ${invalidToken}`);

//     expect(res.status).toBe(401);
//   });
// });

// describe('Test GET /file/{userId}/{fileId}', () => {
//   beforeEach(() => {
//     if (token) return;
//     token = jwt.sign({ userId: '123' }, 'your-secret-key');
//   });

//   it('should return 200 Success when uploading a file with correct accessToken, userId, and file', async () => {
//     const form = new FormData();
//     form.append('file', fs.createReadStream('src/test/testFile/sally-2.jpeg'), {
//       filename: 'sally-2.jpeg',
//     });

//     const res = await request(app)
//       .post('/file/123/1')
//       .set('Authorization', `Bearer ${token}`)
//       .set('Content-Type', 'multipart/form-data')
//       .send(form);

//     expect(res.status).toBe(200);
//     expect({ fileId: 1, filename: 'sally-2.jpeg', format: 'jpg' });
//   });

//   it('should return 400 Bad Request when passing incorrect requestBody', async () => {
//     const res = await request(app)
//       .post('/file/123/1')
//       .set('Authorization', `Bearer ${token}`)
//       .set('Content-Type', 'multipart/form-data')
//       .send({ test: 2 });

//     expect(res.status).toBe(400);
//   });

//   it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
//     const invalidToken = 'invalid-token';
//     const res = await request(app)
//       .post('/file/123/1')
//       .set('Authorization', `Bearer ${invalidToken}`)
//       .send({ test: 2 });
//     expect(res.status).toBe(401);
//   });
// });

// describe('Test DELETE /file/{userId}/{fileId}', () => {
//   beforeEach(() => {
//     if (token) return;
//     token = jwt.sign({ userId: '123' }, 'your-secret-key');
//   });

//   it('should return 204 File successfully deleted when deleting a file with correct accessToken, userId, and fileId', async () => {
//     const res = await request(app)
//       .delete('/file/123/1')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(204);
//     expect(res.body.description).toBe('File successfully deleted');
//   });

//   it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
//     const invalidToken = 'invalid-token';
//     const res = await request(app)
//       .delete('/file/123/1')
//       .set('Authorization', `Bearer ${invalidToken}`);

//     expect(res.status).toBe(401);
//   });
// });

// describe('Test POST /share/{userId}/{fileId}', () => {
//   beforeEach(() => {
//     if (token) return;
//     token = jwt.sign({ userId: '123' }, 'your-secret-key');
//   });

//   it('should return 200 File successfully shared when passing correct userId, fileId and correct requestBody', async () => {
//     const res = await request(app)
//       .post('/share/123/1')
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         fileId: 1,
//         listOfUserId: ['123', '456'],
//       });

//     expect(res.status).toBe(200);
//     expect(res.body.description).toBe('File successfully shared');
//   });

//   it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
//     const invalidToken = 'invalid-token';
//     const res = await request(app)
//       .post('/share/123/1')
//       .set('Authorization', `Bearer ${invalidToken}`);

//     expect(res.status).toBe(401);
//   });

//   it('should return 400 Bad Request when passing incorrect requestBody', async () => {
//     const res = await request(app)
//       .post('/share/123/1')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ test: 2 });

//     expect(res.status).toBe(400);
//     expect(res.body.error).toBe('Invalid Body Request');
//   });
// });

// describe('Test PUT /share/{userId}/{fileId}', () => {
//   beforeEach(() => {
//     if (token) return;
//     token = jwt.sign({ userId: '123' }, 'your-secret-key');
//   });

//   it('should return 200 shared file successfully updated when passing correct userId, fileId and correct requestBody', async () => {
//     const res = await request(app)
//       .put('/share/123/1')
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         fileId: 1,
//         listOfUserId: ['123', '456'],
//       });

//     expect(res.status).toBe(200);
//     expect(res.body.description).toBe('Updated successfully');
//   });

//   it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
//     const invalidToken = 'invalid-token';
//     const res = await request(app)
//       .put('/share/123/1')
//       .set('Authorization', `Bearer ${invalidToken}`);

//     expect(res.status).toBe(401);
//   });

//   it('should return 400 Bad Request when passing incorrect requestBody', async () => {
//     const res = await request(app)
//       .put('/share/123/1')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ test: 2 });

//     expect(res.status).toBe(400);
//     expect(res.body.error).toBe('Invalid Body Request');
//   });
// });

// describe('Test GET /share/{userId}/shared-files', () => {
//   beforeEach(() => {
//     if (token) return;
//     token = jwt.sign({ userId: '123' }, 'your-secret-key');
//   });

//   it('should return 200 when passing correct userId', async () => {
//     const res = await request(app)
//       .get('/share/123/shared-files')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(200);
//   });

//   it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
//     const invalidToken = 'invalid-token';
//     const res = await request(app)
//       .get('/share/123/shared-files')
//       .set('Authorization', `Bearer ${invalidToken}`);

//     expect(res.status).toBe(401);
//   });
// });

const connectToMockDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  client = new MongoClient(mongoUri);
  await client.connect();

  db = client.db();

  if (process.env['USERS_COLLECTION_NAME']) {
    usersCollection = db.collection(process.env['USERS_COLLECTION_NAME']);
    const mockFind = jest.fn().mockReturnValue({
      toArray: () => [...UserMock],
    });
    const mockFindOne = jest.fn().mockReturnValue(UserMock[0]);
    jest.spyOn(usersCollection, 'find').mockImplementation(mockFind);
    jest.spyOn(usersCollection, 'findOne').mockImplementation(mockFindOne);
    collections.users = usersCollection;
  }
};

const disconnectToMockDatabase = async () => {
  await client.close();
  await mongoServer.stop();
};
