import { ObjectId } from 'mongodb';

export default class User {
  constructor(
    public username: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public id?: ObjectId | string
  ) {}
}
