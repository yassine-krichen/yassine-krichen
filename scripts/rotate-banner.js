// Picks a random .gif from assets/banners/ and updates the banner <img>
// src in README.md and README.fr.md. Run by .github/workflows/rotate-banner.yml.

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const bannerDir = path.join(repoRoot, "assets", "banners");

if (!fs.existsSync(bannerDir)) {
  console.error(`No banners folder found at ${bannerDir}. Nothing to do.`);
  process.exit(0);
}

const gifs = fs
  .readdirSync(bannerDir)
  .filter((f) => /\.gif$/i.test(f))
  .sort();

if (gifs.length === 0) {
  console.log("No .gif files found in assets/banners/. Skipping.");
  process.exit(0);
}

// Try not to pick the same gif that's already set, when there's a choice.
const readmeFiles = ["README.md", "README.fr.md"];
const currentSrcMatch = (() => {
  const readmePath = path.join(repoRoot, "README.md");
  if (!fs.existsSync(readmePath)) return null;
  const content = fs.readFileSync(readmePath, "utf8");
  const match = content.match(/src="assets\/banners\/([^"]+)"/);
  return match ? match[1] : null;
})();

let pool = gifs;
if (currentSrcMatch && gifs.length > 1) {
  pool = gifs.filter((f) => f !== currentSrcMatch);
}

const chosen = pool[Math.floor(Math.random() * pool.length)];
const newSrc = `assets/banners/${chosen}`;

for (const file of readmeFiles) {
  const filePath = path.join(repoRoot, file);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, "utf8");
  const updated = content.replace(
    /src="assets\/banners\/[^"]+"/,
    `src="${newSrc}"`
  );

  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log(`Updated ${file} -> ${newSrc}`);
  } else {
    console.log(`No banner src pattern found in ${file}, left unchanged.`);
  }
}
