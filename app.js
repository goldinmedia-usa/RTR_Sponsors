const messagesEl = document.querySelector("#messages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const sendBtn = document.querySelector("#sendBtn");
const attachVideoBtn = document.querySelector("#attachVideo");
const videoUpload = document.querySelector("#videoUpload");
const attachedFileEl = document.querySelector("#attachedFile");
const toolChipsEl = document.querySelector("#toolChips");
const newChatBtn = document.querySelector("#newChat");

let currentPlan = null;
let videoSource = { uploaded: false };
let selectedProviders = new Set();
let isThinking = false;

// Safe init — don't crash if engine script failed to load
if (typeof GoldyEngine !== "undefined" && GoldyEngine.DEFAULT_PROVIDERS) {
  selectedProviders = new Set(GoldyEngine.DEFAULT_PROVIDERS);
} else {
  selectedProviders = new Set(["luma_labs", "flux", "opus_clips"]);
  console.error("Goldie: goldyEngine.js did not load. Open the app via http://localhost:8080");
}

const STARTER_PROMPTS = [
  "What can you do?",
  "Turn my video into TikTok clips with captions",
  "Make a cinematic ad for my business",
  "Plan a luxury social media campaign"
];

const TOOL_OPTIONS = [
  { id: "opus_clips", label: "Opus clips" },
  { id: "luma_labs", label: "Luma" },
  { id: "runway", label: "Runway" },
  { id: "kling", label: "Kling" },
  { id: "flux", label: "Flux" },
  { id: "higgsfield", label: "Higgsfield" }
];

const GENERATION_STEPS = [
  "Reading your message…",
  "Finding the best hooks…",
  "Writing captions…",
  "Planning your clips…",
  "Routing visuals to AI tools…",
  "Packaging your results…"
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function isHelpRequest(text) {
  const t = text.trim().toLowerCase();
  return (
    t === "help" ||
    t === "?" ||
    t === "what can you do?" ||
    t === "what can you do" ||
    /^what can you do\b/.test(t) ||
    /^how does goldie work/.test(t) ||
    /^how does this work/.test(t)
  );
}

function addMessage({ role, html, suggestions = [] }) {
  const wrap = document.createElement("div");
  wrap.className = `msg ${role}`;
  wrap.innerHTML = `
    <div class="msg-avatar" aria-hidden="true">${role === "bot" ? "G" : "You"}</div>
    <div class="msg-bubble">${html}</div>
  `;

  if (suggestions.length && role === "bot") {
    const chips = document.createElement("div");
    chips.className = "suggestions";
    suggestions.forEach((text) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestion";
      btn.textContent = text;
      btn.addEventListener("click", () => sendUserMessage(text));
      chips.appendChild(btn);
    });
    wrap.querySelector(".msg-bubble").appendChild(chips);
  }

  messagesEl.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function addGenerationProgress() {
  const wrap = document.createElement("div");
  wrap.className = "msg bot";
  wrap.id = "gen-progress";
  wrap.innerHTML = `
    <div class="msg-avatar" aria-hidden="true">G</div>
    <div class="msg-bubble">
      <h3>Generating…</h3>
      <div class="gen-progress-bar"><div class="gen-progress-fill" id="genFill"></div></div>
      <ul class="gen-steps" id="genSteps"></ul>
    </div>
  `;
  messagesEl.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

async function runGenerationAnimation() {
  const wrap = addGenerationProgress();
  const stepsEl = wrap.querySelector("#genSteps");
  const fillEl = wrap.querySelector("#genFill");

  for (let i = 0; i < GENERATION_STEPS.length; i++) {
    const li = document.createElement("li");
    li.textContent = GENERATION_STEPS[i];
    li.className = "gen-step active";
    stepsEl.appendChild(li);
    fillEl.style.width = `${((i + 1) / GENERATION_STEPS.length) * 100}%`;
    scrollToBottom();
    await new Promise((r) => setTimeout(r, 450));
    li.classList.remove("active");
    li.classList.add("done");
  }

  wrap.remove();
}

function inferFromMessage(text) {
  const lowered = text.toLowerCase();
  const services = new Set(["social", "cinematic", "storyboard", "audio"]);
  const providers = new Set(selectedProviders);

  if (/tiktok|reel|short|clip|opus|caption|viral/.test(lowered)) {
    services.add("social");
    providers.add("opus_clips");
  }
  if (/luma|b-roll|b roll|cinematic|4k|hero/.test(lowered)) {
    services.add("cinematic");
    providers.add("luma_labs");
  }
  if (/runway/.test(lowered)) providers.add("runway");
  if (/kling/.test(lowered)) providers.add("kling");
  if (/flux|still|frame|image/.test(lowered)) providers.add("flux");
  if (/higgsfield/.test(lowered)) providers.add("higgsfield");
  if (/documentary|interview|podcast|webinar/.test(lowered)) services.add("documentary");
  if (/website|landing/.test(lowered)) services.add("website");
  if (/deck|slide|pitch/.test(lowered)) services.add("decks");

  return { services: Array.from(services), providers: Array.from(providers) };
}

function buildPlanFromMessage(text) {
  if (typeof GoldyEngine === "undefined") {
    throw new Error("Engine not loaded — open http://localhost:8080 (not the HTML file directly)");
  }

  const inferred = inferFromMessage(text);

  return GoldyEngine.createGoldyPlan({
    projectName: text.length > 60 ? "Your creative project" : text,
    brandName: "Goldin Media",
    clientName: "Your brand",
    goal: text,
    audience: "people who should care about your offer",
    offer: "your product or service",
    assets: videoSource.uploaded ? `Uploaded video: ${videoSource.fileName}` : "No video attached yet",
    references: "clean, premium, scroll-stopping content",
    duration: "30–60 second hero with shorter clips",
    tone: /documentary|founder|story/.test(text.toLowerCase()) ? "documentary" : "luxury",
    services: inferred.services,
    providers: inferred.providers,
    aspectRatios: ["9:16", "16:9"],
    autoEdit: true,
    captionStyle: "bold captions, easy to read on phone",
    videoSource
  });
}

function helpMessage() {
  return `
    <h3>Hey — I'm Goldie 👋</h3>
    <p>Think of me like ChatGPT for video and ads. Type what you want. I generate clips, captions, and a plan.</p>
    <p><strong>Try typing:</strong></p>
    <ul>
      <li>"Turn my video into TikTok clips with captions"</li>
      <li>"Make a cinematic ad for my coffee shop"</li>
    </ul>
    <p>Or tap a button below to see me generate something right now.</p>
  `;
}

function renderClipCards(plan) {
  const hooks = plan.captionPlan?.hooks || ["Stop scrolling.", "This changes everything.", "Watch this."];
  const angles = plan.campaignAngles || [];

  return hooks.slice(0, 3).map((hook, i) => {
    const title = angles[i]?.title || `Clip ${i + 1}`;
    const duration = i === 0 ? "0:15" : i === 1 ? "0:30" : "0:45";
    const caption = plan.captionPlan?.fullScript?.split(".")[i]?.trim() || hook;
    return `
      <article class="clip-card">
        <div class="clip-thumb" aria-hidden="true">
          <span class="clip-ratio">9:16</span>
          <span class="clip-duration">${duration}</span>
        </div>
        <div class="clip-info">
          <strong>${escapeHtml(title)}</strong>
          <p class="clip-hook">${escapeHtml(hook)}</p>
          <p class="clip-caption"><em>Caption:</em> ${escapeHtml(caption)}</p>
        </div>
      </article>
    `;
  }).join("");
}

function renderScenePreviews(plan) {
  return (plan.storyboard || []).slice(0, 3).map((scene, i) => `
    <article class="scene-preview">
      <div class="scene-thumb">Scene ${i + 1}</div>
      <p><strong>${escapeHtml(scene.beat)}</strong></p>
      <p class="muted">${escapeHtml(scene.frame)}</p>
    </article>
  `).join("");
}

function formatPlanReply(plan, userText) {
  const tools = (plan.project.providers || [])
    .map((id) => GoldyEngine.PROVIDER_LIBRARY[id]?.name || id)
    .join(", ");

  const mainHook = plan.campaignAngles[0]?.hook || plan.captionPlan.hooks[0];
  const detailsId = `details-${Date.now()}`;
  const markdown = escapeHtml(plan.markdown.slice(0, 2500) + (plan.markdown.length > 2500 ? "\n…" : ""));

  return `
    <h3>✅ Done — here's what I made</h3>
    <p>You asked: <em>"${escapeHtml(userText)}"</em></p>

    <p class="gen-label">Your short clips (preview)</p>
    <div class="clip-grid">${renderClipCards(plan)}</div>

    <p class="gen-label">Storyboard frames (preview)</p>
    <div class="scene-grid">${renderScenePreviews(plan)}</div>

    <p><strong>Main hook:</strong> ${escapeHtml(mainHook)}</p>
    <p><strong>Tools I'd use:</strong> ${escapeHtml(tools || "Luma Labs, Opus Clips")}</p>

    <div class="msg-actions">
      <button type="button" class="msg-action" data-action="download">⬇ Download plan</button>
      <button type="button" class="msg-action" data-action="copy">📋 Copy plan</button>
    </div>
    <button type="button" class="details-toggle" data-target="${detailsId}">Show full technical plan</button>
    <div class="details-panel hidden" id="${detailsId}">${markdown}</div>
  `;
}

function wireMessageActions(wrap, plan) {
  wrap.querySelectorAll(".msg-action").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        if (btn.dataset.action === "download") {
          const blob = new Blob([plan.markdown], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "goldie-plan.md";
          a.click();
          URL.revokeObjectURL(url);
          btn.textContent = "Downloaded ✓";
        }
        if (btn.dataset.action === "copy") {
          await navigator.clipboard.writeText(plan.markdown);
          btn.textContent = "Copied ✓";
        }
      } catch (err) {
        btn.textContent = "Try Download instead";
      }
    });
  });

  wrap.querySelectorAll(".details-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.target);
      const hidden = panel.classList.toggle("hidden");
      btn.textContent = hidden ? "Show full technical plan" : "Hide full technical plan";
    });
  });
}

