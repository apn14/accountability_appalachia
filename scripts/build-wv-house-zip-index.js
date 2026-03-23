const fs = require("node:fs/promises");
const path = require("node:path");

const AdmZip = require("adm-zip");
const zipcodes = require("zipcodes");

const SOURCE_URL =
  "https://www.wvlegislature.gov/legisdocs/redistricting/house/datafiles/HODfinal_json.zip";
const OUTPUT_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "wv-house-zip-index.json"
);

function normalizeDistrictCode(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
}

function pointInRing(point, ring) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygon(point, polygonCoordinates) {
  if (!polygonCoordinates.length || !pointInRing(point, polygonCoordinates[0])) {
    return false;
  }

  for (let index = 1; index < polygonCoordinates.length; index += 1) {
    if (pointInRing(point, polygonCoordinates[index])) {
      return false;
    }
  }

  return true;
}

function pointInGeometry(point, geometry) {
  if (!geometry) {
    return false;
  }

  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }

  return false;
}

async function loadOfficialGeoJson() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent": "AccountabilityAppalachiaBot/0.1 (+https://accountabilityappalachia.local)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download WV House GeoJSON archive: ${response.status}`);
  }

  const archive = new AdmZip(Buffer.from(await response.arrayBuffer()));
  const entry = archive.getEntry("HODfinal_json.json");

  if (!entry) {
    throw new Error("Missing HODfinal_json.json in official archive");
  }

  return JSON.parse(entry.getData().toString("utf8"));
}

async function main() {
  const geoJson = await loadOfficialGeoJson();
  const features = geoJson.features
    .map((feature) => ({
      districtCode: normalizeDistrictCode(feature?.properties?.District),
      geometry: feature.geometry
    }))
    .filter((feature) => feature.districtCode);

  const wvZips = Object.values(zipcodes.codes)
    .filter((record) => record.state === "WV")
    .sort((left, right) => left.zip.localeCompare(right.zip));

  const zipToDistrict = {};
  let resolvedCount = 0;

  for (const record of wvZips) {
    const point = [record.longitude, record.latitude];
    const match = features.find((feature) => pointInGeometry(point, feature.geometry));

    if (!match) {
      continue;
    }

    zipToDistrict[record.zip] = {
      districtCode: match.districtCode,
      city: record.city,
      state: record.state,
      latitude: record.latitude,
      longitude: record.longitude
    };
    resolvedCount += 1;
  }

  const payload = {
    sourceUrl: SOURCE_URL,
    generatedAt: new Date().toISOString(),
    methodology:
      "WV ZIP codes are resolved to House districts by matching each ZIP centroid to the official WV House district boundary GeoJSON. This is useful for pilot discovery but remains approximate for ZIPs that span multiple districts.",
    zipCount: wvZips.length,
    resolvedCount,
    unresolvedCount: wvZips.length - resolvedCount,
    zipToDistrict
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2));

  console.log(
    JSON.stringify(
      {
        output: OUTPUT_PATH,
        zipCount: payload.zipCount,
        resolvedCount: payload.resolvedCount,
        unresolvedCount: payload.unresolvedCount
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
