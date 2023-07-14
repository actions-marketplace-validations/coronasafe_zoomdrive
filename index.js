const core = require("@actions/core");
const zoom = require("./zoom");

function getDateRange() {
  const lookbackDays = Number(core.getInput("lookback-days") || 7);
  let end = new Date(core.getInput("end-date") || Date.now());

  let start = new Date(end);
  start.setDate(start.getDate() - lookbackDays);

  start = start.toISOString().split("T")[0];
  end = end.toISOString().split("T")[0];

  return [start, end];
}

async function downloadRecordings() {
  const account = core.getInput("zoom-account-id");
  const client = core.getInput("zoom-client-id");
  const clientSecret = core.getInput("zoom-client-secret");
  const [from, to] = getDateRange();

  core.info("Authenticating with Zoom using OAuth");
  await zoom.authenticate(account, client, clientSecret);

  core.info(`Obtaining Zoom Meetings and Recordings between ${from} and ${to}`);
  const { meetings } = await zoom.getRecordings("me", from, to);

  const files = await zoom.downloadMeeetings(meetings);
  core.info(`Downloaded ${files.length} files`);
}

async function run() {
  try {
    const recordings = await downloadRecordings();
    core.setOutput("recordings", recordings);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
