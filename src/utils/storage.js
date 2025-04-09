import { openDB } from 'idb';

const DB_NAME = 'ai-page-generator';
const STORE_NAME = 'settings';
const API_KEY_ID = 'openai-api-key';
const HISTORY_ID = 'generation-history';

// Initialize the database
async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// Save API key to IndexedDB
export async function saveApiKey(apiKey) {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, apiKey, API_KEY_ID);
    return true;
  } catch (error) {
    console.error('Error saving API key to IndexedDB:', error);
    
    // Fallback to localStorage if IndexedDB fails
    try {
      localStorage.setItem(API_KEY_ID, apiKey);
      return true;
    } catch (localStorageError) {
      console.error('Error saving API key to localStorage:', localStorageError);
      return false;
    }
  }
}

// Get API key from IndexedDB
export async function getApiKey() {
  try {
    const db = await getDb();
    const apiKey = await db.get(STORE_NAME, API_KEY_ID);
    return apiKey;
  } catch (error) {
    console.error('Error getting API key from IndexedDB:', error);
    
    // Fallback to localStorage if IndexedDB fails
    try {
      return localStorage.getItem(API_KEY_ID);
    } catch (localStorageError) {
      console.error('Error getting API key from localStorage:', localStorageError);
      return null;
    }
  }
}

// Save generation history
export async function saveGenerationHistory(history) {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, history, HISTORY_ID);
    return true;
  } catch (error) {
    console.error('Error saving generation history to IndexedDB:', error);
    
    // Fallback to localStorage if IndexedDB fails
    try {
      localStorage.setItem(HISTORY_ID, JSON.stringify(history));
      return true;
    } catch (localStorageError) {
      console.error('Error saving generation history to localStorage:', localStorageError);
      return false;
    }
  }
}

// Get generation history
export async function getGenerationHistory() {
  try {
    const db = await getDb();
    const history = await db.get(STORE_NAME, HISTORY_ID);
    return history || [];
  } catch (error) {
    console.error('Error getting generation history from IndexedDB:', error);
    
    // Fallback to localStorage if IndexedDB fails
    try {
      const historyString = localStorage.getItem(HISTORY_ID);
      return historyString ? JSON.parse(historyString) : [];
    } catch (localStorageError) {
      console.error('Error getting generation history from localStorage:', localStorageError);
      return [];
    }
  }
}

// Clear all data
export async function clearAllData() {
  try {
    const db = await getDb();
    await db.clear(STORE_NAME);
    
    // Also clear localStorage as fallback
    localStorage.clear();
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}
