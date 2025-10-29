const fs = require("fs");

const input = "index.js";
const content = fs.readFileSync(input, "utf16le"); // Read UTF-16 encoded file
fs.writeFileSync(input, content.toString("utf8"), "utf8"); // Rewrite in UTF-8

console.log("✅ index.js re-saved as UTF-8!");
