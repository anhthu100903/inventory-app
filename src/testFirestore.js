import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const testFirestore = async () => {
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} =>`, doc.data());
  });
};
