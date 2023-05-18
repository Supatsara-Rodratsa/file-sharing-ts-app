// External Dependencies
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
// Global Variables
export const collections: { users?: Collection; files?: Collection } = {};

// Initialize Connection
export async function connectToDatabase() {
  const url = process.env.MY_DB_CONN_STRING;
  const users = process.env.MY_USERS_COLLECTION_NAME;
  const files = process.env.MY_FILES_COLLECTION_NAME;
  const dbName = process.env.MY_DB_NAME;

  if (url && users && dbName && files) {
    const client: MongoClient = new MongoClient(url, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    const db: Db = client.db(dbName);

    const usersCollection: Collection = db.collection(users);
    const filesCollection: Collection = db.collection(files);

    collections.users = usersCollection;
    collections.files = filesCollection;

    console.log(
      `Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}, ${filesCollection.collectionName}`
    );
  }
}
