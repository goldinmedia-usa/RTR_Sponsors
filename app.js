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

let currentPlan = null;

const SAMPLE_ASK =
  "Goldy, build a luxury black-and-gold social media pack and cinematic 4K launch video for a premium client from their website. Include close-ups, storyboards, voiceover, sound design, deck slides, website hero, editable prompts, dramatic lighting, and marketing CTAs.";

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
    mustIncludeCloseups: document.querySelector("#mustIncludeCloseups").checked
  };
}

function setFieldValue(selector, value) {
  document.querySelector(selector).value = value;
}

function inferServicesFromCommand(command) {
  const lowered = command.toLowerCase();
  const services = new Set(["social", "cinematic", "storyboard", "audio"]);
  const keywordMap = {
    documentary: ["documentary", "interview", "docu", "founder story"],
    website: ["website", "landing page", "web page", "homepage", "site"],
    decks: ["deck", "slide", "presentation", "pitch"],
    replacement: ["replace", "replacement", "remix", "retouch", "drop in", "photo", "video asset"]
  };

  Object.entries(keywordMap).forEach(([service, keywords]) => {
    if (keywords.some((keyword) => lowered.includes(keyword))) services.add(service);
  });

  return Array.from(services);
}

function applyCommandToSetup(command) {
  const cleanedCommand = command.replace(/\s+/g, " ").trim() || SAMPLE_ASK;
  const services = inferServicesFromCommand(cleanedCommand);
  const projectName = cleanedCommand.length > 80 ? "Goldy Command Production View" : cleanedCommand;

  setFieldValue("#projectName", projectName);
  setFieldValue("#brandName", "Goldin Media");
  setFieldValue("#clientName", "Client from Goldy ask");
  setFieldValue(
    "#website",
    "Use the supplied website URL, pasted website copy, discovery notes, or client source assets."
  );
  setFieldValue("#goal", cleanedCommand);
  setFieldValue(
    "#audience",
    "clients and buyers who need premium marketing that feels cinematic, trustworthy, and conversion-ready"
  );
  setFieldValue(
    "#offer",
    "a full-service Goldin Media creative production package"
  );
  setFieldValue(
    "#assets",
    "Use uploaded or described photos, videos, logos, website copy, testimonials, and brand references."
  );
  setFieldValue(
    "#references",
    "luxury black-and-gold campaigns, cinematic AI video studios, prestige documentaries, premium social ads"
  );
  setFieldValue("#duration", "60-second hero film with 15-second and 6-second cutdowns");

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

function renderPlan(plan) {
  plan = escapeDeep(plan);

  output.innerHTML = `
    <section class="result-hero">
      <div>
        <span class="eyebrow">Goldy production package</span>
        <h2>${plan.project.projectName}</h2>
        <p>${plan.creativeBrief.promise}</p>
        <div class="view-tabs" aria-label="Production view shortcuts">
          <a href="#view-brief">Brief</a>
          <a href="#view-storyboard">Storyboard</a>
          <a href="#view-prompts">Prompts</a>
          <a href="#view-social">Social</a>
          <a href="#view-audio">Audio</a>
          <a href="#view-build">Build</a>
        </div>
      </div>
      <div class="badge-stack">
        <span>${plan.project.duration}</span>
        <span>${plan.project.aspectRatios.join(" / ")}</span>
        <span>4K cinematic ready</span>
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

    <section class="panel split">
      <div>
        <h3>Asset Replacement / Remix</h3>
        <p><strong>Source assets:</strong> ${plan.assetReplacement.sourceAssets}</p>
        ${renderList(plan.assetReplacement.auditChecklist)}
        <p class="muted">${plan.assetReplacement.replacementPrompt}</p>
      </div>
      <div>
        <h3>Autonomous Pipeline</h3>
        ${renderList(plan.automation.pipeline)}
        <p class="muted">${plan.automation.noCostNote}</p>
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
    "Create a full-service campaign package: hero film, social cutdowns, website hero, pitch deck, and cinematic story prompts.";
  document.querySelector("#audience").value =
    "business owners and high-value buyers who want polished marketing that feels trustworthy and cinematic";
  document.querySelector("#offer").value = "a premium done-for-you marketing and production transformation";
  document.querySelector("#assets").value =
    "founder photos, client testimonial clips, website copy, service screenshots, logo, brand colors";
  document.querySelector("#references").value =
    "luxury trailers, prestige documentaries, modern AI video studio workflows, premium agency decks";
  document.querySelector("#duration").value = "60-second hero film with 15-second and 6-second cutdowns";
  toneSelect.value = "luxury";
  commandPrompt.value = SAMPLE_ASK;
  interfaceStatus.textContent = "Sample view loaded. Ask Goldy or adjust setup controls.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  interfaceStatus.textContent = "Goldy generated the view from setup controls.";
  generateCurrentPlan();
});

quickStartButton.addEventListener("click", () => {
  fillQuickStart();
  generateCurrentPlan();
});

runCommandButton.addEventListener("click", () => {
  applyCommandToSetup(commandPrompt.value);
  interfaceStatus.textContent = "Goldy built the interface view from your ask.";
  generateCurrentPlan();
});

sampleAskButton.addEventListener("click", () => {
  commandPrompt.value = SAMPLE_ASK;
  applyCommandToSetup(SAMPLE_ASK);
  interfaceStatus.textContent = "Sample ask loaded. Goldy generated the view.";
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
  currentPlan = null;
  output.innerHTML = `
    <section class="empty-state">
      <p>Ask Goldy in the interface above. Your working production view will appear here.</p>
    </section>
  `;
  commandPrompt.value = "";
  interfaceStatus.textContent =
    "Goldy is standing by. Ask for a campaign, trailer, storyboard, website, documentary, deck, or social pack.";
  copyButton.disabled = true;
  downloadButton.disabled = true;
  newButton.disabled = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

hydrateControls();
