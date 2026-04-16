import { extractKeywords, joinOwners, slugifyText } from "./string-utils.mjs";
import {
  buildReadinessLabel,
  buildStageDag,
  calculateAutomationRate,
  calculateManualMinutes,
  calculateReadinessScore,
  calculateReviewLoad,
  sumStageMinutes
} from "./pipeline-metrics.mjs";

export function buildVersionLabel(version) {
  return `Release v${version}`;
}

export function buildChangeBrief(changeRequest) {
  return {
    changeSlug: slugifyText(changeRequest.title),
    keywordTags: extractKeywords(`${changeRequest.title} ${changeRequest.description}`),
    ownerLine: joinOwners(changeRequest.owners),
    reviewLoad: calculateReviewLoad(changeRequest.filesChanged, changeRequest.reviewers)
  };
}

export function buildDeliveryInsights(pipelineStages, changeRequest) {
  const totalLeadTime = sumStageMinutes(pipelineStages);
  const automationRate = calculateAutomationRate(pipelineStages);
  const manualMinutes = calculateManualMinutes(pipelineStages);
  const reviewLoad = calculateReviewLoad(changeRequest.filesChanged, changeRequest.reviewers);
  const readinessScore = calculateReadinessScore({
    automationRate,
    totalLeadTime,
    manualMinutes,
    rollbackWindowMinutes: changeRequest.rollbackWindowMinutes,
    reviewLoad
  });

  return {
    totalLeadTime,
    automationRate,
    manualMinutes,
    reviewLoad,
    readinessScore,
    readinessLabel: buildReadinessLabel(readinessScore),
    stageDag: buildStageDag(pipelineStages)
  };
}

export function buildReleaseNarrative(version, changeBrief, deliveryInsights) {
  return `${buildVersionLabel(version)} ships "${changeBrief.changeSlug}" with ${deliveryInsights.automationRate}% automation and a ${deliveryInsights.readinessLabel.toLowerCase()} rollout score of ${deliveryInsights.readinessScore}.`;
}

export function buildFlowSummary(deliveryInsights) {
  return `${deliveryInsights.totalLeadTime} minutes from pull request to GitHub Pages, with ${deliveryInsights.manualMinutes} manual minutes left in the loop.`;
}

export function buildPublicState(state, metadata) {
  const changeBrief = buildChangeBrief(state.changeRequest);
  const deliveryInsights = buildDeliveryInsights(state.pipelineStages, state.changeRequest);

  return {
    ...state,
    ...metadata,
    versionLabel: buildVersionLabel(state.version),
    flowSummary: buildFlowSummary(deliveryInsights),
    releaseNarrative: buildReleaseNarrative(state.version, changeBrief, deliveryInsights),
    ...changeBrief,
    ...deliveryInsights
  };
}
