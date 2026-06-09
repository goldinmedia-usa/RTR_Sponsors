const serviceGrid = document.querySelector("#serviceGrid");
const ratioGrid = document.querySelector("#ratioGrid");
const toneSelect = document.querySelector("#tone");
const form = document.querySelector("#goldyForm");
const output = document.querySelector("#output");
const quickStartButton = document.querySelector("#quickStart");
const commandPrompt = document.querySelector("#commandPrompt");
const runCommandButton = document.querySelector("#runCommand");
const sampleAskButton = document.querySelector("#sampleAsk");
const interfaceStatus = document.querySelector("#interfaceStatus");
const copyButton = document.querySelector("#copyPlan");
const downloadButton = document.querySelector("#downloadPlan");
const newButton = document.querySelector("#newPlan");
const skillGrid = document.querySelector("#skillGrid");
const skillCategoryFilters = document.querySelector("#skillCategoryFilters");
const providerGrid = document.querySelector("#providerGrid");
const videoUpload = document.querySelector("#videoUpload");
const videoBrowse = document.querySelector("#videoBrowse");
const videoDropzone = document.querySelector("#videoDropzone");
const videoMeta = document.querySelector("#videoMeta");
const videoPreview = document.querySelector("#videoPreview");
const captionStyleInput = document.querySelector("#captionStyle");

let currentPlan = null;
let registryData = null;
let providersData = null;
let selectedSkillIds = new Set(["autonomous_video_editing", "luma_labs_creative_agent", "opus_clips_short_form"]);
let selectedProviderIds = new Set(GoldyEngine.DEFAULT_PROVIDERS);
let activeSkillCategory = "all";
let videoSource = { uploaded: false };

const SAMPLE_ASK =
  "Goldie, take my uploaded video and make Opus-style shorts with captions. Generate 4K b-roll in Luma Labs from Flux start frames, add Runway motion on the hero, and deliver a black-and-gold campaign pack with storyboards and social cutdowns.";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeDeep(value) {
  if (typeof value === "string") return escapeHtml(value);
  if (Array.isArray(value)) return value.map(escapeDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, escapeDeep(item)]));
  }
  return value;
}

function createCheckbox({ id, label, description, checked }) {
  const wrapper = document.createElement("label");
  wrapper.className = "choice-card";
  wrapper.innerHTML = `
    <input type="checkbox" value="${id}" ${checked ? "checked" : ""}>
    <span>
      <strong>${label}</strong>
      <small>${description}</small>
    </span>
  `;
  return wrapper;
}

function hydrateControls() {
  Object.entries(GoldyEngine.SERVICE_LIBRARY).forEach(([id, service], index) => {
    serviceGrid.appendChild(
      createCheckbox({
        id,
        label: service.label,
        description: service.outputs.slice(0, 3).join(" • "),
        checked: index < 4
      })
    );
  });

  GoldyEngine.ASPECT_RATIOS.forEach((ratio) => {
    ratioGrid.appendChild(
      createCheckbox({
        id: ratio,
        label: ratio,
        description: ratio === "9:16" ? "Vertical social" : ratio === "16:9" ? "Film / web" : "Social layout",
        checked: ["16:9", "9:16", "4:5"].includes(ratio)
      })
    );
  });

  Object.entries(GoldyEngine.TONE_PRESETS).forEach(([id, tone]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = tone.label;
    toneSelect.appendChild(option);
  });
}

function getCheckedValues(container) {
  return Array.from(container.querySelectorAll("input:checked")).map((input) => input.value);
}

