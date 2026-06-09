const serviceGrid = document.querySelector("#serviceGrid");
const ratioGrid = document.querySelector("#ratioGrid");
const toneSelect = document.querySelector("#tone");
const form = document.querySelector("#goldyForm");
const output = document.querySelector("#output");
const quickStartButton = document.querySelector("#quickStart");
const copyButton = document.querySelector("#copyPlan");
const downloadButton = document.querySelector("#downloadPlan");
const newButton = document.querySelector("#newPlan");

let currentPlan = null;

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
  output.innerHTML = `
    <section class="result-hero">
      <div>
        <span class="eyebrow">Goldy production package</span>
        <h2>${plan.project.projectName}</h2>
        <p>${plan.creativeBrief.promise}</p>
      </div>
      <div class="badge-stack">
        <span>${plan.project.duration}</span>
        <span>${plan.project.aspectRatios.join(" / ")}</span>
        <span>4K cinematic ready</span>
      </div>
    </section>

    <section class="panel">
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

    <section class="panel">
      <h3>Cinematic Storyboard</h3>
      <div class="storyboard">${renderStoryboard(plan.storyboard)}</div>
    </section>

    <section class="panel">
      <h3>Prompt Studio</h3>
      <div class="prompt-grid">${renderPromptCards(plan.promptPack)}</div>
    </section>

    <section class="panel">
      <h3>Social Media Pack</h3>
      <div class="card-grid">${renderSocialPack(plan.socialPack)}</div>
    </section>

    <section class="panel split">
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

    <section class="panel split">
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

  copyButton.disabled = false;
  downloadButton.disabled = false;
  newButton.disabled = false;
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
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  currentPlan = GoldyEngine.createGoldyPlan(getFormData());
  renderPlan(currentPlan);
  output.scrollIntoView({ behavior: "smooth", block: "start" });
});

quickStartButton.addEventListener("click", fillQuickStart);

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
      <p>Tell Goldy what you want to make. Your production plan will appear here.</p>
    </section>
  `;
  copyButton.disabled = true;
  downloadButton.disabled = true;
  newButton.disabled = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

hydrateControls();
