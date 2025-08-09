import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  QueryConstraint,
  DocumentData,
  WithFieldValue
} from 'firebase/firestore';
import { db } from './firebase';

// Generic Firestore utilities
export const firestoreUtils = {
      // Add a new document
  add: async <T extends DocumentData>(collectionName: string, data: WithFieldValue<T>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

    // Get all documents from a collection
    getAll: async (collectionName: string) => {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { docs, error: null };
        } catch (error: any) {
            return { docs: [], error: error.message };
        }
    },

    // Get a single document by ID
    getById: async (collectionName: string, id: string) => {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { doc: { id: docSnap.id, ...docSnap.data() }, error: null };
            } else {
                return { doc: null, error: 'Document not found' };
            }
        } catch (error: any) {
            return { doc: null, error: error.message };
        }
    },

      // Update a document
  update: async (collectionName: string, id: string, data: Record<string, any>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

    // Delete a document
    delete: async (collectionName: string, id: string) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    // Query documents with filters
    query: async (collectionName: string, constraints: QueryConstraint[]) => {
        try {
            const q = query(collection(db, collectionName), ...constraints);
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { docs, error: null };
        } catch (error: any) {
            return { docs: [], error: error.message };
        }
    }
};

// Define types for better type safety
interface User extends DocumentData {
  email: string;
  displayName?: string;
  uid?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
}

// Example usage functions with proper types
export const userOperations = {
  createUser: (userData: WithFieldValue<User>) => firestoreUtils.add<User>('users', userData),
  getUsers: () => firestoreUtils.getAll('users'),
  getUser: (id: string) => firestoreUtils.getById('users', id),
  updateUser: (id: string, data: Partial<User>) => firestoreUtils.update('users', id, data),
  deleteUser: (id: string) => firestoreUtils.delete('users', id),
  getUsersByEmail: (email: string) => 
    firestoreUtils.query('users', [where('email', '==', email)])
};