function getFormData() {
  return {
    projectName: document.querySelector("#projectName").value,
    brandName: document.querySelector("#brandName").value,
    clientName: document.querySelector("#clientName").value,
    website: document.querySelector("#website").value,
    goal: document.querySelector("#goal").value,
    audience: document.querySelector("#audience").value,
    offer: document.querySelector("#offer").value,
    assets: document.querySelector("#assets").value,
    references: document.querySelector("#references").value,
    duration: document.querySelector("#duration").value,
    tone: toneSelect.value,
    services: getCheckedValues(serviceGrid),
    aspectRatios: getCheckedValues(ratioGrid),
    includeWebsiteBuild: document.querySelector("#includeWebsiteBuild").checked,
    mustIncludeCloseups: document.querySelector("#mustIncludeCloseups").checked,
    autoEdit: document.querySelector("#autoEdit").checked,
    providers: Array.from(selectedProviderIds),
    selectedSkills: Array.from(selectedSkillIds),
    captionStyle: captionStyleInput.value,
    videoSource
  };
}

function setFieldValue(selector, value) {
  document.querySelector(selector).value = value;
}

function inferServicesFromCommand(command) {
  const lowered = command.toLowerCase();
  const services = new Set(["social", "cinematic", "storyboard", "audio"]);
  const keywordMap = {
    documentary: ["documentary", "interview", "docu", "founder story", "webinar", "podcast"],
    website: ["website", "landing page", "web page", "homepage", "site"],
    decks: ["deck", "slide", "presentation", "pitch"],
    replacement: ["replace", "replacement", "remix", "retouch", "drop in", "photo", "video asset", "b-roll", "b roll"]
  };

  Object.entries(keywordMap).forEach(([service, keywords]) => {
    if (keywords.some((keyword) => lowered.includes(keyword))) services.add(service);
  });

  return Array.from(services);
}

function inferProvidersFromCommand(command) {
  const lowered = command.toLowerCase();
  const providers = new Set(GoldyEngine.DEFAULT_PROVIDERS);
  const keywordMap = {
    runway: ["runway"],
    kling: ["kling"],
    flux: ["flux"],
    higgsfield: ["higgsfield"],
    opus_clips: ["opus", "clips", "shorts", "caption"],
    seedance: ["seedance", "sea dance"],
    cling: ["cling"],
    nano_banana_pro: ["nano banana", "4k frame", "macro"]
  };

  Object.entries(keywordMap).forEach(([provider, keywords]) => {
    if (keywords.some((keyword) => lowered.includes(keyword))) providers.add(provider);
  });

  return Array.from(providers);
}

function inferSkillsFromCommand(command, providers) {
  const skills = new Set(["autonomous_video_editing", "luma_labs_creative_agent"]);
  const lowered = command.toLowerCase();

  if (lowered.includes("opus") || lowered.includes("caption") || lowered.includes("short")) {
    skills.add("opus_clips_short_form");
  }
  if (providers.includes("runway")) skills.add("runway_video_generation");
  if (providers.includes("kling")) skills.add("kling_video_generation");
  if (providers.includes("flux")) skills.add("flux_image_generation");
  if (providers.includes("higgsfield")) skills.add("higgsfield_plugin_generation");
  if (providers.includes("seedance")) skills.add("seedance_motion");
  if (providers.includes("cling")) skills.add("cling_motion");
  if (providers.includes("nano_banana_pro")) skills.add("nano_banana_pro_frames");

  return Array.from(skills);
}

