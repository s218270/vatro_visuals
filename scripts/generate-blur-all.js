const fetch = require("node-fetch");
const sharp = require("sharp");
const admin = require("firebase-admin");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "ERROR: set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path",
  );
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

function resolveImageRef(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (img.referencePath) {
    if (img.referencePath.startsWith("http")) return img.referencePath;
    const fileName = img.referencePath.split("/").pop();
    const bucketHost = "vatrovisuals-5eb95.appspot.com";
    return `https://firebasestorage.googleapis.com/v0/b/${bucketHost}/o/${encodeURIComponent(
      fileName,
    )}?alt=media${img.token ? `&token=${img.token}` : ""}`;
  }
  return null;
}

async function toBlurDataUrlFromUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = await res.buffer();
    const small = await sharp(buf)
      .resize({ width: 16 })
      .blur(1)
      .jpeg({ quality: 60 })
      .toBuffer();
    return `data:image/jpeg;base64,${small.toString("base64")}`;
  } catch (err) {
    console.warn("Failed to create blur for", url, err.message);
    return null;
  }
}

function collectPathsFromFile(file) {
  const paths = [];
  if (!file) return paths;
  if (file.path) paths.push(file.path);
  for (let n = 1; ; n++) {
    const key = `path${n}`;
    if (file[key]) paths.push(file[key]);
    else break;
  }
  return paths;
}

async function processProjectDoc(doc) {
  const data = doc.data();
  const updates = {};

  // thumbnail
  const thumbUrl = resolveImageRef(data.thumbnail || null);
  if (thumbUrl) {
    const b = await toBlurDataUrlFromUrl(thumbUrl);
    if (b) updates.thumbnailBlur = b;
  }

  // mainImage
  const mainUrl = resolveImageRef(data.mainImage || null);
  if (mainUrl) {
    const b = await toBlurDataUrlFromUrl(mainUrl);
    if (b) updates.mainImageBlur = b;
  }

  // files array
  if (Array.isArray(data.files) && data.files.length) {
    const newFiles = [];
    for (const file of data.files) {
      const paths = collectPathsFromFile(file);
      const blurArray = [];
      for (const p of paths) {
        const url = resolveImageRef(p);
        if (!url) {
          blurArray.push(null);
          continue;
        }
        const b = await toBlurDataUrlFromUrl(url);
        blurArray.push(b);
      }
      const newFile = { ...file, blurData: blurArray };
      newFiles.push(newFile);
    }
    updates.files = newFiles;
  }

  if (Object.keys(updates).length) {
    await doc.ref.update(updates);
    console.log("Updated", doc.id, Object.keys(updates));
  } else {
    console.log("No images found for", doc.id);
  }
}

async function run() {
  console.log("Scanning projects collection...");
  const snap = await db.collection("projects").get();
  console.log("Found", snap.size, "projects");
  for (const doc of snap.docs) {
    try {
      await processProjectDoc(doc);
    } catch (err) {
      console.error("Error processing", doc.id, err.message);
    }
  }
  console.log("Done");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
