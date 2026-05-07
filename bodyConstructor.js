const fs = require("fs");
const path = require("path");

// Fixed values
const inputFile = path.join(__dirname, "hostnameList.txt");   ///update hostname list with the feeding HN file
const EDGE_HOSTNAME_ID = "ehn_2727795";  //update Edge Hostname ID associated to the hostnames in the  list.
const CERT_TYPE = "CPS_MANAGED"; //update as per the cert type of the hostnames in the list. CPS_MANAGED or DEFAULT.

// --- DEBUG HELPERS ---
function fatal(msg) {
  console.error("ERROR:", msg);
  process.exit(1);
}

function warn(msg) {
  console.warn("WARNING:", msg);
}

// --- CHECK FILE EXISTS ---
if (!fs.existsSync(inputFile)) {
  fatal(`Input file not found: ${inputFile}`);
}

// --- READ FILE ---
let raw;
try {
  raw = fs.readFileSync(inputFile, "utf8");
} catch (err) {
  fatal(`Failed to read file: ${err.message}`);
}

// --- PARSE + VALIDATE LINES ---
const lines = raw
  .split(/\r?\n/)
  .map((s, i) => ({ value: s.trim(), line: i + 1 }))
  .filter(({ value }) => value && !value.startsWith("#"));

if (lines.length === 0) {
  fatal("No valid cnameFrom entries found in file.");
}

// Basic hostname validation
const hostnameRegex =
  /^(?=.{1,253}$)(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

// --- BUILD OBJECTS ---
const objects = [];

for (const { value: cnameFrom, line } of lines) {
  if (!hostnameRegex.test(cnameFrom)) {
    warn(`Line ${line}: Invalid hostname skipped → "${cnameFrom}"`);
    continue;
  }

  objects.push({
    cnameFrom, // FIRST
    cnameType: "EDGE_HOSTNAME",
    edgeHostnameId: EDGE_HOSTNAME_ID,
    certProvisioningType: CERT_TYPE,
  });
}

if (objects.length === 0) {
  fatal("All entries were invalid. Nothing to output.");
}

// --- OUTPUT AS JS (NOT JSON) ---
console.log("Built JS object list:\n");
console.log("[");

objects.forEach((obj, index) => {
  console.log("  {");
  console.log(`    cnameFrom: '${obj.cnameFrom}',`);
  console.log(`    cnameType: '${obj.cnameType}',`);
  console.log(`    edgeHostnameId: '${obj.edgeHostnameId}',`);
  console.log(`    certProvisioningType: '${obj.certProvisioningType}',`);
  console.log(index === objects.length - 1 ? "  }" : "  },");
});

console.log("]");
