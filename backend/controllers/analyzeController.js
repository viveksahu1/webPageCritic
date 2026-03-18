const fetch = require("node-fetch");
const cheerio = require("cheerio");
const groq = require("../config/groq");

// ─── Scraper ──────────────────────────────────────────────────────────────────
const scrapeWebsite = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    const html = await response.text();
    // CLEAN HEAVY HTML (ADD THIS BLOCK)
    let cleanHtml = html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/<noscript[\s\S]*?>[\s\S]*?<\/noscript>/gi, "");

    // REMOVE HUGE JSON BLOBS (Next.js etc)
    cleanHtml = cleanHtml
      .replace(/window\.__NEXT_DATA__ = .*?<\/script>/gs, "")
      .replace(/window\.__INITIAL_STATE__ = .*?<\/script>/gs, "");

    const $ = cheerio.load(html);

    // ── Headings ──────────────────────────────────────────────────────────────
    const allHeadings = $("h1, h2, h3")
      .slice(0, 12)
      .map((i, el) => `[${el.tagName.toUpperCase()}] ${$(el).text().trim()}`)
      .get()
      .join(" | ");

    const h1Count = $("h1").length;

    // ── Nav ───────────────────────────────────────────────────────────────────
    const navItems = $("nav a, header a")
      .map((i, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    const navLinks = [...new Set(navItems)].slice(0, 12).join(", ");
    const navCount = [...new Set(navItems)].length;

    // ── CTAs ──────────────────────────────────────────────────────────────────
    const ctas = $("a, button")
      .filter((i, el) => $(el).text().length > 2 && $(el).text().length < 50)
      .slice(0, 10)
      .map((i, el) => $(el).text().trim())
      .get()
      .join(", ");

    // ── Copy ──────────────────────────────────────────────────────────────────
    const bodyText = $("p")
      .slice(0, 6)
      .map((i, el) => $(el).text().trim().slice(0, 200))
      .get()
      .filter((t) => t.length > 20)
      .join(" ");

    // ── Meta ──────────────────────────────────────────────────────────────────
    const metaDesc    = $('meta[name="description"]').attr("content") || "";
    const metaKeywords= $('meta[name="keywords"]').attr("content") || "";
    const canonical   = $('link[rel="canonical"]').attr("href") || "";
    const ogTitle     = $('meta[property="og:title"]').attr("content") || "";
    const ogDesc      = $('meta[property="og:description"]').attr("content") || "";
    const viewport    = $('meta[name="viewport"]').attr("content") || "";
    const charset     = $('meta[charset]').attr("charset") || "";

    // ── Images & Accessibility ────────────────────────────────────────────────
    const allImgs         = $("img");
    const imgCount        = allImgs.length;
    const imgsMissingAlt  = allImgs.filter((i, el) => !$(el).attr("alt") || $(el).attr("alt").trim() === "").length;
    const imgAlts         = allImgs.slice(0, 6).map((i, el) => $(el).attr("alt") || "[MISSING]").get().join(", ");

    // Large image hints (from src names)
    const imgSrcs = allImgs
      .slice(0, 10)
      .map((i, el) => $(el).attr("src") || "")
      .get()
      .filter(Boolean)
      .join(", ");

    // ── Forms ─────────────────────────────────────────────────────────────────
    const formFields = $("input:not([type=hidden]), select, textarea")
      .map((i, el) => $(el).attr("placeholder") || $(el).attr("name") || $(el).attr("type") || "field")
      .get()
      .filter(Boolean);
    const formFieldCount  = formFields.length;
    const formFieldNames  = formFields.join(", ");

    // Input labels
    const labelCount      = $("label").length;
    const inputCount      = $("input, select, textarea").length;
    const unlabelledInputs= Math.max(0, inputCount - labelCount);

    // ── Scripts & Resources ───────────────────────────────────────────────────
    const scripts         = $("script[src]");
    const scriptCount     = scripts.length;
    const scriptSrcs      = scripts.slice(0, 8).map((i, el) => $(el).attr("src") || "").get().join(", ");

    const stylesheetCount = $('link[rel="stylesheet"]').length;
    const inlineStyles    = $("[style]").length;

    // Blocking scripts (in <head>)
    const headScripts     = $("head script[src]").length;

    // Font detection
    const fontLinks       = $('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"], link[href*="typekit"], link[href*="fonts.com"]').length;
    const hasFontDisplay  = html.includes("font-display");

    // ── Social proof ──────────────────────────────────────────────────────────
    const socialProof = $("*")
      .filter((i, el) => {
        const t = $(el).text().toLowerCase();
        return (
          $(el).children().length === 0 &&
          (t.includes("customer") || t.includes("review") || t.includes("rating") ||
           t.includes("trusted") || t.includes("users") ||
           /\d+[k+]?\s*(customers|users|companies|teams|reviews)/i.test(t))
        );
      })
      .slice(0, 5)
      .map((i, el) => $(el).text().trim())
      .get()
      .join(" | ");

    // ── Pricing ───────────────────────────────────────────────────────────────
    const pricingText = $("*")
      .filter((i, el) => {
        const t = $(el).text().toLowerCase();
        return (
          $(el).children().length === 0 &&
          (t.includes("pricing") || t.includes("free") || t.includes("plan") ||
           t.includes("per month") || t.includes("/mo") || t.includes("trial"))
        );
      })
      .slice(0, 5)
      .map((i, el) => $(el).text().trim())
      .get()
      .join(" | ");

    // ── Layout hints ─────────────────────────────────────────────────────────
    const footerText     = $("footer").text().replace(/\s+/g, " ").trim().slice(0, 300);
    const sectionCount   = $("section, article, .section").length;
    const hasVideo       = $("video, iframe[src*='youtube'], iframe[src*='vimeo']").length > 0;
    const hasChat        = html.toLowerCase().includes("intercom") || html.toLowerCase().includes("drift") || html.toLowerCase().includes("crisp");
    const hasCookieBanner= html.toLowerCase().includes("cookie") || html.toLowerCase().includes("gdpr");
    const totalTextLen   = $("body").text().replace(/\s+/g, " ").trim().length;

    // Color/contrast hints
    const lowContrastHints = $("[style*='color']").length;

    const limit = (str, n = 300) => (str || "").slice(0, n);

    return {
      title:         $("title").text().trim(),
      metaDesc,
      metaKeywords,
      canonical,
      ogTitle,
      ogDesc,
      viewport,
      charset,
      h1:            $("h1").first().text().trim(),
      h1Count,
      allHeadings,
      navLinks: limit(navLinks, 200),
      navCount,
      ctas: limit(ctas, 200),
      bodyText: limit(bodyText, 500),
      socialProof: limit(socialProof, 200),
      pricingText,
      footerText: limit(footerText, 200),
      formFieldNames,
      formFieldCount,
      unlabelledInputs,
      imgCount,
      imgsMissingAlt,
      imgAlts,
      imgSrcs,
      scriptCount,
      scriptSrcs,
      headScripts,
      stylesheetCount,
      inlineStyles,
      fontLinks,
      hasFontDisplay,
      sectionCount,
      hasVideo,
      hasChat,
      hasCookieBanner,
      totalTextLen,
      lowContrastHints,
    };
  } catch (error) {
    return null;
  }
};

