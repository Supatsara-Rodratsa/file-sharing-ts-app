import { ObjectId } from 'mongodb';

export default class File {
  constructor(
    public ownerId: string,
    public filename: string,
    public size: number,
    public url: string,
    public format: string,
    public dateCreated: Date | string,
    public id?: ObjectId | string,
    public shareTo?: string[]
  ) {}
}
