// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, deleteDoc, getDoc, updateDoc, query, where } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Read Firebase config from Vite environment variables.
// Using `VITE_` prefix exposes these values to the client bundle.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
try {
  if (typeof window !== 'undefined') {
    getAnalytics(app);
  }
} catch (e) {
  // Analytics may fail in non-browser or restricted environments; ignore.
}

export const auth = getAuth(app);
auth.languageCode = 'en';
export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const createTrip = async(tripData) => {
  const user = auth.currentUser;
  if(!user){
    throw new Error("No authenticated user! Please login first.");
  }
  const newTrip = {
    ...tripData,
    userId: user.uid,
    createdAt: serverTimestamp(),
    status: "Planning",
  };

  const tripRef = collection(db, "trips");
  const docRef = await addDoc(tripRef, newTrip);

  return {id: docRef.id, ...newTrip};
};

export const getTrips = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user! Please login first.");
  }
  const tripsRef = collection(db, "trips");
  const q = query(tripsRef, where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const deleteTrip = async (tripId) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user! Please login first.");
  }
  const tripRef = doc(db, "trips", tripId);
  const snap = await getDoc(tripRef);
  if (!snap.exists()) {
    throw new Error("Trip not found");
  }
  const data = snap.data();
  if (data.userId !== user.uid) {
    throw new Error("Not authorized to delete this trip");
  }
  await deleteDoc(tripRef);
  return tripId;
};

export const getTrip = async (tripId) => {
  const user = auth.currentUser;
  if(!user) {
    throw new Error("No authenticated user! Please login first.");
  }
  const tripRef = doc(db, "trips", tripId);
  const snap = await getDoc(tripRef);
  if (!snap.exists()) {
    throw new Error("Trip not found");
  }
  const data = snap.data();
  if (data.userId !== user.uid) {
    throw new Error("Not authorized to view this trip");
  }
  return { id: snap.id, ...data };
}

export const updateTrip = async(tripId, updates) => {
  const user = auth.currentUser;
  if(!user) {
    throw new Error("No authenticated user! Please login first.");
  }
  const tripRef = doc(db, "trips", tripId);
  const snapBefore = await getDoc(tripRef);
  if (!snapBefore.exists()) {
    throw new Error("Trip not found");
  }
  const beforeData = snapBefore.data();
  if (beforeData.userId !== user.uid) {
    throw new Error("Not authorized to update this trip");
  }
  await updateDoc(tripRef, {...updates, updatedAt: serverTimestamp()});
  const snap = await getDoc(tripRef);
  return {id : snap.id, ...snap.data()};
};


