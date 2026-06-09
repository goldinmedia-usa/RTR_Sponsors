(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.GoldyEngine = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const SERVICE_LIBRARY = {
    social: {
      label: "Social media client pack",
      outputs: [
        "Short-form hero ad",
        "Platform cutdowns",
        "Carousel copy",
        "Caption bank",
        "Thumbnail concepts"
      ]
    },
    cinematic: {
      label: "4K cinematic video",
      outputs: [
        "Director's treatment",
        "Shot list",
        "Lighting plan",
        "Motion prompts",
        "Edit rhythm"
      ]
    },
    documentary: {
      label: "Documentary package",
      outputs: [
        "Narrative arc",
        "Interview questions",
        "B-roll map",
        "Voiceover script",
        "Sound design notes"
      ]
    },
    storyboard: {
      label: "Storyboard and scene design",
      outputs: [
        "Scene cards",
        "Camera language",
        "Close-up moments",
        "Transition ideas",
        "Continuity notes"
      ]
    },
    website: {
      label: "Website-to-campaign builder",
      outputs: [
        "Landing page map",
        "Offer hierarchy",
        "Conversion copy",
        "Animation cues",
        "Ad-to-page continuity"
      ]
    },
    audio: {
      label: "Voiceover, narration, and audio",
      outputs: [
        "Narration script",
        "Voice direction",
        "Music brief",
        "SFX accents",
        "Mix notes"
      ]
    },
    decks: {
      label: "Editable decks and pitch visuals",
      outputs: [
        "Slide outline",
        "Key art prompts",
        "Typography system",
        "Client-ready talking points",
        "Motion slide notes"
      ]
    },
    replacement: {
      label: "Photo/video replacement and remix",
      outputs: [
        "Asset audit",
        "Replacement prompts",
        "Continuity matching",
        "Retouch notes",
        "Before/after edit plan"
      ]
    }
  };

  const PLATFORM_MATRIX = [
    {
      name: "Instagram Reels / TikTok / Shorts",
      ratio: "9:16",
      length: "15-45 seconds",
      angle: "Immediate hook, visual proof, fast CTA"
    },
    {
      name: "Instagram carousel",
      ratio: "4:5",
      length: "7-10 slides",
      angle: "Problem, transformation, proof, offer"
    },
    {
      name: "YouTube trailer",
      ratio: "16:9",
      length: "60-120 seconds",
      angle: "Cinematic opener, story spine, brand promise"
    },
    {
      name: "LinkedIn / presentation cut",
      ratio: "1:1 or 16:9",
      length: "30-90 seconds",
      angle: "Credibility, results, leadership, CTA"
    },
    {
      name: "Website hero loop",
      ratio: "16:9",
      length: "6-12 seconds",
      angle: "Silent premium motion with clear offer context"
    }
  ];

  const TONE_PRESETS = {
    luxury: {
      label: "Luxury black-and-gold",
      palette: "deep black, polished gold, champagne highlights, warm skin tones",
      lighting: "low-key dramatic lighting, hard rim lights, soft gold practicals, glossy reflections",
      typography: "high-contrast editorial serif paired with a clean geometric sans"
    },
    documentary: {
      label: "Prestige documentary",
      palette: "natural blacks, warm neutrals, archival paper, restrained gold accents",
      lighting: "motivated practical light, soft window wraps, handheld realism, textured shadows",
      typography: "quiet editorial serif, humanist sans, lower-third system"
    },
    hype: {
      label: "High-energy launch",
      palette: "black, electric gold, white flash frames, saturated brand accents",
      lighting: "rapid strobes, kinetic reflections, clean product glints, volumetric beams",
      typography: "bold condensed sans, oversized kinetic type, punchy captions"
    },
    minimal: {
      label: "Clean premium minimal",
      palette: "charcoal, matte black, muted gold, off-white, subtle gradients",
      lighting: "large softboxes, clean negative fill, calm controlled shadows",
      typography: "spacious sans, refined hierarchy, wide tracking"
    }
  };

  const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:5"];

  const PROVIDER_LIBRARY = {
    luma_labs: {
      name: "Luma Labs",
      role: "primary-creative-agent",
      tagline: "Dream Machine — cinematic image-to-video",
      bestFor: ["hero b-roll", "start frames", "end frames", "cinematic motion"]
    },
    runway: {
      name: "Runway",
      role: "motion-finishing",
      tagline: "Gen-3/Gen-4 — motion brush and extend",
      bestFor: ["hero shots", "product motion", "inpaint extensions"]
    },
    kling: {
      name: "Kling",
      role: "long-form-motion",
      tagline: "Long clips and human motion",
      bestFor: ["documentary b-roll", "human performance", "montage plates"]
    },
    seedance: {
      name: "SeaDance",
      role: "dance-and-rhythm",
      tagline: "Rhythmic performance motion",
      bestFor: ["music-driven social", "performance hooks"]
    },
    cling: {
      name: "Cling",
      role: "character-motion",
      tagline: "Animate stills with identity lock",
      bestFor: ["loops", "website hero", "avatar motion"]
    },
    flux: {
      name: "Flux",
      role: "key-art-and-frames",
      tagline: "Photoreal stills and start/end frames",
      bestFor: ["storyboard frames", "4K key art", "start/end plates"]
    },
    nano_banana_pro: {
      name: "Nano Banana Pro",
      role: "4k-frame-lab",
      tagline: "4K macro and product detail frames",
      bestFor: ["macro hooks", "product texture", "thumbnail masters"]
    },
    higgsfield: {
      name: "Higgsfield",
      role: "plugin-scenes",
      tagline: "Themed scene and campaign plug-ins",
      bestFor: ["rapid concepts", "social theme packs"]
    },
    opus_clips: {
      name: "Opus Clips",
      role: "short-form-autocut",
      tagline: "Long-to-short with AI captions",
      bestFor: ["viral shorts", "auto captions", "hook detection"]
    }
  };

  const DEFAULT_PROVIDERS = ["luma_labs", "flux", "nano_banana_pro", "opus_clips"];

  function cleanText(value, fallback) {
    if (typeof value !== "string") return fallback;
    const cleaned = value.replace(/\s+/g, " ").trim();
    return cleaned || fallback;
  }

  function toArray(value) {
    if (Array.isArray(value)) {
      return value.map((item) => cleanText(String(item), "")).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => cleanText(item, ""))
        .filter(Boolean);
    }
    return [];
  }

  function normalizeServices(services) {
    const requested = toArray(services);
    const valid = requested.filter((service) => SERVICE_LIBRARY[service]);
    return valid.length ? valid : ["social", "cinematic", "storyboard", "audio"];
  }

  function normalizeProviders(providers) {
    const requested = toArray(providers);
    const valid = requested.filter((id) => PROVIDER_LIBRARY[id]);
    return valid.length ? valid : DEFAULT_PROVIDERS.slice();
  }

  function normalizeVideoSource(videoSource) {
    if (!videoSource || typeof videoSource !== "object") {
      return {
        fileName: "",
        duration: 0,
        width: 0,
        height: 0,
        hasAudio: false,
        uploaded: false
      };
    }
    return {
      fileName: cleanText(videoSource.fileName, ""),
      duration: Number(videoSource.duration) || 0,
      width: Number(videoSource.width) || 0,
      height: Number(videoSource.height) || 0,
      hasAudio: Boolean(videoSource.hasAudio),
      uploaded: Boolean(videoSource.uploaded)
    };
  }

  function normalizeProject(input) {
    const project = input || {};
    const toneKey = TONE_PRESETS[project.tone] ? project.tone : "luxury";
    const requestedRatios = toArray(project.aspectRatios).filter((ratio) =>
      ASPECT_RATIOS.includes(ratio)
    );

    return {
      brandName: cleanText(project.brandName, "Goldin Media"),
      projectName: cleanText(project.projectName, "Goldy Production Build"),
      clientName: cleanText(project.clientName, "Client"),
      website: cleanText(project.website, "Use pasted website copy or discovery notes"),
      goal: cleanText(
        project.goal,
        "Create a premium marketing campaign that feels cinematic, trustworthy, and impossible to ignore."
      ),
      audience: cleanText(project.audience, "high-intent buyers who value quality, trust, and story"),
      offer: cleanText(project.offer, "a premium transformation, service, or launch"),
      assets: cleanText(project.assets, "No source assets listed yet"),
      references: cleanText(project.references, "cinematic brand films, luxury product ads, prestige documentaries"),
      duration: cleanText(project.duration, "60 seconds with shorter cutdowns"),
      services: normalizeServices(project.services),
      tone: toneKey,
      aspectRatios: requestedRatios.length ? requestedRatios : ["16:9", "9:16", "4:5"],
      mustIncludeCloseups: project.mustIncludeCloseups !== false,
      includeWebsiteBuild: Boolean(project.includeWebsiteBuild) || normalizeServices(project.services).includes("website"),
      providers: normalizeProviders(project.providers),
      selectedSkills: toArray(project.selectedSkills),
      captionStyle: cleanText(project.captionStyle, "bold gold kinetic captions on black bar"),
      autoEdit: project.autoEdit !== false,
      videoSource: normalizeVideoSource(project.videoSource)
    };
  }

  function makeCreativeBrief(project) {
    const tone = TONE_PRESETS[project.tone];
    return {
      positioning: `${project.brandName} presents ${project.clientName} as the premium answer for ${project.audience}.`,
      promise: `Turn ${project.offer} into a story-led campaign that sells through emotion, clarity, and proof.`,
      audienceTension: `${project.audience} need to feel the cost of staying the same before they see the offer as the obvious move.`,
      visualWorld: `${tone.label}: ${tone.palette}.`,
      lighting: tone.lighting,
      typography: tone.typography,
      successCriteria: [
        "Viewer understands the offer in the first three beats.",
        "Every scene contains either proof, emotion, or a clear next step.",
        "The hero video can be cut into platform-native social assets without losing the story.",
        "Prompts preserve realism: believable faces, grounded camera movement, coherent brand details."
      ]
    };
  }

  function makeCampaignAngles(project) {
    return [
      {
        title: "The cinematic transformation",
        hook: `What changes when ${project.audience} finally choose ${project.offer}?`,
        payoff: "Before/after emotional contrast with a premium reveal."
      },
      {
        title: "The founder-grade proof story",
        hook: "Start with the human reason this work matters, then show the evidence.",
        payoff: "Trust-building documentary energy with polished marketing structure."
      },
      {
        title: "The irresistible offer trailer",
        hook: `A fast, dramatic trailer that makes ${project.clientName} feel like the category leader.`,
        payoff: "High-retention cuts, bold titles, clear CTA."
      },
      {
        title: "The social proof spotlight",
        hook: "Let one concrete result, quote, or client moment carry the campaign.",
        payoff: "Authority without sounding generic."
      }
    ];
  }

  function makeStoryboard(project) {
    const closeup = project.mustIncludeCloseups
      ? "macro close-up of hands, eyes, product texture, or decisive human expression"
      : "medium detail shot with strong foreground depth";

    return [
      {
        beat: "1. Pattern-break hook",
        frame: closeup,
        camera: "slow push-in, shallow depth of field, premium lens compression",
        lighting: "gold rim light against deep black negative fill",
        voiceover: `Most ${project.audience} do not need more noise. They need the right story.`,
        prompt: `4K cinematic ${closeup}, ${project.clientName} brand atmosphere, dramatic black and gold lighting, realistic skin texture, shallow depth of field, high-end commercial film still`,
        edit: "Open on silence, then a low impact hit as typography lands."
      },
      {
        beat: "2. Problem pressure",
        frame: "wide environmental shot showing friction, hesitation, or an unfinished moment",
        camera: "locked-off frame with subtle parallax or slow lateral slider",
        lighting: "cool shadows with a warm practical in the background",
        voiceover: `The market is crowded, and attention only rewards the brands that feel instantly clear.`,
        prompt: `cinematic wide shot, premium business or lifestyle environment, subject paused before action, dramatic contrast, realistic documentary texture, 4K`,
        edit: "Use a brief sound drop to make the tension feel expensive."
      },
      {
        beat: "3. The insight",
        frame: "over-the-shoulder planning, storyboard wall, website or product details in focus",
        camera: "controlled handheld, small human imperfections, believable motion",
        lighting: "soft gold key light, clean shadow separation",
        voiceover: `Goldie turns the offer into scenes, scenes into assets, and assets into a campaign system.`,
        prompt: `film production planning scene, storyboard cards, laptop with elegant website layout, black and gold art direction, cinematic commercial realism`,
        edit: "Cut on a pen mark, cursor click, or light sweep."
      },
      {
        beat: "4. Transformation montage",
        frame: "hero service/product moments, satisfied client expressions, tactile brand details",
        camera: "mix of close-ups, overheads, and symmetrical hero frames",
        lighting: "glossy highlights, controlled reflections, warm practical depth",
        voiceover: `Every shot has a job: stop the scroll, build desire, prove the promise.`,
        prompt: `luxury marketing montage, premium service transformation, human close-ups, product texture, cinematic lighting, realistic high dynamic range, 4K`,
        edit: "Rhythmic montage with 3-frame flash titles."
      },
      {
        beat: "5. Proof and authority",
        frame: "testimonial-style portrait, result graphic, or brand credibility moment",
        camera: "interview angle slightly off lens, gentle dolly, stable composition",
        lighting: "documentary key light, elegant gold accent, clean background",
        voiceover: `The message becomes measurable: who it helps, why it works, and what happens next.`,
        prompt: `prestige documentary interview portrait, confident subject, gold accent light, premium brand backdrop, realistic lensing, crisp 4K`,
        edit: "Add lower-third, subtle data overlays, and quiet room tone."
      },
      {
        beat: "6. CTA hero finish",
        frame: "final brand mark, website, offer, or founder looking toward camera",
        camera: "slow cinematic pull-back or lift into final composition",
        lighting: "black-and-gold glow, clean practical highlights, strong silhouette",
        voiceover: `Build the campaign. Own the moment. Make it Golden.`,
        prompt: `premium black and gold brand finale, cinematic hero frame, elegant typography space, dramatic glow, realistic commercial finish, 4K`,
        edit: "End with logo resolve, sub-bass lift, and one clear CTA."
      }
    ];
  }

  function makePromptPack(project, storyboard) {
    const tone = TONE_PRESETS[project.tone];
    const negativePrompt =
      "avoid plastic skin, warped hands, unreadable text, random logos, flickering faces, extra fingers, muddy shadows, low-resolution artifacts, surreal anatomy";

    return {
      masterImagePrompt: `Create a ${tone.label.toLowerCase()} campaign key visual for ${project.clientName}. Goal: ${project.goal}. Audience: ${project.audience}. Use ${tone.palette}; ${tone.lighting}; ${tone.typography}. Must feel premium, believable, editorial, cinematic, and marketing-ready.`,
      masterVideoPrompt: `Generate a ${project.duration} 4K cinematic brand film for ${project.clientName}. Build a dramatic story arc: pattern-break hook, problem pressure, insight, transformation montage, proof, and CTA. Use realistic camera movement, close-ups, high dynamic range, black-and-gold lighting, premium typography moments, and platform-safe framing for ${project.aspectRatios.join(", ")}.`,
      negativePrompt,
      scenePrompts: storyboard.map((scene) => ({
        beat: scene.beat,
        imagePrompt: `${scene.prompt}. ${negativePrompt}.`,
        motionPrompt: `${scene.camera}; ${scene.edit}; maintain character and brand continuity; cinematic realism; no jitter; no morphing faces.`
      })),
      voicePrompt: `Narrate with a confident premium production-agency voice: warm, precise, cinematic, not salesy. Pace with dramatic pauses. Script should sell ${project.offer} to ${project.audience}.`,
      typographyPrompt: `Design kinetic typography in ${tone.typography}; use gold emphasis words over black negative space; keep copy short, legible, and editable.`
    };
  }

  function makeAudioPlan(project) {
    return {
      voiceDirection: "Warm authority, confident pauses, cinematic restraint, no hype-read unless the asset is a launch teaser.",
      musicDirection:
        project.tone === "hype"
          ? "Hybrid trailer pulse, polished risers, sharp gold-sting accents, clean drop for CTA."
          : "Prestige documentary bed, low piano or strings, subtle sub pulse, elegant gold shimmer accents.",
      soundDesign: [
        "Start with a room-tone breath before the first impact.",
        "Use soft whooshes for title transitions, not generic swooshes.",
        "Layer tactile sounds from the client's world: fabric, camera shutter, keyboard, door, product touch.",
        "Leave negative space around the main proof line."
      ],
      narrationScript: [
        `Most ${project.audience} do not stop for another ad.`,
        "They stop for a moment that feels like it was made for them.",
        `${project.clientName} has the story, the proof, and the offer.`,
        "Goldie turns that into a cinematic campaign system.",
        `One hero film. Platform cutdowns. Social assets. Website-ready visuals. A message built to move.`
      ].join(" ")
    };
  }

  function makeSocialPack(project) {
    return PLATFORM_MATRIX.filter((item) => project.aspectRatios.includes(item.ratio) || item.name.includes("LinkedIn")).map(
      (item) => ({
        platform: item.name,
        format: `${item.ratio}, ${item.length}`,
        creativeAngle: item.angle,
        hookOptions: [
          `Your ${project.offer} should not look like everyone else's content.`,
          `The difference between content and a campaign is story.`,
          `If ${project.audience} only remember one thing, make it this.`
        ],
        caption: `${project.clientName} deserves a campaign that looks premium, feels human, and sells with story. Built by Goldin Media.`
      })
    );
  }

  function makeWebsiteBuildSpec(project) {
    return {
      inputInstruction:
        "Paste the website URL plus any homepage, offer, testimonial, and FAQ copy. If direct scraping is unavailable, use manual copy as the source of truth.",
      sections: [
        "Hero: one-line promise, cinematic loop, CTA",
        "Problem: what the audience is tired of",
        "Offer: what is included and why it matters",
        "Proof: testimonials, metrics, logos, before/after moments",
        "Process: three to five steps with motion icons",
        "Story: founder or mission documentary block",
        "CTA: booking, purchase, or lead form"
      ],
      animationDirection:
        "Gold glints, smooth scroll reveals, parallax depth, editorial image masks, kinetic proof numbers, quiet premium micro-interactions.",
      conversionNotes: [
        "Repeat the CTA after proof-heavy sections.",
        "Keep the visual promise identical between ads and landing page.",
        "Use one hero claim, one supporting proof point, and one clear next action above the fold."
      ]
    };
  }

  function makeDeckSpec(project) {
    return {
      title: `${project.clientName} Golden Campaign Deck`,
      slides: [
        "Cover: black-and-gold key visual, offer, date/version",
        "The attention problem",
        "Audience insight",
        "Campaign idea",
        "Visual world and typography",
        "Storyboard frames",
        "Social media pack",
        "Website / landing page plan",
        "Production checklist",
        "CTA and next actions"
      ],
      editableGuidance:
        "Build in a common slide tool with editable text, masks, image placeholders, speaker notes, and alternate square/vertical exports."
    };
  }

  function makeAssetReplacementPlan(project) {
    return {
      sourceAssets: project.assets,
      auditChecklist: [
        "Resolution and aspect ratio",
        "Lighting direction and color temperature",
        "Camera angle and lens feel",
        "Brand-safe wardrobe, props, background, and logos",
        "Continuity between original and replacement frames"
      ],
      replacementPrompt:
        "Match the source asset's camera angle, lens compression, lighting direction, subject pose, and environment. Upgrade polish while preserving identity, realism, and brand continuity.",
      retouchNotes:
        "Use subtle cleanup only: skin texture preserved, no plastic smoothing, shadows consistent, typography editable after generation."
    };
  }

  function makeAutomationPlan(project) {
    const selected = project.services.map((service) => SERVICE_LIBRARY[service].label);
    const providerNames = project.providers.map((id) => PROVIDER_LIBRARY[id].name);
    return {
      operatingMode:
        "Goldie acts as unified creative agent: brief, auto-edit, route across AI providers, caption, package, and hand off editable assets.",
      selectedCapabilities: selected,
      selectedProviders: providerNames,
      pipeline: project.autoEdit
        ? [
            "1. Intake: upload source video, brief, brand, and platform targets.",
            "2. Analyze: detect hooks, scene changes, and caption opportunities.",
            "3. Frames: Flux + Nano Banana Pro stills for start/end plates per beat.",
            "4. Motion: Luma Labs primary pass; Runway/Kling/Cling/SeaDance per beat needs.",
            "5. Autonomous edit: insert b-roll, captions, CTA end card, mix audio.",
            "6. Shorts: Opus Clips for vertical cuts with burned-in captions.",
            "7. Finish: NLE polish (Resolve/Premiere/FCP) after client approval.",
            "8. QA: realism, continuity, caption accuracy, rights, and publish checklist."
          ]
        : [
            "1. Intake: brand, offer, audience, website/source assets, references.",
            "2. Strategy: campaign angle, audience tension, offer hierarchy.",
            "3. Direction: cinematic look, typography, lighting, camera language.",
            "4. Generation: image prompts, video prompts, voiceover, sound, deck copy.",
            "5. Packaging: platform exports, edit notes, captions, landing page sections.",
            "6. QA: realism, continuity, brand clarity, CTA, legal/usage checks."
          ],
      noCostNote:
        "Goldie creates original briefs, edit plans, and provider-specific prompts. Connect your own API keys and subscriptions for Luma, Runway, Kling, Flux, Higgsfield, and Opus Clips."
    };
  }

  function makeCaptionPlan(project) {
    const hooks = [
      `Most ${project.audience} scroll past generic ads.`,
      `${project.clientName} deserves a story that stops the scroll.`,
      `Here is what changes when you choose ${project.offer}.`
    ];
    return {
      style: project.captionStyle,
      hooks,
      fullScript: hooks.join(" "),
      opusClipsNotes: [
        "Enable auto-caption with brand font and gold highlight words.",
        "Place hook line in first 1.5 seconds as burned-in text.",
        "Add CTA caption card on final 2 seconds.",
        "Export 9:16, 1:1, and 16:9 with safe zones for UI overlays."
      ],
      accessibility: [
        "Keep captions under 42 characters per line where possible.",
        "Contrast ratio: gold on black or white on black only.",
        "Include speaker labels if multiple voices appear in source."
      ]
    };
  }

  function makeVideoEditPlan(project) {
    const source = project.videoSource;
    const durationLabel = source.uploaded
      ? `${Math.round(source.duration)}s source (${source.width}x${source.height})`
      : "awaiting source video upload";

    return {
      sourceSummary: source.uploaded
        ? `Editing ${source.fileName} — ${durationLabel}${source.hasAudio ? ", with speech/audio" : ", silent or no audio detected"}.`
        : "Upload a long-form video to activate autonomous clipping, captioning, and b-roll insertion.",
      opusClipsWorkflow: [
        "Upload source to Opus Clips or feed Goldie rough assembly.",
        "Target 5–12 shorts at 15–45s for Reels/TikTok/Shorts.",
        "Apply caption style from Goldie caption plan.",
        "Review virality-ranked hooks; reject weak openings."
      ],
      autonomousTimeline: [
        "0:00–0:03 — Pattern-break hook (macro still or strongest source moment).",
        "0:03–0:12 — Problem tension with b-roll from Luma/Kling.",
        "0:12–0:28 — Proof montage mixing source + generated b-roll.",
        "0:28–0:45 — Offer + CTA with kinetic captions and end card."
      ],
      bRollShotList: project.services.includes("documentary")
        ? [
            "Interview cutaway — Kling, soft documentary key",
            "Hands/detail macro — Nano Banana Pro",
            "Environment wide — Luma Labs start/end frame motion",
            "Product/service hero — Runway motion brush"
          ]
        : [
            "Hook macro — Nano Banana Pro 4K close-up",
            "Transformation montage — Luma Labs + Higgsfield theme pack",
            "Social proof insert — source clip or Kling b-roll",
            "CTA hero loop — Cling animate from Flux still"
          ],
      nleHandoff: "Export XML/EDL notes for Premiere, Resolve, or Final Cut with marker colors per provider."
    };
  }

  function makeProviderHandoffs(project, storyboard) {
    const tone = TONE_PRESETS[project.tone];
    return project.providers.map((providerId) => {
      const provider = PROVIDER_LIBRARY[providerId];
      const beats = storyboard.map((scene, index) => ({
        beat: scene.beat,
        startFramePrompt: `${scene.prompt}. ${tone.palette}. Start frame for ${provider.name}.`,
        endFramePrompt: `${scene.prompt}. ${tone.palette}. End frame for ${provider.name}.`,
        motionPrompt: `${scene.camera}; ${scene.edit}; provider=${provider.name}; ${provider.tagline}`,
        recommendedTool: provider.name,
        order: index + 1
      }));

      return {
        providerId,
        name: provider.name,
        role: provider.role,
        tagline: provider.tagline,
        bestFor: provider.bestFor,
        beats,
        exportNotes: `Route ${provider.name} outputs to project folder /exports/${providerId}/ with version suffix.`
      };
    });
  }

  function makeAutonomousEditPipeline(project, storyboard, providerHandoffs) {
    const primary = project.providers.includes("luma_labs") ? "Luma Labs" : PROVIDER_LIBRARY[project.providers[0]].name;
    return {
      enabled: project.autoEdit,
      primaryCreativeAgent: primary,
      stages: [
        {
          stage: "Ingest & analyze",
          actions: [
            project.videoSource.uploaded
              ? `Analyze ${project.videoSource.fileName} for hook moments and scene boundaries.`
              : "Await source video; use storyboard-only generation mode.",
            "Transcribe speech for caption alignment if audio present.",
            "Map platform targets: " + project.aspectRatios.join(", ")
          ]
        },
        {
          stage: "Frame lab",
          actions: [
            "Flux: storyboard stills for every beat.",
            "Nano Banana Pro: macro hook + product detail frames.",
            "Approve start/end pairs before motion generation."
          ]
        },
        {
          stage: "Motion generation",
          actions: providerHandoffs.map(
            (handoff) => `${handoff.name}: ${handoff.beats.length} beats — ${handoff.role}`
          )
        },
        {
          stage: "Autonomous assembly",
          actions: [
            "Insert b-roll on beat markers over source or voiceover.",
            "Apply caption style: " + project.captionStyle,
            "Mix music bed + room tone per audio plan.",
            "Add branded end card and CTA typography."
          ]
        },
        {
          stage: "Short-form export",
          actions: [
            "Opus Clips: generate vertical shorts with captions.",
            "Export hero 16:9, cutdowns 9:16 and 4:5.",
            "Package review link for client approval."
          ]
        }
      ],
      approvalGates: [
        "Approve provider routing before paid API spend.",
        "Approve caption script before burn-in.",
        "Approve final export before publish."
      ]
    };
  }

  function makeDeliverables(project) {
    return project.services.map((service) => ({
      service,
      label: SERVICE_LIBRARY[service].label,
      outputs: SERVICE_LIBRARY[service].outputs
    }));
  }

  function toMarkdown(plan) {
    const lines = [
      `# ${plan.project.projectName}`,
      "",
      `**Brand:** ${plan.project.brandName}`,
      `**Client:** ${plan.project.clientName}`,
      `**Goal:** ${plan.project.goal}`,
      `**Audience:** ${plan.project.audience}`,
      `**Website / source:** ${plan.project.website}`,
      "",
      "## Creative Brief",
      `- Positioning: ${plan.creativeBrief.positioning}`,
      `- Promise: ${plan.creativeBrief.promise}`,
      `- Visual world: ${plan.creativeBrief.visualWorld}`,
      `- Lighting: ${plan.creativeBrief.lighting}`,
      `- Typography: ${plan.creativeBrief.typography}`,
      "",
      "## Campaign Angles",
      ...plan.campaignAngles.map((angle) => `- **${angle.title}:** ${angle.hook} ${angle.payoff}`),
      "",
      "## Storyboard",
      ...plan.storyboard.flatMap((scene) => [
        `### ${scene.beat}`,
        `- Frame: ${scene.frame}`,
        `- Camera: ${scene.camera}`,
        `- Lighting: ${scene.lighting}`,
        `- VO: ${scene.voiceover}`,
        `- Prompt: ${scene.prompt}`,
        `- Edit: ${scene.edit}`
      ]),
      "",
      "## Master Prompts",
      `**Image:** ${plan.promptPack.masterImagePrompt}`,
      "",
      `**Video:** ${plan.promptPack.masterVideoPrompt}`,
      "",
      `**Voice:** ${plan.promptPack.voicePrompt}`,
      "",
      "## Social Pack",
      ...plan.socialPack.map(
        (item) =>
          `- **${item.platform}** (${item.format}): ${item.creativeAngle} Hook: ${item.hookOptions[0]}`
      ),
      "",
      "## Audio Plan",
      `- Voice: ${plan.audioPlan.voiceDirection}`,
      `- Music: ${plan.audioPlan.musicDirection}`,
      `- Script: ${plan.audioPlan.narrationScript}`,
      "",
      "## Website Build",
      ...plan.websiteBuild.sections.map((section) => `- ${section}`),
      "",
      "## Automation Pipeline",
      ...plan.automation.pipeline.map((step) => `- ${step}`),
      "",
      "## Video Edit Plan",
      `- Source: ${plan.videoEdit.sourceSummary}`,
      ...plan.videoEdit.autonomousTimeline.map((step) => `- ${step}`),
      "",
      "## Captions",
      `- Style: ${plan.captionPlan.style}`,
      `- Script: ${plan.captionPlan.fullScript}`,
      "",
      "## Provider Handoffs",
      ...plan.providerHandoffs.flatMap((handoff) => [
        `### ${handoff.name}`,
        `- Role: ${handoff.role}`,
        ...handoff.beats.slice(0, 2).map((beat) => `- ${beat.beat}: ${beat.motionPrompt}`)
      ]),
      "",
      `_${plan.automation.noCostNote}_`
    ];

    return lines.join("\n");
  }

  function createGoldyPlan(input) {
    const project = normalizeProject(input);
    const creativeBrief = makeCreativeBrief(project);
    const campaignAngles = makeCampaignAngles(project);
    const storyboard = makeStoryboard(project);
    const promptPack = makePromptPack(project, storyboard);
    const audioPlan = makeAudioPlan(project);
    const socialPack = makeSocialPack(project);
    const websiteBuild = makeWebsiteBuildSpec(project);
    const deckSpec = makeDeckSpec(project);
    const assetReplacement = makeAssetReplacementPlan(project);
    const automation = makeAutomationPlan(project);
    const deliverables = makeDeliverables(project);
    const captionPlan = makeCaptionPlan(project);
    const videoEdit = makeVideoEditPlan(project);
    const providerHandoffs = makeProviderHandoffs(project, storyboard);
    const autonomousPipeline = makeAutonomousEditPipeline(project, storyboard, providerHandoffs);
    const plan = {
      project,
      creativeBrief,
      campaignAngles,
      storyboard,
      promptPack,
      audioPlan,
      socialPack,
      websiteBuild,
      deckSpec,
      assetReplacement,
      automation,
      deliverables,
      captionPlan,
      videoEdit,
      providerHandoffs,
      autonomousPipeline
    };

    return {
      ...plan,
      markdown: toMarkdown(plan)
    };
  }

  return {
    ASPECT_RATIOS,
    PLATFORM_MATRIX,
    SERVICE_LIBRARY,
    TONE_PRESETS,
    PROVIDER_LIBRARY,
    DEFAULT_PROVIDERS,
    createGoldyPlan,
    normalizeProject
  };
});
