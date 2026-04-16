function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function sumStageMinutes(stages) {
  return stages.reduce((total, stage) => total + stage.minutes, 0);
}

export function countAutomatedStages(stages) {
  return stages.filter((stage) => stage.automated).length;
}

export function calculateAutomationRate(stages) {
  if (stages.length === 0) {
    return 0;
  }

  return Math.round((countAutomatedStages(stages) / stages.length) * 100);
}

export function calculateManualMinutes(stages) {
  return stages
    .filter((stage) => !stage.automated)
    .reduce((total, stage) => total + stage.minutes, 0);
}

export function calculateReviewLoad(filesChanged, reviewers) {
  if (!reviewers) {
    return filesChanged;
  }

  return Number((filesChanged / reviewers).toFixed(1));
}

export function calculateReadinessScore({
  automationRate,
  totalLeadTime,
  manualMinutes,
  rollbackWindowMinutes,
  reviewLoad
}) {
  const score = Math.round(
    53 +
      automationRate * 0.4 -
      totalLeadTime * 0.5 -
      manualMinutes * 0.8 -
      Math.max(rollbackWindowMinutes - 10, 0) -
      reviewLoad * 3
  );

  return clamp(score, 0, 100);
}

export function buildReadinessLabel(score) {
  if (score >= 75) {
    return "High";
  }

  if (score >= 55) {
    return "Medium";
  }

  return "Needs Attention";
}

export function buildStageDag(stages) {
  return stages.map((stage, index) => ({
    name: stage.name,
    dependsOn: index === 0 ? [] : [stages[index - 1].name],
    automated: stage.automated,
    minutes: stage.minutes
  }));
}
