(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.GoldieSkills = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DEFAULT_SKILLS_URL = "goldie/skills.json";
  const DEFAULT_PROVIDERS_URL = "goldie/providers.json";

  let registryCache = null;
  let providersCache = null;

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.json();
  }

  async function loadRegistry(url = DEFAULT_SKILLS_URL) {
    if (!registryCache) {
      registryCache = await fetchJson(url);
    }
    return registryCache;
  }

  async function loadProviders(url = DEFAULT_PROVIDERS_URL) {
    if (!providersCache) {
      providersCache = await fetchJson(url);
    }
    return providersCache;
  }

  async function loadAll() {
    const [registry, providers] = await Promise.all([loadRegistry(), loadProviders()]);
    return { registry, providers };
  }

  function listSkills(registry, { category, status = "enabled" } = {}) {
    return registry.skills.filter((skill) => {
      if (status && skill.status !== status) return false;
      if (category && skill.category !== category) return false;
      return true;
    });
  }

  function getSkill(registry, skillId) {
    return registry.skills.find((skill) => skill.id === skillId) || null;
  }

  function listProviders(providersDoc, { category } = {}) {
    return providersDoc.providers.filter((provider) => {
      if (category && provider.category !== category) return false;
      return provider.status !== "disabled";
    });
  }

  function getProvider(providersDoc, providerId) {
    return providersDoc.providers.find((provider) => provider.id === providerId) || null;
  }

  function recommendProvidersForServices(providersDoc, services) {
    const serviceSet = new Set(services || []);
    return providersDoc.providers.filter((provider) =>
      (provider.goldyServices || []).some((service) => serviceSet.has(service))
    );
  }

  function recommendSkillsForProviders(registry, providerIds) {
    const idSet = new Set(providerIds || []);
    return registry.skills.filter((skill) => skill.providerId && idSet.has(skill.providerId));
  }

  const CATEGORY_LABELS = {
    "video-editing": "Video editing",
    "ai-creative-generation": "AI creative generation",
    "image-editing": "Image editing",
    "client-operations": "Client operations",
    "product-development": "Product development",
    analytics: "Analytics",
    marketing: "Marketing",
    "sales-operations": "Sales operations",
    "agent-development": "Agent development",
    "video-generation": "Video generation",
    "video-animation": "Video animation",
    "image-generation": "Image generation",
    "clip-editing": "Clip editing"
  };

  return {
    DEFAULT_SKILLS_URL,
    DEFAULT_PROVIDERS_URL,
    CATEGORY_LABELS,
    loadRegistry,
    loadProviders,
    loadAll,
    listSkills,
    getSkill,
    listProviders,
    getProvider,
    recommendProvidersForServices,
    recommendSkillsForProviders
  };
});
