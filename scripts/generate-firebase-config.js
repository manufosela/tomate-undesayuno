#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.PUBLIC_FIREBASE_APP_ID || ''
};

// Validate that we have all required config
const requiredFields = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.warn('⚠️  Warning: Missing Firebase configuration fields:', missingFields.join(', '));
  console.warn('   Make sure your .env file contains all PUBLIC_FIREBASE_* variables');
  console.warn('   Using demo values for missing fields...');
  
  // Use demo values for missing fields
  if (!firebaseConfig.apiKey) firebaseConfig.apiKey = 'demo-api-key';
  if (!firebaseConfig.authDomain) firebaseConfig.authDomain = 'demo-project.firebaseapp.com';
  if (!firebaseConfig.databaseURL) firebaseConfig.databaseURL = 'https://demo-project-default-rtdb.firebaseio.com/';
  if (!firebaseConfig.projectId) firebaseConfig.projectId = 'demo-project';
  if (!firebaseConfig.storageBucket) firebaseConfig.storageBucket = 'demo-project.appspot.com';
  if (!firebaseConfig.messagingSenderId) firebaseConfig.messagingSenderId = '123456789';
  if (!firebaseConfig.appId) firebaseConfig.appId = '1:123456789:web:abcdef';
}

// Generate the JavaScript file content
const fileContent = `/**
 * Firebase Configuration
 * Auto-generated file - DO NOT EDIT
 * Generated at: ${new Date().toISOString()}
 * 
 * This file is generated from environment variables and should not be committed to the repository.
 * Add /public/js/firebase-config.js to your .gitignore file.
 */

// Firebase configuration object
export const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

// Helper function to get Firebase config
export function getFirebaseConfig() {
  return firebaseConfig;
}

// Check if running in development mode
export function isDevelopment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

// Check if emulator should be used (check if emulator is actually running)
export async function shouldUseEmulator() {
  if (!isDevelopment()) return false;
  
  // Check if we're explicitly running with emulator by checking a flag
  // This avoids network requests that show errors in console
  if (window.location.search.includes('use-emulator=false')) {
    return false;
  }
  
  // Check if there's an environment hint (set by dev scripts)
  if (window.__FIREBASE_USE_EMULATOR__ === false) {
    return false;
  }
  
  // Default: try to detect emulator but only if we haven't been told not to
  try {
    // Use a very short timeout and handle gracefully
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 200);
    
    const response = await fetch('http://127.0.0.1:9000/.lp?start=t&ser=1&cb=1&v=5', {
      method: 'GET',
      signal: controller.signal,
      // Add headers to make it a simple request
      mode: 'no-cors'
    });
    
    clearTimeout(timeoutId);
    return true; // If we get here, emulator is available
  } catch (error) {
    // Expected when emulator is not running - this is normal
    return false;
  }
}

// Get emulator configuration
export function getEmulatorConfig() {
  return {
    database: {
      host: '127.0.0.1',
      port: 9000
    },
    auth: {
      host: '127.0.0.1',
      port: 9099
    },
    firestore: {
      host: '127.0.0.1',
      port: 8080
    },
    storage: {
      host: '127.0.0.1',
      port: 9199
    }
  };
}

// Validate Firebase configuration
export function validateConfig() {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    console.warn('Missing Firebase configuration:', missing.join(', '));
    return false;
  }
  
  return true;
}

// Check if using demo/development credentials
export function isUsingDemoCredentials() {
  return firebaseConfig.projectId === 'demo-project' ||
         firebaseConfig.apiKey === 'demo-api-key';
}

// Set environment hint for emulator usage (called by build scripts)
export function setEmulatorHint(useEmulator) {
  window.__FIREBASE_USE_EMULATOR__ = useEmulator;
}

// Initialize Firebase with smart emulator detection
export async function initializeFirebaseWithEmulatorDetection() {
  // Import Firebase modules dynamically
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js');
  const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js');
  const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js');
  const { getDatabase, connectDatabaseEmulator } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js');
  const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js');
  
  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const database = getDatabase(app);
  const storage = getStorage(app);
  
  // Set hint that we're not using emulator for this session
  setEmulatorHint(false);
  
  // Try to connect to emulator if in development and not explicitly disabled
  if (isDevelopment()) {
    const useEmulator = await shouldUseEmulator();
    
    if (useEmulator) {
      try {
        connectDatabaseEmulator(database, '127.0.0.1', 9000);
        console.log('🔥 Conectado al emulador de Firebase Database (puerto 9000)');
        setEmulatorHint(true);
      } catch (error) {
        if (error.message.includes('already initialized')) {
          console.log('🔥 Emulador ya inicializado');
          setEmulatorHint(true);
        } else {
          console.log('⚠️  Error conectando al emulador:', error.message);
          console.log('🌐 Usando Firebase en producción');
        }
      }
    } else {
      console.log('🌐 Emulador no disponible, usando Firebase en producción');
    }
  } else {
    console.log('🌐 Conectado a Firebase en producción');
  }
  
  return { app, auth, firestore, database, storage };
}

// Export default config
export default firebaseConfig;
`;

// Output directory
const outputDir = path.join(rootDir, 'public', 'js');
const outputFile = path.join(outputDir, 'firebase-config.js');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the file
try {
  fs.writeFileSync(outputFile, fileContent, 'utf8');
  
  // Log success with color
  console.log('\x1b[32m✓\x1b[0m Firebase config generated successfully at:', 
    path.relative(rootDir, outputFile));
  
  if (isUsingDemoCredentials()) {
    console.log('\x1b[33m⚠\x1b[0m  Using demo credentials - configure .env for production');
  }
} catch (error) {
  console.error('\x1b[31m✗\x1b[0m Error generating Firebase config:', error.message);
  process.exit(1);
}

// Helper function to check if using demo credentials
function isUsingDemoCredentials() {
  return firebaseConfig.projectId === 'demo-project' ||
         firebaseConfig.apiKey === 'demo-api-key';
}