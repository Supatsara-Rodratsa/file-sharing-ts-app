import File from '@/models/file';

export const FileMock: File[] = [
  {
    id: '1',
    filename: 'test',
    size: 12345,
    format: 'test',
    url: 'test',
    dateCreated: new Date().toString(),
    ownerId: '1',
    shareTo: ['1'],
  },
  {
    id: '2',
    filename: 'test',
    size: 12345,
    format: 'test',
    url: 'test',
    dateCreated: new Date().toString(),
    ownerId: '1',
    shareTo: ['1'],
  },
];