function applyCommandToSetup(command) {
  const cleanedCommand = command.replace(/\s+/g, " ").trim() || SAMPLE_ASK;
  const services = inferServicesFromCommand(cleanedCommand);
  const providers = inferProvidersFromCommand(cleanedCommand);
  const skills = inferSkillsFromCommand(cleanedCommand, providers);
  const projectName = cleanedCommand.length > 80 ? "Goldie Command Production View" : cleanedCommand;

  selectedProviderIds = new Set(providers);
  selectedSkillIds = new Set(skills);
  renderProviderGrid();
  renderSkillGrid();

  setFieldValue("#projectName", projectName);
  setFieldValue("#brandName", "Goldin Media");
  setFieldValue("#clientName", "Client from Goldie ask");
  setFieldValue(
    "#website",
    "Use the supplied website URL, pasted website copy, discovery notes, or client source assets."
  );
  setFieldValue("#goal", cleanedCommand);
  setFieldValue(
    "#audience",
    "clients and buyers who need premium marketing that feels cinematic, trustworthy, and conversion-ready"
  );
  setFieldValue("#offer", "a full-service Goldin Media creative production package");
  setFieldValue(
    "#assets",
    videoSource.uploaded
      ? `Uploaded video: ${videoSource.fileName}`
      : "Upload a source video or list photos, videos, logos, and brand references."
  );
  setFieldValue(
    "#references",
    "luxury black-and-gold campaigns, Luma Labs, Opus Clips, Runway, Kling, Flux, prestige documentaries"
  );
  setFieldValue("#duration", "60-second hero film with 15-second and 6-second cutdowns");
  document.querySelector("#autoEdit").checked = true;

  serviceGrid.querySelectorAll("input").forEach((input) => {
    input.checked = services.includes(input.value);
  });
  ratioGrid.querySelectorAll("input").forEach((input) => {
    input.checked = ["16:9", "9:16", "4:5"].includes(input.value);
  });
  document.querySelector("#includeWebsiteBuild").checked = services.includes("website");
  document.querySelector("#mustIncludeCloseups").checked = true;
  toneSelect.value = cleanedCommand.toLowerCase().includes("documentary") ? "documentary" : "luxury";
}

