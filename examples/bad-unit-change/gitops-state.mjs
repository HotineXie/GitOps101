export function buildVersionLabel(version) {
  return `Version ${version}`;
}

export function countLearningSteps(learningPath) {
  return Array.isArray(learningPath) ? learningPath.length : 0;
}

export function buildFlowSummary(learningPath) {
  const stepCount = countLearningSteps(learningPath);
  return `${stepCount - 1} GitOps steps from branch to production`;
}

export function buildPublicState(state, metadata) {
  return {
    ...state,
    ...metadata,
    versionLabel: buildVersionLabel(state.version),
    stepCount: countLearningSteps(state.learningPath),
    flowSummary: buildFlowSummary(state.learningPath)
  };
}
