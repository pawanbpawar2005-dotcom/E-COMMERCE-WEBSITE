import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");

const filesToCopy = [
  "index.html",
  "product.html",
  "cart.html",
  "checkout.html",
  "CPU.html",
  "GPU.html",
  "MOTHERBOARD.html",
  "PSU.html",
  "RAM.html",
  "STORAGE.html",
  "success.html",
  "cancel.html",
  "style.css",
  "cart.js",
  "catalog.js",
  "checkout.js",
  "api.js",
];

const directoriesToCopy = ["PHOTOS"];

function ensureEmptyDir(directory) {
  fs.mkdirSync(directory, { recursive: true });

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    try {
      if (entry.isDirectory()) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(entryPath);
      }
    } catch (error) {
      console.warn(`Skipping cleanup for ${entryPath}: ${error.message}`);
    }
  }
}

ensureEmptyDir(distDir);

for (const file of filesToCopy) {
  fs.copyFileSync(path.join(rootDir, file), path.join(distDir, file));
}

for (const directory of directoriesToCopy) {
  fs.cpSync(path.join(rootDir, directory), path.join(distDir, directory), {
    recursive: true,
  });
}

console.log("Netlify build assets prepared in dist/");