// ─── POST /api/analyze ────────────────────────────────────────────────────────
const analyze = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: "URL is required." });
  }

  const d = await scrapeWebsite(url);
  if (!d) {
    return res.status(500).json({ success: false, error: "Could not read website." });
  }

  const prompt = `You are a world-class CRO strategist, UX expert, conversion copywriter, frontend performance engineer, and SEO specialist.
Perform a full, exhaustive audit of this landing page across ALL dimensions. Be specific and brutally honest — reference actual detected data.

URL: ${url}

── RAW PAGE DATA ──────────────────────────────────────────────────────────────
CONTENT
  Title Tag:          ${d.title}
  Meta Description:   ${d.metaDesc || "MISSING"}
  H1:                 ${d.h1}
  H1 Count:           ${d.h1Count} ${d.h1Count > 1 ? "(PROBLEM: multiple H1s)" : ""}
  All Headings:       ${d.allHeadings}
  Body Copy:          ${d.bodyText}
  Social Proof:       ${d.socialProof || "None detected"}
  Pricing Signals:    ${d.pricingText || "None detected"}

SEO / META
  OG Title:           ${d.ogTitle || "MISSING"}
  OG Description:     ${d.ogDesc || "MISSING"}
  Canonical URL:      ${d.canonical || "MISSING"}
  Meta Keywords:      ${d.metaKeywords || "None"}
  Viewport Meta:      ${d.viewport || "MISSING"}

NAVIGATION & STRUCTURE
  Nav Items (${d.navCount}):   ${d.navLinks || "Not detected"}
  Sections/Articles:  ${d.sectionCount}
  Total Text Length:  ${d.totalTextLen} chars
  Has Video:          ${d.hasVideo}
  Has Live Chat:      ${d.hasChat}
  Cookie Banner:      ${d.hasCookieBanner}

CTAs
  All CTAs Found:     ${d.ctas}

FORMS
  Form Fields (${d.formFieldCount}): ${d.formFieldNames || "None"}
  Unlabelled Inputs:  ${d.unlabelledInputs}

IMAGES & ACCESSIBILITY
  Total Images:       ${d.imgCount}
  Missing Alt Text:   ${d.imgsMissingAlt}
  Image Alt Samples:  ${d.imgAlts}
  Image Sources:      ${d.imgSrcs}

PERFORMANCE SIGNALS
  Total Scripts:      ${d.scriptCount}
  Blocking Head Scripts: ${d.headScripts}
  Script Sources:     ${d.scriptSrcs}
  Stylesheets:        ${d.stylesheetCount}
  Inline Style Attrs: ${d.inlineStyles}
  External Font Libs: ${d.fontLinks}
  font-display set:   ${d.hasFontDisplay}

FOOTER
  ${d.footerText || "None detected"}
──────────────────────────────────────────────────────────────────────────────

Return ONLY a single raw JSON object — no markdown, no backticks. All fields must contain real specific analysis based on the actual data above. Never write placeholder text.

{
  "siteName": "${d.title}",

  "overallScore": <0-100 honest integer>,
  "verdict": "<punchy 8-12 word verdict capturing the core conversion problem>",
  "summary": "<3-4 sentences: what the page does, key strength, #1 conversion killer, top priority fix>",

  "scoreBreakdown": {
    "ux":          <0-100>,
    "copywriting": <0-100>,
    "conversion":  <0-100>,
    "seo":         <0-100>,
    "performance": <0-100>,
    "accessibility":<0-100>
  },

  "croMetrics": [
    { "name": "Hero Clarity",       "score": <0-100>, "note": "<2-3 sentences referencing actual H1 and copy>" },
    { "name": "CTA Visibility",     "score": <0-100>, "note": "<placement, wording, count, urgency>" },
    { "name": "Value Proposition",  "score": <0-100>, "note": "<does it answer why you, why now, why not competitor>" },
    { "name": "Trust Signals",      "score": <0-100>, "note": "<actual social proof found or missing>" },
    { "name": "Pricing Clarity",    "score": <0-100>, "note": "<is pricing visible, clear, objection-handled>" },
    { "name": "Objection Handling", "score": <0-100>, "note": "<FAQs, guarantees, risk reversal>" },
    { "name": "Scarcity & Urgency", "score": <0-100>, "note": "<any urgency triggers present>" },
    { "name": "Mobile Readiness",   "score": <0-100>, "note": "<infer from viewport meta, structure, layout>" }
  ],

  "categories": [
    { "name": "Conversion Clarity",    "score": <0-100>, "note": "<specific finding>" },
    { "name": "CTA Effectiveness",     "score": <0-100>, "note": "<specific finding>" },
    { "name": "Copy Quality",          "score": <0-100>, "note": "<specific finding>" },
    { "name": "UX Friction",           "score": <0-100>, "note": "<specific finding>" },
    { "name": "Social Proof",          "score": <0-100>, "note": "<specific finding>" },
    { "name": "SEO & Discoverability", "score": <0-100>, "note": "<title, meta, H1, canonical>" }
  ],

  "uxFriction": {
    "score": <0-100>,
    "issues": [
      <List EVERY real UX problem found — minimum 5. Reference actual detected numbers.>
      { "severity": "high",   "issue": "<specific UX problem>", "detail": "<why it hurts conversions>", "fix": "<exact actionable fix>" },
      { "severity": "high",   "issue": "<nav has ${d.navCount} items>", "detail": "<reduces focus and increases cognitive load>", "fix": "<reduce to 4-5 max, move extras to footer>" },
      { "severity": "medium", "issue": "<specific UX problem>", "detail": "<...>", "fix": "<...>" },
      { "severity": "medium", "issue": "<specific UX problem>", "detail": "<...>", "fix": "<...>" },
      { "severity": "low",    "issue": "<specific UX problem>", "detail": "<...>", "fix": "<...>" }
    ]
  },

  "performance": {
    "score": <0-100 — base on: scriptCount=${d.scriptCount}, headScripts=${d.headScripts}, fontLibs=${d.fontLinks}, stylesheets=${d.stylesheetCount}>,
    "issues": [
      <Minimum 4 issues referencing actual script counts, font libs, image sources>
      { "severity": "high",   "issue": "${d.scriptCount} total scripts detected",          "impact": "<estimated load impact>", "fix": "<bundle, defer, or remove>" },
      { "severity": "high",   "issue": "${d.headScripts} render-blocking scripts in <head>","impact": "<blocks first paint>",    "fix": "<move to end of body or add defer/async>" },
      { "severity": "medium", "issue": "<font loading issue based on ${d.fontLinks} external font libs>", "impact": "<...>", "fix": "<add font-display:swap, self-host fonts>" },
      { "severity": "medium", "issue": "<image optimisation — ${d.imgCount} images detected>", "impact": "<...>", "fix": "<use WebP, add lazy loading, compress>" }
    ],
    "recommendations": [
      "<specific recommendation 1>",
      "<specific recommendation 2>",
      "<specific recommendation 3>"
    ]
  },

  "accessibility": {
    "score": <0-100 — base on: imgsMissingAlt=${d.imgsMissingAlt}, unlabelledInputs=${d.unlabelledInputs}, viewport=${d.viewport ? "present" : "missing"}>,
    "issues": [
      <Minimum 4 issues. Reference ACTUAL numbers from the page data.>
      { "wcag": "1.1.1", "severity": "critical", "issue": "${d.imgsMissingAlt} images missing alt text out of ${d.imgCount} total", "fix": "<add descriptive alt text to all images>" },
      { "wcag": "1.4.3", "severity": "high",     "issue": "<colour contrast — infer from page style/theme>",                        "fix": "<ensure contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text>" },
      { "wcag": "1.3.1", "severity": "high",     "issue": "${d.unlabelledInputs} form inputs missing associated labels",             "fix": "<add <label for=...> to every input field>" },
      { "wcag": "2.4.3", "severity": "medium",   "issue": "<keyboard navigation / focus order>",                                    "fix": "<ensure all interactive elements are keyboard-reachable in logical order>" }
    ]
  },

  "seo": {
    "score": <0-100 — base on actual meta/heading data>,
    "issues": [
      <Minimum 5 SEO issues referencing actual detected data>
      { "priority": "critical", "issue": "${!d.metaDesc ? "Meta description is MISSING" : "Meta description: " + d.metaDesc.slice(0,60) + "..."}", "fix": "<write a 120-155 char description with primary keyword and CTA>" },
      { "priority": "high",     "issue": "${d.h1Count > 1 ? "Multiple H1 tags (" + d.h1Count + ") detected" : "H1 analysis: " + d.h1.slice(0,60)}",   "fix": "<...>" },
      { "priority": "high",     "issue": "${!d.canonical ? "Canonical URL is MISSING" : "Canonical: " + d.canonical}",              "fix": "<add canonical tag to prevent duplicate content issues>" },
      { "priority": "medium",   "issue": "${!d.ogTitle ? "Open Graph title missing" : "OG tags present"}",                           "fix": "<add og:title, og:description, og:image for social sharing>" },
      { "priority": "medium",   "issue": "<heading hierarchy analysis based on: ${d.allHeadings.slice(0,100)}>",                     "fix": "<ensure logical H1 → H2 → H3 hierarchy with target keywords>" }
    ],
    "positives": [
      "<genuine SEO strength found on this page>",
      "<another SEO positive>"
    ]
  },

  "issues": [
    <AT LEAST 7 conversion issues — critical/high/medium>
    { "severity": "critical", "title": "<short title>", "description": "<specific problem + conversion impact>", "fix": "<exact actionable fix>" },
    { "severity": "critical", "title": "<short title>", "description": "<...>", "fix": "<...>" },
    { "severity": "high",     "title": "<short title>", "description": "<...>", "fix": "<...>" },
    { "severity": "high",     "title": "<short title>", "description": "<...>", "fix": "<...>" },
    { "severity": "high",     "title": "<short title>", "description": "<...>", "fix": "<...>" },
    { "severity": "medium",   "title": "<short title>", "description": "<...>", "fix": "<...>" },
    { "severity": "medium",   "title": "<short title>", "description": "<...>", "fix": "<...>" }
  ],

  "wins": [
    "<specific genuine positive referencing actual page element>",
    "<specific genuine positive>",
    "<specific genuine positive>",
    "<specific genuine positive>"
  ],

  "ctaOptimization": [
    <Rewrite every CTA found on the page. Minimum 4.>
    { "original": "<exact CTA from page>", "suggested": "<stronger version>", "reason": "<psychology principle>" },
    { "original": "<...>", "suggested": "<...>", "reason": "<...>" },
    { "original": "<...>", "suggested": "<...>", "reason": "<...>" },
    { "original": "<...>", "suggested": "<...>", "reason": "<...>" }
  ],

  "copyRewrites": [
    { "section": "Hero Headline",    "original": "${d.h1}", "suggested": "<outcome-driven rewrite with specificity>" },
    { "section": "Meta Description", "original": "${d.metaDesc || "Not set"}", "suggested": "<click-optimised under 155 chars>" },
    { "section": "Primary CTA",      "original": "<main CTA>", "suggested": "<action + benefit format>" },
    { "section": "Value Proposition","original": "<body copy snippet>", "suggested": "<benefit-first rewrite>" },
    { "section": "Subheadline",      "original": "<detected>", "suggested": "<clearer version>" },
    { "section": "Social Proof",     "original": "${d.socialProof || "None found"}", "suggested": "<how to present more persuasively>" }
  ],

  "abTests": [
    <5 specific A/B tests — reference actual page elements>
    { "id": 1, "element": "<page element>", "variantA": "<current control>",     "variantB": "<challenger>",        "hypothesis": "<why B should win>", "expectedLift": "<realistic range e.g. +8-15%>" },
    { "id": 2, "element": "<page element>", "variantA": "<current control>",     "variantB": "<challenger>",        "hypothesis": "<...>",              "expectedLift": "<...>" },
    { "id": 3, "element": "<page element>", "variantA": "<current control>",     "variantB": "<challenger>",        "hypothesis": "<...>",              "expectedLift": "<...>" },
    { "id": 4, "element": "<page element>", "variantA": "<current control>",     "variantB": "<challenger>",        "hypothesis": "<...>",              "expectedLift": "<...>" },
    { "id": 5, "element": "<page element>", "variantA": "<current control>",     "variantB": "<challenger>",        "hypothesis": "<...>",              "expectedLift": "<...>" }
  ],

  "quickWins": [
    { "action": "<specific change with example copy>", "effort": "low", "impact": "<expected outcome>" },
    { "action": "<...>", "effort": "low", "impact": "<...>" },
    { "action": "<...>", "effort": "low", "impact": "<...>" },
    { "action": "<...>", "effort": "low", "impact": "<...>" }
  ],

  "competitorGaps": "<2-3 sentences: what trust signals, features, or conversion elements do top competitors in this niche typically have that this page is missing?>",

  "priorityRoadmap": [
    { "priority": 1, "action": "<most impactful change>", "why": "<reason>", "timeframe": "This week" },
    { "priority": 2, "action": "<...>",                   "why": "<...>",    "timeframe": "This week" },
    { "priority": 3, "action": "<...>",                   "why": "<...>",    "timeframe": "This month" },
    { "priority": 4, "action": "<...>",                   "why": "<...>",    "timeframe": "This month" },
    { "priority": 5, "action": "<...>",                   "why": "<...>",    "timeframe": "Next quarter" }
  ]
}`;