async function respondToUser(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (isHelpRequest(trimmed)) {
    addMessage({
      role: "bot",
      html: helpMessage(),
      suggestions: STARTER_PROMPTS.filter((p) => p.toLowerCase() !== trimmed.toLowerCase())
    });
    return;
  }

  try {
    await runGenerationAnimation();
    currentPlan = buildPlanFromMessage(trimmed);
    const wrap = addMessage({ role: "bot", html: formatPlanReply(currentPlan, trimmed) });
    wireMessageActions(wrap, currentPlan);
  } catch (err) {
    console.error(err);
    addMessage({
      role: "bot",
      html: `
        <h3>Something went wrong</h3>
        <p>${escapeHtml(err.message || "Could not generate.")}</p>
        <p><strong>Fix:</strong> Open a Terminal in this folder and run:</p>
        <pre class="code-block">python3 -m http.server 8080</pre>
        <p>Then go to <strong>http://localhost:8080</strong> in Chrome (don't double-click the HTML file).</p>
      `,
      suggestions: STARTER_PROMPTS
    });
  }
}

function sendUserMessage(text) {
  if (isThinking) return;
  const trimmed = text.trim();
  if (!trimmed) return;

  isThinking = true;
  sendBtn.disabled = true;
  addMessage({ role: "user", html: `<p>${escapeHtml(trimmed)}</p>` });
  chatInput.value = "";
  chatInput.style.height = "auto";

  respondToUser(trimmed).finally(() => {
    isThinking = false;
    sendBtn.disabled = false;
    chatInput.focus();
  });
}