function generateCurrentPlan({ scrollTarget = output } = {}) {
  currentPlan = GoldyEngine.createGoldyPlan(getFormData());
  renderPlan(currentPlan);
  copyButton.disabled = false;
  downloadButton.disabled = false;
  newButton.disabled = false;
  scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderDeliverables(deliverables) {
  return deliverables
    .map(
      (item) => `
        <article class="mini-card">
          <h4>${item.label}</h4>
          ${renderList(item.outputs)}
        </article>
      `
    )
    .join("");
}

function renderStoryboard(storyboard) {
  return storyboard
    .map(
      (scene) => `
        <article class="scene-card">
          <div>
            <span class="eyebrow">${scene.beat}</span>
            <h4>${scene.frame}</h4>
          </div>
          <dl>
            <dt>Camera</dt><dd>${scene.camera}</dd>
            <dt>Lighting</dt><dd>${scene.lighting}</dd>
            <dt>Voiceover</dt><dd>${scene.voiceover}</dd>
            <dt>Prompt</dt><dd>${scene.prompt}</dd>
            <dt>Edit</dt><dd>${scene.edit}</dd>
          </dl>
        </article>
      `
    )
    .join("");
}

function renderSocialPack(pack) {
  return pack
    .map(
      (item) => `
        <article class="mini-card">
          <h4>${item.platform}</h4>
          <p><strong>${item.format}</strong></p>
          <p>${item.creativeAngle}</p>
          <p class="muted">Hook: ${item.hookOptions[0]}</p>
        </article>
      `
    )
    .join("");
}

function renderPromptCards(promptPack) {
  const cards = [
    ["Master image prompt", promptPack.masterImagePrompt],
    ["Master video prompt", promptPack.masterVideoPrompt],
    ["Voice prompt", promptPack.voicePrompt],
    ["Typography prompt", promptPack.typographyPrompt],
    ["Negative prompt", promptPack.negativePrompt]
  ];

  return cards
    .map(
      ([title, body]) => `
        <article class="prompt-card">
          <h4>${title}</h4>
          <p>${body}</p>
        </article>
      `
    )
    .join("");
}

function renderProviderHandoffs(handoffs) {
  return handoffs
    .map(
      (handoff) => `
        <article class="provider-handoff-card ${handoff.providerId === "luma_labs" ? "primary-agent" : ""}">
          <div class="provider-handoff-head">
            <h4>${handoff.name}</h4>
            <span class="provider-role">${handoff.role.replace(/-/g, " ")}</span>
          </div>
          <p class="muted">${handoff.tagline}</p>
          <p><strong>Best for:</strong> ${handoff.bestFor.join(", ")}</p>
          ${renderList(handoff.beats.slice(0, 3).map((beat) => `${beat.beat} — ${beat.motionPrompt.slice(0, 120)}…`))}
          <p class="muted">${handoff.exportNotes}</p>
        </article>
      `
    )
    .join("");
}

function renderAutonomousPipeline(pipeline) {
  return pipeline.stages
    .map(
      (stage) => `
        <article class="mini-card">
          <h4>${stage.stage}</h4>
          ${renderList(stage.actions)}
        </article>
      `
    )
    .join("");
}

function renderPlan(plan) {
  plan = escapeDeep(plan);

  output.innerHTML = `
    <section class="result-hero">
      <div>
        <span class="eyebrow">Goldie production package</span>
        <h2>${plan.project.projectName}</h2>
        <p>${plan.creativeBrief.promise}</p>
        <div class="view-tabs" aria-label="Production view shortcuts">
          <a href="#view-brief">Brief</a>
          <a href="#view-video">Video edit</a>
          <a href="#view-providers">Providers</a>
          <a href="#view-storyboard">Storyboard</a>
          <a href="#view-prompts">Prompts</a>
          <a href="#view-social">Social</a>
          <a href="#view-pipeline">Pipeline</a>
        </div>
      </div>
      <div class="badge-stack">
        <span>${plan.project.duration}</span>
        <span>${plan.project.aspectRatios.join(" / ")}</span>
        <span>${plan.autonomousPipeline.primaryCreativeAgent} lead</span>
        <span>${plan.project.providers.length} providers</span>
      </div>
    </section>

    <section class="panel" id="view-brief">
      <h3>Creative Brief</h3>
      <div class="brief-grid">
        <p><strong>Positioning:</strong> ${plan.creativeBrief.positioning}</p>
        <p><strong>Audience tension:</strong> ${plan.creativeBrief.audienceTension}</p>
        <p><strong>Visual world:</strong> ${plan.creativeBrief.visualWorld}</p>
        <p><strong>Lighting:</strong> ${plan.creativeBrief.lighting}</p>
        <p><strong>Typography:</strong> ${plan.creativeBrief.typography}</p>
      </div>
      ${renderList(plan.creativeBrief.successCriteria)}
    </section>

    <section class="panel" id="view-video">
      <h3>Autonomous Video Edit</h3>
      <p><strong>Source:</strong> ${plan.videoEdit.sourceSummary}</p>
      <div class="split">
        <div>
          <h4>Opus Clips workflow</h4>
          ${renderList(plan.videoEdit.opusClipsWorkflow)}
        </div>
        <div>
          <h4>Timeline</h4>
          ${renderList(plan.videoEdit.autonomousTimeline)}
        </div>
      </div>
      <h4>B-roll shot list</h4>
      ${renderList(plan.videoEdit.bRollShotList)}
      <p class="muted">${plan.videoEdit.nleHandoff}</p>
    </section>

    <section class="panel" id="view-captions">
      <h3>Captions</h3>
      <p><strong>Style:</strong> ${plan.captionPlan.style}</p>
      <div class="script-box">
        <span class="eyebrow">Caption script</span>
        <p>${plan.captionPlan.fullScript}</p>
      </div>
      <div class="split">
        <div>
          <h4>Opus Clips notes</h4>
          ${renderList(plan.captionPlan.opusClipsNotes)}
        </div>
        <div>
          <h4>Accessibility</h4>
          ${renderList(plan.captionPlan.accessibility)}
        </div>
      </div>
    </section>

    <section class="panel" id="view-providers">
      <h3>Provider Handoffs</h3>
      <p class="muted">Luma Labs routes as primary creative agent. Click providers above to change routing on the next generation.</p>
      <div class="card-grid provider-handoff-grid">${renderProviderHandoffs(plan.providerHandoffs)}</div>
    </section>

    <section class="panel">
      <h3>Selected Production Services</h3>
      <div class="card-grid">${renderDeliverables(plan.deliverables)}</div>
    </section>

    <section class="panel">
      <h3>Campaign Angles</h3>
      <div class="card-grid">
        ${plan.campaignAngles
          .map(
            (angle) => `
              <article class="mini-card">
                <h4>${angle.title}</h4>
                <p>${angle.hook}</p>
                <p class="muted">${angle.payoff}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel" id="view-storyboard">
      <h3>Cinematic Storyboard</h3>
      <div class="storyboard">${renderStoryboard(plan.storyboard)}</div>
    </section>

    <section class="panel" id="view-prompts">
      <h3>Prompt Studio</h3>
      <div class="prompt-grid">${renderPromptCards(plan.promptPack)}</div>
    </section>

    <section class="panel" id="view-social">
      <h3>Social Media Pack</h3>
      <div class="card-grid">${renderSocialPack(plan.socialPack)}</div>
    </section>

    <section class="panel split" id="view-audio">
      <div>
        <h3>Voiceover + Sound</h3>
        <p><strong>Voice:</strong> ${plan.audioPlan.voiceDirection}</p>
        <p><strong>Music:</strong> ${plan.audioPlan.musicDirection}</p>
        ${renderList(plan.audioPlan.soundDesign)}
      </div>
      <div class="script-box">
        <span class="eyebrow">Narration draft</span>
        <p>${plan.audioPlan.narrationScript}</p>
      </div>
    </section>

    <section class="panel" id="view-pipeline">
      <h3>Autonomous Pipeline</h3>
      <p><strong>Mode:</strong> ${plan.automation.operatingMode}</p>
      <p><strong>Providers:</strong> ${plan.automation.selectedProviders.join(", ")}</p>
      <div class="card-grid">${renderAutonomousPipeline(plan.autonomousPipeline)}</div>
      <h4>Approval gates</h4>
      ${renderList(plan.autonomousPipeline.approvalGates)}
      <p class="muted">${plan.automation.noCostNote}</p>
    </section>

    <section class="panel split" id="view-build">
      <div>
        <h3>Website + Landing Page Build</h3>
        <p>${plan.websiteBuild.inputInstruction}</p>
        ${renderList(plan.websiteBuild.sections)}
      </div>
      <div>
        <h3>Editable Deck</h3>
        ${renderList(plan.deckSpec.slides)}
        <p class="muted">${plan.deckSpec.editableGuidance}</p>
      </div>
    </section>
  `;
}

function fillQuickStart() {
  document.querySelector("#projectName").value = "Goldin Media Luxury Launch";
  document.querySelector("#brandName").value = "Goldin Media";
  document.querySelector("#clientName").value = "A premium service client";
  document.querySelector("#website").value = "https://example.com plus pasted homepage, offer, FAQ, and testimonial notes";
  document.querySelector("#goal").value =
    "Autonomous edit: Opus shorts with captions, Luma b-roll from Flux frames, Runway hero motion, full social pack.";
  document.querySelector("#audience").value =
    "business owners and high-value buyers who want polished marketing that feels trustworthy and cinematic";
  document.querySelector("#offer").value = "a premium done-for-you marketing and production transformation";
  document.querySelector("#assets").value =
    videoSource.uploaded ? `Uploaded: ${videoSource.fileName}` : "founder photos, webinar clip, website copy, logo";
  document.querySelector("#references").value =
    "Luma Labs, Opus Clips, Runway Gen-4, Flux Pro, luxury trailers, prestige documentaries";
  document.querySelector("#duration").value = "60-second hero film with 15-second and 6-second cutdowns";
  document.querySelector("#autoEdit").checked = true;
  toneSelect.value = "luxury";
  commandPrompt.value = SAMPLE_ASK;
  selectedProviderIds = new Set(GoldyEngine.DEFAULT_PROVIDERS);
  selectedSkillIds = new Set([
    "autonomous_video_editing",
    "luma_labs_creative_agent",
    "opus_clips_short_form",
    "flux_image_generation",
    "runway_video_generation"
  ]);
  renderProviderGrid();
  renderSkillGrid();
  interfaceStatus.textContent = "Sample view loaded. Ask Goldie or adjust skills and providers.";
}

function renderSkillGrid() {
  if (!registryData || !skillGrid) return;

  const skills = GoldieSkills.listSkills(registryData, {
    category: activeSkillCategory === "all" ? undefined : activeSkillCategory
  });

  skillGrid.innerHTML = skills
    .map((skill) => {
      const selected = selectedSkillIds.has(skill.id);
      return `
        <button
          type="button"
          class="skill-card ${selected ? "selected" : ""}"
          data-skill-id="${skill.id}"
          aria-pressed="${selected}"
        >
          <span class="eyebrow">${GoldieSkills.CATEGORY_LABELS[skill.category] || skill.category}</span>
          <strong>${skill.name}</strong>
          <p class="muted">${skill.summary}</p>
        </button>
      `;
    })
    .join("");
}

function renderSkillFilters() {
  if (!registryData || !skillCategoryFilters) return;

  const categories = ["all", ...new Set(registryData.skills.map((skill) => skill.category))];
  skillCategoryFilters.innerHTML = categories
    .map((category) => {
      const label = category === "all" ? "All skills" : GoldieSkills.CATEGORY_LABELS[category] || category;
      const active = category === activeSkillCategory ? "active" : "";
      return `<button type="button" class="filter-chip ${active}" data-category="${category}">${label}</button>`;
    })
    .join("");
}

function renderProviderGrid() {
  if (!providersData || !providerGrid) return;

  const providers = GoldieSkills.listProviders(providersData);
  providerGrid.innerHTML = providers
    .map((provider) => {
      const selected = selectedProviderIds.has(provider.id);
      const isPrimary = provider.role === "primary-creative-agent";
      return `
        <button
          type="button"
          class="provider-card ${selected ? "selected" : ""} ${isPrimary ? "primary-agent" : ""}"
          data-provider-id="${provider.id}"
          aria-pressed="${selected}"
        >
          <span class="eyebrow">${provider.category.replace(/-/g, " ")}</span>
          <strong>${provider.name}</strong>
          ${isPrimary ? '<span class="primary-badge">Primary agent</span>' : ""}
          <p class="muted">${provider.tagline}</p>
          <p><small>Best for: ${provider.bestFor.slice(0, 3).join(", ")}</small></p>
        </button>
      `;
    })
    .join("");
}

async function loadGoldieRegistry() {
  try {
    const loaded = await GoldieSkills.loadAll();
    registryData = loaded.registry;
    providersData = loaded.providers;
    renderSkillFilters();
    renderSkillGrid();
    renderProviderGrid();
  } catch (error) {
    if (skillGrid) {
      skillGrid.innerHTML = `<p class="muted">Could not load skills registry. Serve the app over HTTP (not file://). ${escapeHtml(error.message)}</p>`;
    }
    if (providerGrid) {
      providerGrid.innerHTML = `<p class="muted">Provider registry unavailable offline.</p>`;
    }
  }
}

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "unknown duration";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
}

