const fs = require("fs");
const path = require("path");

// Folder where the .txt files are located
const inputDir = __dirname;

// --- DEBUG HELPERS ---
function fatal(msg) {
  console.error("ERROR:", msg);
  process.exit(1);
}

function warn(msg) {
  console.warn("WARNING:", msg);
}

// Basic hostname validation
const hostnameRegex =
  /^(?=.{1,253}$)(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

// Valid cert types
const validCertTypes = new Set(["CPS_MANAGED", "DEFAULT"]);

// --- GET TXT FILES ---
let txtFiles;
try {
  txtFiles = fs
    .readdirSync(inputDir)
    .filter((file) => file.toLowerCase().endsWith(".txt"));
} catch (err) {
  fatal(`Failed to read directory: ${err.message}`);
}

if (txtFiles.length === 0) {
  fatal(`No .txt files found in directory: ${inputDir}`);
}

// --- BUILD OBJECTS ---
const objects = [];

for (const fileName of txtFiles) {
  const inputFile = path.join(inputDir, fileName);

  let raw;
  try {
    raw = fs.readFileSync(inputFile, "utf8");
  } catch (err) {
    warn(`Skipping file "${fileName}" - failed to read: ${err.message}`);
    continue;
  }

  const lines = raw
    .split(/\r?\n/)
    .map((s, i) => ({ value: s.trim(), line: i + 1 }))
    .filter(({ value }) => value && !value.startsWith("#"));

  if (lines.length < 3) {
    warn(
      `Skipping file "${fileName}" - must contain at least EDGE_HOSTNAME_ID, CERT_TYPE, and 1 hostname`
    );
    continue;
  }

  // Read metadata from the same file
  const edgeLine = lines[0].value;
  const certLine = lines[1].value;

  const edgeMatch = edgeLine.match(/^EDGE_HOSTNAME_ID\s*=\s*(.+)$/);
  const certMatch = certLine.match(/^CERT_TYPE\s*=\s*(.+)$/);

  if (!edgeMatch) {
    warn(
      `Skipping file "${fileName}" - first valid line must be like: EDGE_HOSTNAME_ID=ehn_123456`
    );
    continue;
  }

  if (!certMatch) {
    warn(
      `Skipping file "${fileName}" - second valid line must be like: CERT_TYPE=CPS_MANAGED`
    );
    continue;
  }

  const EDGE_HOSTNAME_ID = edgeMatch[1].trim();
  const CERT_TYPE = certMatch[1].trim();

  if (!/^ehn_\d+$/.test(EDGE_HOSTNAME_ID)) {
    warn(
      `Skipping file "${fileName}" - invalid EDGE_HOSTNAME_ID: "${EDGE_HOSTNAME_ID}"`
    );
    continue;
  }

  if (!validCertTypes.has(CERT_TYPE)) {
    warn(
      `Skipping file "${fileName}" - invalid CERT_TYPE: "${CERT_TYPE}". Allowed: CPS_MANAGED or DEFAULT`
    );
    continue;
  }

  // Remaining lines are hostnames
  const hostnameLines = lines.slice(2);

  for (const { value: cnameFrom, line } of hostnameLines) {
    if (!hostnameRegex.test(cnameFrom)) {
      warn(
        `File "${fileName}", line ${line}: Invalid hostname skipped → "${cnameFrom}"`
      );
      continue;
    }

    objects.push({
      cnameFrom,
      cnameType: "EDGE_HOSTNAME",
      edgeHostnameId: EDGE_HOSTNAME_ID,
      certProvisioningType: CERT_TYPE,
    });
  }
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