const approxTokens = JSON.stringify(prompt).length / 4;
console.log("Estimated tokens:", approxTokens);

  try {
    const completion = await groq.chat.completions.create({
      model:       "groq/compound",
      temperature: 0.2,
      max_tokens:  4000,
      messages: [
        {
          role:    "system",
          content: "You are a strict JSON generator and expert CRO/UX/SEO/performance analyst. Return ONLY raw JSON — no markdown, no backticks, no preamble. Every field must contain real specific analysis of the actual page data. Never use placeholder text or angle brackets in values.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    let jsonText = completion.choices[0].message.content;
    jsonText = jsonText.replace(/```json|```/g, "").trim();

    const result = JSON.parse(jsonText);
    res.status(200).json(result);
  } catch (err) {
    console.error("AI Analysis Error Detail:", err);

    let errorMessage = "An unexpected error occurred during analysis.";
    let statusCode = err.status || 500;

    // 1. Handle Rate Limits (TPD/TPM) - Status 429
    if (statusCode === 429) {
      const timeMatch = err.message.match(/try again in ([\dhmsms.]+)/i);
      const waitTime = timeMatch ? timeMatch[1] : "a few minutes";
      errorMessage = `Rate limit reached. Please try again in ${waitTime}.`;
    } 
    
    // 2. Handle Request Too Large (TPM/Context) - Status 413 or 400
    else if (statusCode === 413 || (err.code === 'context_length_exceeded' || err.code === 'rate_limit_exceeded' && err.type === 'tokens')) {
      errorMessage = "The website content is too large for the AI to process. Try a simpler page.";
      statusCode = 413; // Request Entity Too Large
    }

    // 3. Handle General Bad Requests (Context Length) - Status 400
    else if (statusCode === 400) {
      errorMessage = "The analysis request was too complex. Please try again later.";
    }

    // Return the formatted error to the frontend
    return res.status(statusCode).json({ 
      success: false, 
      error: errorMessage 
    });
  }
};

module.exports = { analyze };