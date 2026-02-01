import { db } from "../config/firebaseConfig";
import { collection, getDocs, query, limit as fbLimit } from "firebase/firestore";

// Return a lightweight summary list for index views to reduce client work
// Accepts optional `opts` with `{ limit }` to cap number of documents fetched.
export async function getProjects(opts = {}) {
  const col = collection(db, "projects");
  let q = col;
  if (opts.limit && Number.isInteger(opts.limit) && opts.limit > 0) {
    q = query(col, fbLimit(opts.limit));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data() || {};
    return {
      id: doc.id,
      title: data.title || "",
      shortDescription: data.shortDescription || "",
      thumbnail: data.thumbnail || null,
      priority: typeof data.priority === "number" ? data.priority : undefined,
    };
  });
}