function handleVideoFile(file) {
  if (!file || !file.type.startsWith("video/")) return;

  const objectUrl = URL.createObjectURL(file);
  videoPreview.src = objectUrl;
  videoPreview.classList.remove("hidden");
  videoMeta.classList.remove("hidden");

  videoPreview.onloadedmetadata = () => {
    videoSource = {
      fileName: file.name,
      duration: videoPreview.duration,
      width: videoPreview.videoWidth,
      height: videoPreview.videoHeight,
      hasAudio: true,
      uploaded: true
    };
    videoMeta.innerHTML = `
      <strong>${escapeHtml(file.name)}</strong>
      <p class="muted">${formatDuration(videoPreview.duration)} · ${videoPreview.videoWidth}×${videoPreview.videoHeight}</p>
      <p>Ready for Opus-style clipping, captions, and autonomous b-roll planning.</p>
    `;
    interfaceStatus.textContent = `Video loaded: ${file.name}. Ask Goldie to auto-edit or generate.`;
    document.querySelector("#assets").value = `Uploaded source video: ${file.name}`;
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  interfaceStatus.textContent = "Goldie generated the view from studio controls.";
  generateCurrentPlan();
});

quickStartButton.addEventListener("click", () => {
  fillQuickStart();
  generateCurrentPlan();
});

