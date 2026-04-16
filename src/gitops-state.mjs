export function buildVersionLabel(version) {
  return `Release v${version}`;
}

export function countLearningSteps(learningPath) {
  return Array.isArray(learningPath) ? learningPath.length : 0;
}

export function buildFlowSummary(learningPath) {
  const stepCount = countLearningSteps(learningPath);
  return `${stepCount} GitOps steps from branch to production`;
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
