const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

require("dotenv").config();

const root = process.cwd();
const baseSchemaPath = path.join(root, "prisma", "schema.prisma");
const generatedSchemaPath = path.join(root, "prisma", "schema.generated.prisma");

function detectProvider(databaseUrl) {
  if (!databaseUrl || databaseUrl.startsWith("file:")) {
    return "sqlite";
  }

  if (
    databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://") ||
    databaseUrl.startsWith("prisma+postgres://")
  ) {
    return "postgresql";
  }

  return "sqlite";
}

function writeSchema() {
  const provider = detectProvider(process.env.DATABASE_URL);
  const source = fs.readFileSync(baseSchemaPath, "utf8");
  const next = source.replace(/provider\s*=\s*"sqlite"|provider\s*=\s*"postgresql"/, `provider = "${provider}"`);
  fs.writeFileSync(generatedSchemaPath, next, "utf8");
  return generatedSchemaPath;
}

const schemaPath = writeSchema();
const cli = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma"
);
const args = [...process.argv.slice(2), "--schema", schemaPath];

const result = spawnSync(cli, args, {
  stdio: "inherit",
  env: process.env,
  cwd: root,
  shell: process.platform === "win32"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
