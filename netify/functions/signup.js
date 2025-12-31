// netlify/functions/signup.js
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { raceId, name } = JSON.parse(event.body || "{}");
    const cleanName = String(name || "").trim();

    if (!raceId || cleanName.length < 2) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing raceId or name" }) };
    }

    const owner = process.env.GITHUB_OWNER;      // e.g. "wellnesswarriors"
    const repo  = process.env.GITHUB_REPO;       // e.g. "running-club"
    const path  = process.env.GITHUB_PATH || "races.json";
    const token = process.env.GITHUB_TOKEN;      // Fine for a small site; GitHub App is better long-term.

    if (!owner || !repo || !token) {
      return { statusCode: 500, body: JSON.stringify({ error: "Server misconfigured" }) };
    }

    // 1) Get current races.json (content + sha)
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        Accept: "application/vnd.github+json"
      }
    });

    if (!getRes.ok) {
      const msg = await getRes.text();
      return { statusCode: getRes.status, body: JSON.stringify({ error: "Failed to read races.json", detail: msg }) };
    }

    const file = await getRes.json();
    const sha = file.sha;
    const decoded = Buffer.from(file.content, "base64").toString("utf8");
    const json = JSON.parse(decoded);

    // 2) Update runners list
    const race = (json.races || []).find(r => r.id === raceId);
    if (!race) {
      return { statusCode: 404, body: JSON.stringify({ error: "Race not found" }) };
    }

    race.runners = Array.isArray(race.runners) ? race.runners : [];

    // Dedupe (case-insensitive)
    const exists = race.runners.some(n => n.toLowerCase() === cleanName.toLowerCase());
    if (!exists) race.runners.push(cleanName);

    // Optional: keep runners sorted
    race.runners.sort((a, b) => a.localeCompare(b));

    // 3) Commit updated file back to GitHub
    const updated = JSON.stringify(json, null, 2);
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: `Add runner ${cleanName} to ${raceId}`,
        content: Buffer.from(updated, "utf8").toString("base64"),
        sha
      })
    });

    if (!putRes.ok) {
      const msg = await putRes.text();
      return { statusCode: putRes.status, body: JSON.stringify({ error: "Failed to commit update", detail: msg }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, raceId, name: cleanName, runners: race.runners })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Unexpected error", detail: String(err) }) };
  }
}
