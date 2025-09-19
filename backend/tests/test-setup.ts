// temp mongodb server for testing
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Set up test environment variables
process.env.JWT_ACCESS_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (!collections) return;

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});
