const stateElements = {
  courseTitle: document.querySelector("#course-title"),
  headline: document.querySelector("#headline"),
  summary: document.querySelector("#summary"),
  releaseNarrative: document.querySelector("#release-narrative"),
  version: document.querySelector("#version"),
  versionLabel: document.querySelector("#version-label"),
  leadTime: document.querySelector("#lead-time"),
  manualMinutes: document.querySelector("#manual-minutes"),
  automationRate: document.querySelector("#automation-rate"),
  readinessLabel: document.querySelector("#readiness-label"),
  readinessScore: document.querySelector("#readiness-score"),
  reviewLoad: document.querySelector("#review-load"),
  changeTitle: document.querySelector("#change-title"),
  changeDescription: document.querySelector("#change-description"),
  ownerLine: document.querySelector("#owner-line"),
  changeSlug: document.querySelector("#change-slug"),
  rollbackWindow: document.querySelector("#rollback-window"),
  keywordTags: document.querySelector("#keyword-tags"),
  flowSummary: document.querySelector("#flow-summary"),
  pipelineStages: document.querySelector("#pipeline-stages"),
  flow: document.querySelector("#learning-path"),
  dagGraph: document.querySelector("#dag-graph"),
  releaseNotes: document.querySelector("#release-notes"),
  studentQuestions: document.querySelector("#student-questions"),
  commit: document.querySelector("#commit"),
  updatedAt: document.querySelector("#updated-at"),
  sourceRef: document.querySelector("#source-ref"),
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

function renderList(element, values) {
  element.innerHTML = "";

  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    element.append(item);
  });
}

function renderTags(tags) {
  stateElements.keywordTags.innerHTML = "";

  tags.forEach((tag) => {
    const item = document.createElement("span");
    item.className = "tag";
    item.textContent = tag;
    stateElements.keywordTags.append(item);
  });
}

function renderPipelineStages(stages) {
  stateElements.pipelineStages.innerHTML = "";

  stages.forEach((stage) => {
    const item = document.createElement("li");
    item.className = "stage-item";
    item.innerHTML = `
      <div class="stage-head">
        <strong>${stage.name}</strong>
        <span>${stage.minutes} min</span>
      </div>
      <p>${stage.purpose}</p>
      <small>${stage.automated ? "Automated" : "Manual"} stage</small>
    `;
    stateElements.pipelineStages.append(item);
  });
}

async function loadState() {
  const response = await fetch("./deploy-state.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load deploy-state.json: ${response.status}`);
  }

  return response.json();
}

async function bootstrap() {
  try {
    const data = await loadState();

    stateElements.courseTitle.textContent = data.courseTitle;
    stateElements.version.textContent = data.version;
    stateElements.versionLabel.textContent = data.versionLabel;
    stateElements.leadTime.textContent = `${data.totalLeadTime} min`;
    stateElements.manualMinutes.textContent = `${data.manualMinutes} manual min`;
    stateElements.automationRate.textContent = `${data.automationRate}%`;
    stateElements.readinessLabel.textContent = `${data.readinessLabel} readiness`;
    stateElements.readinessScore.textContent = String(data.readinessScore);
    stateElements.reviewLoad.textContent = `${data.reviewLoad} files per reviewer`;
    stateElements.headline.textContent = data.headline;
    stateElements.summary.textContent = data.summary;
    stateElements.flowSummary.textContent = data.flowSummary;
    stateElements.releaseNarrative.textContent = data.releaseNarrative;
    stateElements.changeTitle.textContent = data.changeRequest.title;
    stateElements.changeDescription.textContent = data.changeRequest.description;
    stateElements.ownerLine.textContent = data.ownerLine;
    stateElements.changeSlug.textContent = data.changeSlug;
    stateElements.rollbackWindow.textContent = `${data.changeRequest.rollbackWindowMinutes} min`;
    stateElements.sourceRef.textContent = data.sourceRef;
    stateElements.updatedAt.textContent = formatDate(data.updatedAt);
    stateElements.status.textContent = "Synced with the latest deployment";
    renderCommit(data);
    renderTags(data.keywordTags);
    renderPipelineStages(data.pipelineStages);
    renderLearningPath(data.learningPath);
    renderList(stateElements.releaseNotes, data.releaseNotes);
    renderList(stateElements.studentQuestions, data.studentQuestions);
    stateElements.raw.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    stateElements.status.textContent = "Failed to load site metadata";
    stateElements.raw.textContent = error.message;
  }
}

bootstrap();
