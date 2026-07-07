import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pipeline } from "node:stream/promises";

const OUT_DIR = "public/assets/room/vendor";

const assets = [
  {
    id: "room",
    uid: "5f63d254de7b481b8ae0a8cd60a47dbf",
    name: "Cozy room",
    url: "https://sketchfab.com/3d-models/none-5f63d254de7b481b8ae0a8cd60a47dbf"
  },
  {
    id: "computer",
    uid: "f844c0357d284fd8baa1435e9ff31bb2",
    name: "Retro computer",
    url: "https://sketchfab.com/3d-models/none-f844c0357d284fd8baa1435e9ff31bb2"
  },
  {
    id: "typewriter",
    uid: "cbfcb0e1d8c74f02bde4cfa7b92115f9",
    name: "Victorian typewriter",
    url: "https://sketchfab.com/3d-models/none-cbfcb0e1d8c74f02bde4cfa7b92115f9"
  },
  {
    id: "record-player",
    uid: "6f3b6984c2f74d64b08833b5f61c2253",
    name: "Vintage record player",
    url: "https://sketchfab.com/3d-models/none-6f3b6984c2f74d64b08833b5f61c2253"
  },
  {
    id: "gameboy",
    uid: "9143384668fa4b419aa0a833270cbe33",
    name: "Gameboy",
    url: "https://sketchfab.com/3d-models/none-9143384668fa4b419aa0a833270cbe33"
  }
];

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${url}`);
  }
  return res.json();
}

async function download(url, path) {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`${res.status} ${res.statusText}: ${url}`);
  }
  await pipeline(res.body, createWriteStream(path));
}

await mkdir(OUT_DIR, { recursive: true });

const attributions = [
  "# Room 3D Asset Attributions",
  "",
  "Downloaded from Sketchfab public downloadable model endpoints. Check each source page before redistribution.",
  ""
];

for (const asset of assets) {
  console.log(`Fetching ${asset.id}...`);
  const metadata = await getJson(`https://api.sketchfab.com/v3/models/${asset.uid}`);
  const downloads = await getJson(`https://api.sketchfab.com/v3/models/${asset.uid}/download`);
  const gltf = downloads.gltf;
  if (!gltf?.url) {
    throw new Error(`No glTF download for ${asset.id}`);
  }
  const file = join(OUT_DIR, `${asset.id}.zip`);
  await download(gltf.url, file);
  attributions.push(
    `- ${metadata.name || asset.name} by ${metadata.user?.displayName || metadata.user?.username || "Unknown"}: ${metadata.viewerUrl || asset.url}`,
    `  License: ${metadata.license?.label || "Unknown"} (${metadata.license?.url || "no license url"})`,
    `  Local archive: ${basename(file)}`,
    ""
  );
}

await writeFile(join(OUT_DIR, "ATTRIBUTIONS.md"), `${attributions.join("\n")}\n`);
console.log("Done.");