runCommandButton.addEventListener("click", () => {
  applyCommandToSetup(commandPrompt.value);
  interfaceStatus.textContent = "Goldie built the interface view from your ask.";
  generateCurrentPlan();
});

sampleAskButton.addEventListener("click", () => {
  commandPrompt.value = SAMPLE_ASK;
  applyCommandToSetup(SAMPLE_ASK);
  interfaceStatus.textContent = "Sample ask loaded. Goldie generated the view.";
  generateCurrentPlan();
});

copyButton.addEventListener("click", async () => {
  if (!currentPlan) return;
  await navigator.clipboard.writeText(currentPlan.markdown);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy plan";
  }, 1400);
});

downloadButton.addEventListener("click", () => {
  if (!currentPlan) return;
  const blob = new Blob([currentPlan.markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${currentPlan.project.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
});

newButton.addEventListener("click", () => {
  form.reset();
  toneSelect.value = "luxury";
  document.querySelector("#autoEdit").checked = true;
  currentPlan = null;
  output.innerHTML = `
    <section class="empty-state">
      <p>Ask Goldie or upload a video. Your working production view will appear here.</p>
    </section>
  `;
  commandPrompt.value = "";
  interfaceStatus.textContent =
    "Goldie is standing by. Ask for auto-edits, Opus clips, captions, b-roll, or a full campaign.";
  copyButton.disabled = true;
  downloadButton.disabled = true;
  newButton.disabled = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

skillGrid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-skill-id]");
  if (!card) return;
  const skillId = card.dataset.skillId;
  if (selectedSkillIds.has(skillId)) selectedSkillIds.delete(skillId);
  else selectedSkillIds.add(skillId);
  renderSkillGrid();
});

skillCategoryFilters?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-category]");
  if (!chip) return;
  activeSkillCategory = chip.dataset.category;
  renderSkillFilters();
  renderSkillGrid();
});

providerGrid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-provider-id]");
  if (!card) return;
  const providerId = card.dataset.providerId;
  if (selectedProviderIds.has(providerId)) {
    if (selectedProviderIds.size > 1) selectedProviderIds.delete(providerId);
  } else {
    selectedProviderIds.add(providerId);
  }
  renderProviderGrid();
});

videoBrowse?.addEventListener("click", () => videoUpload.click());

videoUpload?.addEventListener("change", () => {
  const file = videoUpload.files?.[0];
  if (file) handleVideoFile(file);
});

videoDropzone?.addEventListener("dragover", (event) => {
  event.preventDefault();
  videoDropzone.classList.add("dragover");
});

videoDropzone?.addEventListener("dragleave", () => {
  videoDropzone.classList.remove("dragover");
});

videoDropzone?.addEventListener("drop", (event) => {
  event.preventDefault();
  videoDropzone.classList.remove("dragover");
  const file = event.dataTransfer?.files?.[0];
  if (file) handleVideoFile(file);
});

videoDropzone?.addEventListener("click", (event) => {
  if (event.target.closest("#videoBrowse")) return;
  videoUpload.click();
});

hydrateControls();
loadGoldieRegistry();