function showWelcome() {
  if (typeof GoldyEngine === "undefined") {
    addMessage({
      role: "bot",
      html: `
        <h3>⚠️ Goldie needs to be started first</h3>
        <p>You're probably opening the file directly. That won't work.</p>
        <p><strong>Do this once:</strong></p>
        <ol>
          <li>Open Terminal in this folder</li>
          <li>Run: <code>python3 -m http.server 8080</code></li>
          <li>Open <strong>http://localhost:8080</strong> in Chrome</li>
        </ol>
        <p>Or double-click <strong>START-GOLDIE.command</strong> (Mac) or <strong>START-GOLDIE.bat</strong> (Windows).</p>
      `
    });
    return;
  }

  addMessage({
    role: "bot",
    html: `
      <h3>Hey — I'm Goldie 👋</h3>
      <p>Type what you want. I'll <strong>generate</strong> clip ideas, captions, and storyboards — you'll see them appear here.</p>
      <p>Try tapping a button below 👇</p>
    `,
    suggestions: STARTER_PROMPTS
  });
}

function renderToolChips() {
  if (!toolChipsEl) return;
  toolChipsEl.innerHTML = TOOL_OPTIONS.map(
    (tool) =>
      `<button type="button" class="tool-chip ${selectedProviders.has(tool.id) ? "active" : ""}" data-tool="${tool.id}">${tool.label}</button>`
  ).join("");

  toolChipsEl.querySelectorAll(".tool-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const id = chip.dataset.tool;
      if (selectedProviders.has(id)) {
        if (selectedProviders.size > 1) selectedProviders.delete(id);
      } else {
        selectedProviders.add(id);
      }
      renderToolChips();
    });
  });
}

function setAttachedVideo(file) {
  if (!file?.type?.startsWith("video/")) return;

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = url;
  video.onloadedmetadata = () => {
    videoSource = {
      fileName: file.name,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      hasAudio: true,
      uploaded: true
    };
    attachedFileEl.classList.remove("hidden");
    attachedFileEl.innerHTML = `
      <span>📹 ${escapeHtml(file.name)}</span>
      <button type="button" id="removeVideo" aria-label="Remove video">✕</button>
    `;
    document.querySelector("#removeVideo").addEventListener("click", clearAttachedVideo);
    addMessage({
      role: "bot",
      html: `<p>Got your video <strong>${escapeHtml(file.name)}</strong>. Now tell me what to do — e.g. "make TikTok clips with captions".</p>`,
      suggestions: ["Turn this into TikTok clips with captions", "Make a 60s cinematic ad from this"]
    });
    URL.revokeObjectURL(url);
  };
}

function clearAttachedVideo() {
  videoSource = { uploaded: false };
  attachedFileEl.classList.add("hidden");
  attachedFileEl.innerHTML = "";
  videoUpload.value = "";
}

function resetChat() {
  messagesEl.innerHTML = "";
  currentPlan = null;
  clearAttachedVideo();
  showWelcome();
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendUserMessage(chatInput.value);
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 140)}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendUserMessage(chatInput.value);
  }
});

attachVideoBtn.addEventListener("click", () => videoUpload.click());
videoUpload.addEventListener("change", () => {
  const file = videoUpload.files?.[0];
  if (file) setAttachedVideo(file);
});

newChatBtn.addEventListener("click", resetChat);

renderToolChips();
showWelcome();
chatInput.focus();
