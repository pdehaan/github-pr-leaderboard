const data = require("./leaderboard.json");

const leaderboard = [];
const summary = { additions: 0, deletions: 0 };

for (const [login, prs] of Object.entries(data.leaderboard)) {
  const stats = prs.reduce(
    (obj, pr) => {
      obj.prs.push(`#${pr.number}`);
      obj.additions += pr.additions;
      obj.deletions += pr.deletions;
      summary.additions += pr.additions;
      summary.deletions += pr.deletions;
      return obj;
    },
    { additions: 0, deletions: 0, prs: [] }
  );
  leaderboard.push({
    login,
    additions: stats.additions,
    deletions: stats.deletions,
    prs: stats.prs,
  });
}

console.log(
  `🧁 Leaderboard for ${localeDate(data.meta.fromDate)} to ${localeDate(
    data.meta.toDate
  )}`
);
for (const res of leaderboard.sort((a, b) => b.deletions - a.deletions)) {
  const additionsPct = pct(res.additions, summary.additions);
  const deletionsPct = pct(res.deletions, summary.deletions);
  console.log(
    [
      res.login.padEnd(12, " "),
      `+${res.additions} (${additionsPct})`,
      `-${res.deletions} (${deletionsPct})`,
      `±${res.additions - res.deletions}`,
      `${res.prs.length} PRs: ${res.prs.join(", ")}`,
    ].join("\t| ")
  );
}

function localeDate(d) {
  return new Date(d).toLocaleDateString();
}

function pct(a, b) {
  return Number((a / b) * 100).toFixed(1) + "%";
}
