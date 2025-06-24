import { openDB } from 'idb';

const DATABASE_NAME = 'berbagicerita';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

export const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

const Database = {
  async putReport(report) {
    if (!Object.hasOwn(report, 'id')) {
      throw new Error('`id` is required to save.');
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, report);
  },

  async getStoryById(id) {
    const db = await dbPromise;
    return await db.get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    const db = await dbPromise;
    return await db.getAll(OBJECT_STORE_NAME);
  },

  async deleteStoryById(id) {
    const db = await dbPromise;
    return await db.delete(OBJECT_STORE_NAME, id);
  },
};

export default Database;
