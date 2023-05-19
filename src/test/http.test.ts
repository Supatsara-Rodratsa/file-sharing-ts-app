import request from 'supertest';
import app from '../app';
import jwt, { Secret } from 'jsonwebtoken';
import fs from 'fs';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db, Document, Collection } from 'mongodb';
import { collections } from '@/services/database.service';
import { CONSTANT } from '@/constants/constant';
import { UserMock } from './mocks/userMock';
import { FileMock } from './mocks/fileMock';

let token = '';
let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let usersCollection: Collection<Document>;
let filesCollection: Collection<Document>;
dotenv.config();

// Ignore aws service testing
jest.mock('@/services/aws.service', () => {
  return jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn(),
  }));
});

describe('Test POST /auth/signup Response', () => {
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(true);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });
  it('should return 200 Success when passing requestBody correctly without duplicate username', async () => {
    const res = await request(app).post('/auth/signup').send({
      username: `test2`,
      firstName: 'test2',
      lastName: 'test2',
      email: 'test2@gmail.com',
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
    mockCollection(false);
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
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(false);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });

  beforeEach(async () => {
    if (token) return;
    token = jwt.sign({}, process.env[CONSTANT.SECRET_KEY] as Secret);
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
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(false);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });
  beforeEach(() => {
    if (token) return;
    token = jwt.sign({}, process.env[CONSTANT.SECRET_KEY] as Secret);
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

describe('Test GET /files/{userId}', () => {
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(false);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });

  beforeEach(() => {
    if (token) return;
    token = jwt.sign({}, process.env[CONSTANT.SECRET_KEY] as Secret);
  });

  it('should return 200 Success when passing correct accessToken to the header and userId', async () => {
    const res = await request(app)
      .get('/files')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .get('/files')
      .set('Authorization', `Bearer ${invalidToken}`);
    expect(res.status).toBe(401);
  });
});

describe('Test POST /file-upload', () => {
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(false);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });

  beforeEach(() => {
    if (token) return;
    token = jwt.sign({}, process.env[CONSTANT.SECRET_KEY] as Secret);
  });

  it('should return 200 Success when uploading a file with correct accessToken, userId, and file', async () => {
    const filePath = 'src/test/mocks/sally-2.jpeg';
    const fileData = fs.readFileSync(filePath);
    const res = await request(app)
      .post('/file-upload')
      .field('key', 'value')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .set('Response-Type', 'application/json')
      .attach('file', fileData, 'sally-2.jpeg');

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('File Uploaded Successfully');
  });

  it('should return 400 Bad Request when passing incorrect RequestBody', async () => {
    const res = await request(app)
      .post('/file-upload')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.description).toBe('Bad Request');
  });

  it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .post('/file-upload')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Access Token is invalid');
  });
});

describe('Test GET /file?filename=test', () => {
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(false);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });

  beforeEach(() => {
    if (token) return;
    token = jwt.sign({}, process.env[CONSTANT.SECRET_KEY] as Secret);
  });

  it('should return 200 Success when searching filename', async () => {
    const res = await request(app)
      .get('/file?filename=test')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([...FileMock]);
  });

  it('should return 400 Bad Request when passing incorrect query', async () => {
    const res = await request(app)
      .get('/file?rr=test')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.description).toBe('Bad Request');
  });

  it('should return 401 Unauthorized when passing incorrect accessToken in the header', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .get('/file?filename=test')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body.description).toBe('Unauthorized');
  });
});

describe('Test POST /share/{fileId}', () => {
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(false);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });

  beforeEach(() => {
    if (token) return;
    token = jwt.sign({}, process.env[CONSTANT.SECRET_KEY] as Secret);
  });

  it('should return 200 File successfully shared when passing correct requestBody', async () => {
    const res = await request(app)
      .post('/share/6464a0ed310a8b3f065db88b')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sharedUserId: ['2'],
      });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Shared File Successfully');
  });

  it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .post('/share/6464a0ed310a8b3f065db88b')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body.description).toBe('Unauthorized');
    expect(res.body.error).toBe('Access Token is invalid');
  });

  it('should return 400 Bad Request when passing incorrect requestBody', async () => {
    const res = await request(app)
      .post('/share/6464a0ed310a8b3f065db88b')
      .set('Authorization', `Bearer ${token}`)
      .send({ test: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Request Body');
  });
});

describe('Test GET /shared-files', () => {
  beforeAll(async () => {
    await connectToMockDatabase();
    mockCollection(false);
  });

  afterAll(async () => {
    await disconnectToMockDatabase();
  });

  beforeEach(() => {
    if (token) return;
    token = jwt.sign({}, process.env[CONSTANT.SECRET_KEY] as Secret);
  });

  it('should return 200 when passing correct userId', async () => {
    const res = await request(app)
      .get('/shared-files')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([...FileMock]);
  });

  it('should return 401 Unauthorized when passing incorrect accessToken', async () => {
    const invalidToken = 'invalid-token';
    const res = await request(app)
      .get('/shared-files')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
  });
});

const connectToMockDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  client = new MongoClient(mongoUri);
  await client.connect();

  db = client.db();
};

const mockCollection = (isSignup: boolean) => {
  if (process.env['MY_USERS_COLLECTION_NAME']) {
    usersCollection = db.collection(process.env['MY_USERS_COLLECTION_NAME']);
    const mockFind = jest.fn().mockReturnValue({
      toArray: () => [...UserMock],
    });

    const mockFindOne = jest
      .fn()
      .mockReturnValue(!isSignup ? { ...UserMock[0] } : null);
    jest.spyOn(usersCollection, 'find').mockImplementation(mockFind);
    jest.spyOn(usersCollection, 'findOne').mockImplementation(mockFindOne);
    collections.users = usersCollection;
  }
  if (process.env['MY_FILES_COLLECTION_NAME']) {
    filesCollection = db.collection(process.env['MY_FILES_COLLECTION_NAME']);
    const mockFind = jest.fn().mockReturnValue({
      toArray: () => [...FileMock],
    });
    jest.spyOn(filesCollection, 'find').mockImplementation(mockFind);
    jest.spyOn(filesCollection, 'updateOne').mockImplementation(mockFind);
    collections.files = filesCollection;
  }
};

const disconnectToMockDatabase = async () => {
  await client.close();
  await mongoServer.stop();
};
