import "dotenv/config";

import { runWvHouseRosterSync } from "../src/lib/ingestion/wv-house-roster";

async function main() {
  const result = await runWvHouseRosterSync();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
