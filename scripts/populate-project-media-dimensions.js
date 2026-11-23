/*
 * Adds layout metadata to every entry in projects.files.
 *
 * Usage:
 *   node scripts/populate-project-media-dimensions.js --dry-run
 *   node scripts/populate-project-media-dimensions.js --write
 *
 * Authentication uses Google Application Default Credentials. Set
 * GOOGLE_APPLICATION_CREDENTIALS to a Firebase service-account JSON file.
 * ffprobe must be available on PATH to inspect video dimensions.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const shouldWrite = process.argv.includes("--write");
const projectId = process.env.FIREBASE_PROJECT_ID || "vatrovisuals-5eb95";

function initializeAdmin() {
  if (getApps().length) return getApps()[0];

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      projectId,
    });
  }

  return initializeApp({ credential: applicationDefault(), projectId });
}

function getMediaPaths(file) {
  const paths = [];
  if (file.path) paths.push(file.path);
  for (let index = 1; file[`path${index}`]; index += 1) {
    paths.push(file[`path${index}`]);
  }
  return paths;
}

function getUrl(path) {
  if (typeof path === "string") return path;
  if (path?.referencePath?.startsWith("http")) return path.referencePath;
  throw new Error("Media path is not a downloadable URL");
}

function isVideo(url, type) {
  return ["mp4", "mp4auto", "mov", "webm"].includes(
    String(type || url.split("?")[0].split(".").pop()).toLowerCase(),
  );
}

async function getImageDimensions(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image request failed: ${response.status}`);
  const metadata = await sharp(
    Buffer.from(await response.arrayBuffer()),
  ).metadata();
  if (!metadata.width || !metadata.height)
    throw new Error("Image has no dimensions");
  return { width: metadata.width, height: metadata.height };
}

async function getVideoDimensions(url) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    url,
  ]);
  const stream = JSON.parse(stdout).streams?.[0];
  if (!stream?.width || !stream?.height)
    throw new Error("Video has no dimensions");
  return { width: stream.width, height: stream.height };
}

async function getDimensions(url, type) {
  return isVideo(url, type) ? getVideoDimensions(url) : getImageDimensions(url);
}

async function main() {
  initializeAdmin();
  const db = getFirestore();
  const snapshot = await db.collection("projects").get();
  let updatedProjects = 0;

  for (const project of snapshot.docs) {
    const data = project.data();
    if (!Array.isArray(data.files)) continue;

    let changed = false;
    const files = await Promise.all(
      data.files.map(async (file, fileIndex) => {
        const paths = getMediaPaths(file);
        if (!paths.length) return file;

        try {
          const dimensions = await Promise.all(
            paths.map((path, mediaIndex) =>
              getDimensions(
                getUrl(path),
                file[mediaIndex === 0 ? "type" : `type${mediaIndex}`],
              ),
            ),
          );
          const heightRatio = dimensions.reduce(
            (total, size) => total + size.height / size.width,
            0,
          );
          const totalHeight = dimensions.reduce(
            (total, size) => total + size.height,
            0,
          );
          const nextFile = {
            ...file,
            mediaDimensions: dimensions,
            heightRatio,
            sourceHeight: totalHeight,
          };
          changed = true;
          console.info(`${project.id}.files[${fileIndex}]`, nextFile);
          return nextFile;
        } catch (error) {
          console.error(
            `${project.id}.files[${fileIndex}] skipped: ${error.message}`,
          );
          return file;
        }
      }),
    );

    if (changed) {
      updatedProjects += 1;
      if (shouldWrite) await project.ref.update({ files });
    }
  }

  console.info(
    `${shouldWrite ? "Updated" : "Would update"} ${updatedProjects} project document(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
