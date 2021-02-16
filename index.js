const ms = require("ms");
const { octokit } = require("./gh");

main("mozilla", "experimenter");

async function main(owner, repo) {
  const fromDate = new Date(2021, 1, 1);
  const toDate = new Date(fromDate.getTime() + ms("7d"));
  const leaderboard = await pullsList(owner, repo, fromDate, toDate);

  console.log(
    JSON.stringify({ meta: { fromDate, toDate }, leaderboard }, null, 2)
  );
}

async function pullsList(owner, repo, fromDate, toDate = new Date()) {
  const prs = await octokit.pulls.list({
    owner,
    repo,
    state: "closed",
    per_page: 70,
    sort: "created",
    direction: "desc",
  });

  const stats = new Map();
  const pulls = prs.data.filter((pr) => {
    return (
      !!pr.merged_at &&
      pr.user.login !== "dependabot[bot]" &&
      Date.parse(pr.merged_at) >= fromDate &&
      Date.parse(pr.merged_at) <= toDate
    );
  });
  for (const pull of pulls) {
    const res = await pullsGet(owner, repo, pull.number);
    const login = res.user.login;
    const arr = stats.get(login) || [];
    arr.push(Object.assign({}, pull, res));
    stats.set(login, arr);
  }
  return Object.fromEntries(stats);
}

async function pullsGet(owner, repo, pull_number) {
  const pr = await octokit.pulls.get({ owner, repo, pull_number });
  return pr.data;
}
