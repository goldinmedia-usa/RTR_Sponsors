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
let selectedProviders = new Set(GoldyEngine.DEFAULT_PROVIDERS);
let isThinking = false;

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

function showTyping() {
  const el = document.createElement("div");
  el.className = "msg bot";
  el.id = "typing";
  el.innerHTML = `
    <div class="msg-avatar" aria-hidden="true">G</div>
    <div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>
  `;
  messagesEl.appendChild(el);
  scrollToBottom();
}

function hideTyping() {
  document.querySelector("#typing")?.remove();
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
  if (/what can you|help|how do/.test(lowered)) {
    return { isHelp: true, services: Array.from(services), providers: Array.from(providers) };
  }

  return { isHelp: false, services: Array.from(services), providers: Array.from(providers) };
}

function buildPlanFromMessage(text) {
  const inferred = inferFromMessage(text);
  if (inferred.isHelp) return null;

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
    <p>Think of me like ChatGPT for video and ads. You tell me what you want in plain English. I figure out the rest.</p>
    <p><strong>I can help you:</strong></p>
    <ul>
      <li>Turn a long video into short TikTok / Reels clips <em>with captions</em></li>
      <li>Plan a cinematic ad or social campaign</li>
      <li>Pick the right AI tools (Luma, Runway, Opus Clips, etc.)</li>
      <li>Write hooks, captions, and a step-by-step edit plan</li>
    </ul>
    <p>Attach a video with 📎 or just type what you need. Tap a suggestion below to start.</p>
  `;
}

function formatPlanReply(plan, userText) {
  const tools = plan.project.providers
    .map((id) => GoldyEngine.PROVIDER_LIBRARY[id]?.name || id)
    .join(", ");

  const steps = [
    videoSource.uploaded
      ? `I'll use your video <strong>${escapeHtml(videoSource.fileName)}</strong> as the starting point.`
      : "Tip: attach a video with 📎 if you want clip + caption suggestions for real footage.",
    `I'll make short clips for TikTok/Reels${plan.captionPlan ? " with captions like: \"" + escapeHtml(plan.captionPlan.hooks[0]) + "\"" : ""}.`,
    `For extra visuals (b-roll), I'll route to: <strong>${escapeHtml(tools)}</strong>.`,
    `You'll get a hero video plan (~${escapeHtml(plan.project.duration)}) plus a simple checklist to finish in Opus, Luma, or your editor.`
  ];

  const detailsId = `details-${Date.now()}`;
  const markdown = escapeHtml(plan.markdown.slice(0, 2500) + (plan.markdown.length > 2500 ? "\n…" : ""));

  return `
    <h3>Got it — here's your plan</h3>
    <p>You asked: <em>"${escapeHtml(userText)}"</em></p>
    <p><strong>Here's what I'll do:</strong></p>
    <ul>
      ${steps.map((s) => `<li>${s}</li>`).join("")}
    </ul>
    <p><strong>Your hook line:</strong> ${escapeHtml(plan.campaignAngles[0]?.hook || plan.captionPlan.hooks[0])}</p>
    <div class="msg-actions">
      <button type="button" class="msg-action" data-action="download">Download full plan</button>
      <button type="button" class="msg-action" data-action="copy">Copy plan</button>
    </div>
    <button type="button" class="details-toggle" data-target="${detailsId}">Show technical details</button>
    <div class="details-panel hidden" id="${detailsId}">${markdown}</div>
  `;
}

function wireMessageActions(wrap, plan) {
  wrap.querySelectorAll(".msg-action").forEach((btn) => {
    btn.addEventListener("click", async () => {
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
    });
  });

  wrap.querySelectorAll(".details-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.target);
      const open = panel.classList.toggle("hidden");
      btn.textContent = open ? "Show technical details" : "Hide technical details";
    });
  });
}

async function respondToUser(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  showTyping();
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
  hideTyping();

  const inferred = inferFromMessage(trimmed);

  if (inferred.isHelp) {
    addMessage({
      role: "bot",
      html: helpMessage(),
      suggestions: STARTER_PROMPTS.filter((p) => p !== trimmed)
    });
    return;
  }

  currentPlan = buildPlanFromMessage(trimmed);
  const wrap = addMessage({ role: "bot", html: formatPlanReply(currentPlan, trimmed) });
  wireMessageActions(wrap, currentPlan);
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
  addMessage({
    role: "bot",
    html: `
      <h3>Hey — I'm Goldie 👋</h3>
      <p>Your AI creative assistant. Tell me what you want — like you're texting an editor.</p>
      <p>Try: <em>"Cut my video into TikTok clips with captions"</em> or attach a video with 📎</p>
    `,
    suggestions: STARTER_PROMPTS
  });
}

function renderToolChips() {
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
      html: `<p>Nice — I see your video <strong>${escapeHtml(file.name)}</strong>. Tell me what you want done with it (clips, captions, b-roll, full ad, etc.).</p>`,
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

// Load skills in background (optional, for future)
if (typeof GoldieSkills !== "undefined") {
  GoldieSkills.loadAll().catch(() => {});
}
