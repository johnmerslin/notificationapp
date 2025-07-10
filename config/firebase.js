// Mock Firebase services for development without Firebase setup
console.log('🔧 Running in development mode without Firebase');

const mockDb = {
  collection: () => ({
    get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
      orderBy: () => ({
        get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
        limit: () => ({
          get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
          offset: () => ({
            get: () => Promise.resolve({ empty: true, size: 0, docs: [] })
          })
        })
      }),
      limit: () => ({
        get: () => Promise.resolve({ empty: true, size: 0, docs: [] })
      })
    }),
    orderBy: () => ({
      get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
      limit: () => ({
        get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
        offset: () => ({
          get: () => Promise.resolve({ empty: true, size: 0, docs: [] })
        })
      })
    })
  })
};

const mockAuth = {
  verifyIdToken: () => Promise.resolve({ uid: 'mock-uid' })
};

const mockStorage = {
  bucket: () => ({
    file: () => ({
      save: () => Promise.resolve(),
      makePublic: () => Promise.resolve()
    })
  })
};

const mockMessaging = {
  send: () => Promise.resolve({ messageId: 'mock-message-id' })
};

const mockAdmin = {
  apps: [],
  credential: {
    cert: () => ({})
  },
  initializeApp: () => ({}),
  firestore: () => mockDb,
  auth: () => mockAuth,
  storage: () => mockStorage,
  messaging: () => mockMessaging
};

const db = mockDb;
const auth = mockAuth;
const storage = mockStorage;
const messaging = mockMessaging;

module.exports = {
  admin: mockAdmin,
  db,
  auth,
  storage,
  messaging
};