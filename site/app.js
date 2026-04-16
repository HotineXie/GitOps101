const stateElements = {
  version: document.querySelector("#version"),
  versionLabel: document.querySelector("#version-label"),
  commit: document.querySelector("#commit"),
  updatedAt: document.querySelector("#updated-at"),
  headline: document.querySelector("#headline"),
  summary: document.querySelector("#summary"),
  flowSummary: document.querySelector("#flow-summary"),
  sourceRef: document.querySelector("#source-ref"),
  flow: document.querySelector("#learning-path"),
  raw: document.querySelector("#raw-state"),
  status: document.querySelector("#status")
};

function formatDate(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(parsedDate);
}

function renderCommit(data) {
  if (data.commitUrl) {
    stateElements.commit.innerHTML = "";
    const link = document.createElement("a");
    link.href = data.commitUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = data.shortCommitHash;
    stateElements.commit.append(link);
    return;
  }

  stateElements.commit.textContent = data.shortCommitHash;
}

function renderLearningPath(steps) {
  stateElements.flow.innerHTML = "";

  steps.forEach((step, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><p>${step}</p>`;
    stateElements.flow.append(item);
  });
}

async function loadState() {
  const response = await fetch("./site-data.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load site-data.json: ${response.status}`);
  }

  return response.json();
}

async function bootstrap() {
  try {
    const data = await loadState();

    stateElements.version.textContent = data.version;
    stateElements.versionLabel.textContent = data.versionLabel;
    stateElements.updatedAt.textContent = formatDate(data.updatedAt);
    stateElements.headline.textContent = data.headline;
    stateElements.summary.textContent = data.summary;
    stateElements.flowSummary.textContent = data.flowSummary;
    stateElements.sourceRef.textContent = data.sourceRef;
    stateElements.status.textContent = "Synced with the latest deployment";
    renderCommit(data);
    renderLearningPath(data.learningPath);
    stateElements.raw.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    stateElements.status.textContent = "Failed to load site metadata";
    stateElements.raw.textContent = error.message;
  }
}

bootstrap();
