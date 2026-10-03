import { readFile } from "node:fs/promises";

const sourceFile = new URL("../src/rules/2026/sources.json", import.meta.url);
const sources = JSON.parse(await readFile(sourceFile, "utf8"));

const checkSource = async ({ id, url }) => {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: {
        "accept-language": "es-ES,es;q=0.9,en;q=0.7",
        "user-agent": "CEUTONOMO source-availability check",
      },
    });
    await response.body?.cancel();
    return { id, url, status: response.status, finalUrl: response.url, ok: response.ok };
  } catch (error) {
    return { id, url, status: 0, finalUrl: url, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
};

const results = [];
for (let index = 0; index < sources.length; index += 5) {
  results.push(...await Promise.all(sources.slice(index, index + 5).map(checkSource)));
}

for (const result of results) {
  const redirect = result.finalUrl !== result.url ? ` -> ${result.finalUrl}` : "";
  console.log(`${result.ok ? "PASS" : "FAIL"} ${result.status || "ERR"} ${result.id}${redirect}`);
  if (result.error) console.log(`  ${result.error}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} official source URLs reachable.`);
if (failed.length) process.exitCode = 1;
