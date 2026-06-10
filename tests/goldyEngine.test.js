const assert = require("node:assert/strict");
const {
  createGoldyPlan,
  normalizeProject,
  SERVICE_LIBRARY,
  DEFAULT_PROVIDERS,
  PROVIDER_LIBRARY
} = require("../src/goldyEngine");

function testDefaults() {
  const project = normalizeProject({});
  assert.equal(project.brandName, "Goldin Media");
  assert.deepEqual(project.services, ["social", "cinematic", "storyboard", "audio"]);
  assert.ok(project.aspectRatios.includes("16:9"));
}

function testInvalidServicesAreIgnored() {
  const project = normalizeProject({
    services: ["social", "not-real", "documentary"],
    aspectRatios: ["9:16", "bad-ratio"]
  });

  assert.deepEqual(project.services, ["social", "documentary"]);
  assert.deepEqual(project.aspectRatios, ["9:16"]);
}

function testPlanIncludesProductionOutputs() {
  const plan = createGoldyPlan({
    projectName: "Client Film Pack",
    clientName: "North Star Studio",
    audience: "premium founders",
    offer: "a cinematic brand launch",
    services: Object.keys(SERVICE_LIBRARY),
    aspectRatios: ["16:9", "9:16", "4:5"],
    tone: "luxury"
  });

  assert.equal(plan.project.projectName, "Client Film Pack");
  assert.equal(plan.storyboard.length, 6);
  assert.ok(plan.storyboard.some((scene) => scene.frame.includes("close-up")));
  assert.ok(plan.promptPack.masterVideoPrompt.includes("4K cinematic"));
  assert.ok(plan.audioPlan.narrationScript.includes("Goldie"));
  assert.ok(plan.websiteBuild.sections.length >= 6);
  assert.ok(plan.deckSpec.slides.length >= 8);
  assert.ok(plan.assetReplacement.auditChecklist.includes("Resolution and aspect ratio"));
  assert.ok(plan.videoEdit.autonomousTimeline.length >= 4);
  assert.ok(plan.captionPlan.opusClipsNotes.length >= 3);
  assert.ok(plan.providerHandoffs.length >= 1);
  assert.ok(plan.autonomousPipeline.stages.length >= 4);
  assert.ok(plan.markdown.includes("# Client Film Pack"));
  assert.ok(plan.markdown.includes("Provider Handoffs"));
}

function testProviderDefaults() {
  const project = normalizeProject({});
  assert.deepEqual(project.providers, DEFAULT_PROVIDERS);
  assert.ok(project.providers.includes("luma_labs"));
  assert.equal(PROVIDER_LIBRARY.luma_labs.role, "primary-creative-agent");
}

function testVideoSourceInPlan() {
  const plan = createGoldyPlan({
    videoSource: {
      fileName: "webinar.mp4",
      duration: 1842,
      width: 1920,
      height: 1080,
      hasAudio: true,
      uploaded: true
    },
    providers: ["luma_labs", "opus_clips", "flux"]
  });

  assert.ok(plan.videoEdit.sourceSummary.includes("webinar.mp4"));
  assert.equal(plan.providerHandoffs.length, 3);
}

testDefaults();
testInvalidServicesAreIgnored();
testPlanIncludesProductionOutputs();
testProviderDefaults();
testVideoSourceInPlan();

console.log("Goldie engine tests passed");
