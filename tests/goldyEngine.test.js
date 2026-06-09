const assert = require("node:assert/strict");
const {
  createGoldyPlan,
  normalizeProject,
  SERVICE_LIBRARY
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
  assert.ok(plan.audioPlan.narrationScript.includes("Goldy"));
  assert.ok(plan.websiteBuild.sections.length >= 6);
  assert.ok(plan.deckSpec.slides.length >= 8);
  assert.ok(plan.assetReplacement.auditChecklist.includes("Resolution and aspect ratio"));
  assert.ok(plan.markdown.includes("# Client Film Pack"));
}

testDefaults();
testInvalidServicesAreIgnored();
testPlanIncludesProductionOutputs();

console.log("Goldy engine tests passed");
