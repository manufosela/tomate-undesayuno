class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.database = null;
    this.storage = null;
  }

  async init() {
    if (!this.app) {
      // Use the smart initialization function from firebase-config.js
      const { initializeFirebaseWithEmulatorDetection } = await import('../firebase-config.js');
      
      const services = await initializeFirebaseWithEmulatorDetection();
      
      this.app = services.app;
      this.auth = services.auth;
      this.firestore = services.firestore;
      this.database = services.database;
      this.storage = services.storage;
    }
    return this.app;
  }

  getAuth() {
    return this.auth;
  }

  getFirestore() {
    return this.firestore;
  }

  getDatabase() {
    return this.database;
  }

  getStorage() {
    return this.storage;
  }

}

export const firebaseService = new FirebaseService();