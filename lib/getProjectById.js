import { db } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function getProjectById(id) {
  const docRef = doc(db, "projects", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}
