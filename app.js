let pageMap = {};
let campaignWasEdited = false;
let lastSuggestion = "";

const $ = (id) => document.getElementById(id);

async function loadMapping() {
  try {
    const response = await fetch("mapping.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Mapping yüklenemedi.");
    pageMap = await response.json();
  } catch (error) {
    $("status").textContent = "Mapping dosyası yüklenemedi; URL yapısından tahmin yapılacak.";
    $("status").className = "status warning";
  }
}

function normalizeUrl(value) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.toLowerCase().replace(/\/+$/, "");
    return host + path;
  } catch {
    return "";
  }
}

function fallbackFromUrl(value) {
  try {
    const url = new URL(value.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    const slug = parts.at(-1) || "";

    const type = url.pathname.includes("/news/")
      ? "News"
      : url.pathname.includes("/products/")
        ? "Product"
        : (url.pathname.includes("/solutions/") ||
           url.pathname.includes("/cyber-security-services"))
          ? "Solution"
          : "Page";

    const name = slug
      .split("-")
      .map((item) =>
        item.charAt(0).toUpperCase() + item.slice(1)
      )
      .join(" ");

    const excluded = new Set([
      "and", "the", "of", "for", "system", "systems",
      "platform", "platforms", "en", "havelsan",
      "delivered", "critical", "capabilities",
      "air", "force"
    ]);

    const words = slug
      .split("-")
      .filter((item) => item && !excluded.has(item));

    const code = type === "News"
      ? words.slice(0, 2).join("_")
      : words.length === 1
        ? words[0].slice(0, 12)
        : words.map((item) => item[0]).join("").slice(0, 6);

    return { type, name, code };
  } catch {
    return { type: "", name: "", code: "" };
  }
}

function detectPage() {
  const landing = $("landing").value.trim();
  const key = normalizeUrl(landing);
  const matched = pageMap[key];
  const item = matched || fallbackFromUrl(landing);

  $("pageType").textContent = item.type || "—";
  $("pageName").textContent = item.name || "—";
  $("shortCode").value = item.code || "";

  if (!landing) {
    $("status").textContent = "";
    $("status").className = "status";
  } else if (matched) {
    $("status").textContent = "Sayfa eşleşti.";
    $("status").className = "status success";
  } else {
    $("status").textContent = "Listede birebir eşleşme yok; URL yapısından tahmin edildi.";
    $("status").className = "status warning";
  }

  refreshCampaignSuggestion();
}

function campaignSuffix() {
  const medium = $("medium").value;
  const source = $("source").value;

  if (source === "Press" && ["Email", "Referral"].includes(medium)) return "pressrelease";
  if (["PaidSearch", "PaidSocial"].includes(medium)) return "traffic";
  if (medium === "Email") return "email";
  if (medium === "Referral") return "referral";
  return "";
}

function sanitizeCampaignPart(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildSuggestion() {
  return [
    sanitizeCampaignPart($("source").value),
    sanitizeCampaignPart($("shortCode").value),
    campaignSuffix()
  ].filter(Boolean).join("_");
}

function refreshCampaignSuggestion(force = false) {
  const suggestion = buildSuggestion();
  if (force || !campaignWasEdited || $("campaign").value === lastSuggestion) {
    $("campaign").value = suggestion;
    lastSuggestion = suggestion;
    campaignWasEdited = false;
  }
}

function generateUrl() {
  const landing = $("landing").value.trim();
  const medium = $("medium").value;
  const source = $("source").value;
  const campaign = sanitizeCampaignPart($("campaign").value);
  const result = $("result");

  if (!landing || !medium || !source || !campaign) {
    result.value = "";
    $("feedback").textContent = "Zorunlu alanları doldurun.";
    return;
  }

  try {
    const url = new URL(landing);
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", campaign);
    result.value = url.toString();
    $("campaign").value = campaign;
    $("feedback").textContent = "UTM linki hazır.";
  } catch {
    result.value = "";
    $("feedback").textContent = "Geçerli bir Landing URL girin.";
  }
}

async function copyUrl() {
  const value = $("result").value;
  if (!value) {
    $("feedback").textContent = "Önce URL oluşturun.";
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    $("feedback").textContent = "Link kopyalandı.";
  } catch {
    $("result").select();
    document.execCommand("copy");
    $("feedback").textContent = "Link kopyalandı.";
  }
}

function clearForm() {
  ["landing", "shortCode", "campaign", "result"].forEach((id) => $(id).value = "");
  $("medium").value = "";
  $("source").value = "";
  $("pageType").textContent = "—";
  $("pageName").textContent = "—";
  $("status").textContent = "";
  $("feedback").textContent = "";
  campaignWasEdited = false;
  lastSuggestion = "";
  $("landing").focus();
}

$("landing").addEventListener("input", detectPage);
$("shortCode").addEventListener("input", () => refreshCampaignSuggestion());
$("medium").addEventListener("change", () => refreshCampaignSuggestion());
$("source").addEventListener("change", () => refreshCampaignSuggestion());
$("campaign").addEventListener("input", () => { campaignWasEdited = true; });
$("generateButton").addEventListener("click", generateUrl);
$("copyButton").addEventListener("click", copyUrl);
$("clearButton").addEventListener("click", clearForm);

loadMapping();
