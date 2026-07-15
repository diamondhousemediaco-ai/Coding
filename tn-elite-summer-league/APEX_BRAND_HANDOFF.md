# Brand & Logo — Exploration Handoff (still exploring; working favorite: APEX)

_Companion to `HANDOFF.md` (master plan) and `CLAUDE.md` (hard rules). This captures the
**in-progress branding / naming exploration** from the web session so a fresh Claude Code chat can keep going.
**⚠️ NOTHING here is final — we are still actively trying different names and brand directions.**
Last updated: 2026-07-15._

---

## 0. TL;DR — STILL EXPLORING (nothing locked)

- 🚧 **We are still exploring names and brand identities. No name, logo, colorway, or style is final.** Expect to keep trying more.
- **Current working favorite (an experiment, not a decision): `APEX`** (single word) — the latest direction we liked. Still 100% open to other names and brands.
- **Also explored:** a **"PEAK"** brand (mountain mark), and a long list of one-word / two-word name candidates. **"New Era" was ruled out** (direct trademark collision with New Era Cap, the NBA's headwear brand).
- **All logos so far are experiments**, generated in **Higgsfield** (Recraft V4.1 + Nano Banana Pro) — links in §1. The APEX wordmark (bold white, the "A" spiking into a peak) is the one we liked most *so far*.
- ⚠️ Before ANY name gets committed: run a **trademark + domain + @handle check** (e.g. "Apex" is a crowded mark).
- The whole project still says **"TN Elite Summer League / TN ELITE SL"** — unchanged. **No global rename has happened, and none should until a name is truly locked.**

---

## 1. Logos we liked so far + generation links (all experiments — nothing final)

> All images live on the user's **Higgsfield** account (CDN host `d8j0ntlcm91z4.cloudfront.net`).
> NOTE: that host is **blocked from the web-session sandbox**, so the web Claude couldn't see/download them —
> open them in a normal browser or the **Higgsfield gallery**. A local Claude Code with Higgsfield access
> can re-cut / upscale them by `job_id`.

### ⭐ Favorite so far — single clean APEX wordmark (white on black)
- **Job ID:** `dd27a850-b744-424c-b87b-dd811f73aae4`
- **On black (view):** https://d8j0ntlcm91z4.cloudfront.net/user_37hpLSsnbJjeTTqOCu6Z3g5z9eI/hf_20260715_031633_dd27a850-b744-424c-b87b-dd811f73aae4.png
- **Transparent cutout (white letters, no bg):** job `412a9c6d-2e2b-4fea-963d-f18e8c41a929` →
  https://d8j0ntlcm91z4.cloudfront.net/user_37hpLSsnbJjeTTqOCu6Z3g5z9eI/hf_20260715_033034_412a9c6d-2e2b-4fea-963d-f18e8c41a929.png
- Size: 2048×2048. (A 4K upscale was attempted and **failed** — re-run `upscale_image` if a giant version is needed.)
- ⚠️ **OPEN ISSUE:** the user reports some links still show a *board* of multiple logos, not the single one.
  The clean single APEX exists as its own generation (`dd27a850`) — grab it from the Higgsfield gallery,
  or re-isolate it in a session that can actually SEE Higgsfield output.

### Alt / second option (not chosen)
- APEX finalize option B: job `daf2a565-8e1b-4dbd-a67b-e5cc8de1a1d9`

### Source concept board (4 APEX directions — TOP-LEFT is the chosen one)
- **Job ID:** `0a4c55e3-d691-40a1-925a-96cbe071832d` (Recraft V4.1, vector/SVG)
- https://d8j0ntlcm91z4.cloudfront.net/user_37hpLSsnbJjeTTqOCu6Z3g5z9eI/hf_20260715_030554_0a4c55e3-d691-40a1-925a-96cbe071832d_min.webp
- 4 concepts: **(TL) APEX wordmark, A-as-peak ← CHOSEN**, (TR) rising chevrons, (BL) diamond/vertex badge, (BR) ball at triangle apex.

### Banked alternative brand (if APEX ever falls through): "PEAK"
- PEAK logo — white faceted mountain + orange swoosh, word **PEAK** peeking behind the ridge (no basketball):
  job `3b7d1d01-b9a3-4c5c-a498-4b6f049c19d3` →
  https://d8j0ntlcm91z4.cloudfront.net/user_37hpLSsnbJjeTTqOCu6Z3g5z9eI/hf_20260715_030021_3b7d1d01-b9a3-4c5c-a498-4b6f049c19d3_min.webp

### How to reproduce / edit the APEX logo (Higgsfield)
1. Concept board: `recraft_v4_1`, `model_type:vector`, prompt = "logo concept board … APEX … A styled as a sharp peak …", colors `#3B82F6/#93C5FD/#FFFFFF/#C9C9D1`, bg `#09090B`.
2. Isolate: `nano_banana_pro`, `medias:[{role:image, value:"0a4c55e3-…"}]`, prompt = "take ONLY the top-left APEX wordmark, recreate as a single centered logo, nothing else."
3. Finish: `upscale_image` (→4K) and `remove_background` (→transparent), by `job_id`.

---

## 2. Brand style / direction so far

**Vibe:** Premium, pro, "highest stage before college." Inspired by **Unrivaled's** playbook —
dark & cinematic, chrome/metallic wordmark treatment, pill UI, star-forward, an "___ IN ACTION" content module —
**but NOT their exact purple+blue.**

**APEX color direction (not finalized):**
- Logo as chosen = **white on black.** Concepts explored in **electric blue + white on black**.
- User wants **vibrant, modern, cohesive, well-known palettes** (rejected random gradients). Purple/blue OK *if not* the exact Unrivaled purple-teal.
- Candidate palettes floated: royal blue + white · red + white · purple + gold · teal + orange.
- **TODO:** lock ONE colorway for APEX.

**Existing site brand tokens (from the "TN Elite SL" era — still in all the HTML):**
```css
--bg:#09090B; --panel:#121216; --panel2:#17171C; --line:rgba(255,255,255,.09);
--txt:#F5F5F4; --mut:#A1A1AA; --dim:#71717A;
--blaze:#FF4D1C; /* orange */  --volt:#E8FF3A; /* yellow */  --ice:#5EEAD4;
font: 'Poppins' (400–900); headings 800–900 uppercase; pill nav 999px; cards 14–18px radius.
```
> When APEX + its colorway are locked, decide whether to keep Poppins + swap accents to the APEX palette,
> or do a fuller restyle. Verify at 393px (iPhone) — see CLAUDE.md.

---

## 3. Files / what changed this session

Repo: **`diamondhousemediaco-ai/Coding`**, branch **`claude/new-session-75v5kg`**. Project folder: `tn-elite-summer-league/`.

New / changed this session:
- **`site/index.html`** — REPLACED with a new **full-screen swipe carousel home** (Instagram-style, dot indicators, 8 slides). Dependency-free + tiny inline JS. iOS header-bleed bug fixed (added `-webkit-backdrop-filter`). Verified no horizontal overflow at 393/820/1440px.
- **`site/index_classic.html`** — backup of the original scrolling home.
- **`pages/investor_example.html`** — mock cap-table / investor-explainer visual (illustrative numbers).
- **`notes/conversation_transcript.md`** + **`notes/TESL_Conversation_Transcript.docx`** — full verbatim planning transcript.
- **`.github/workflows/deploy-pages.yml`** — extended to also publish `tn-elite-summer-league/site/` to GitHub Pages at **`/league/`**.
- Everything else (the 13 site pages, `pages/`, `office/`, `build/`, `HANDOFF.md`, `CLAUDE.md`) is unchanged and **still branded "TN Elite Summer League / TN ELITE SL."**

**Live preview (GitHub Pages):** https://diamondhousemediaco-ai.github.io/Coding/league/
(If it 404s, enable Pages: repo Settings → Pages → Source: Deploy from a branch → `gh-pages` / root.)

**Deploy note:** direct upload to **Vercel/Netlify is blocked** from the web sandbox (network policy). A **local** Claude Code (off-remote) can deploy normally with your Vercel/Netlify login. That's a good reason to continue locally.

---

## 4. Open to-dos (in priority order)

1. **Get the clean, isolated single APEX logo file** (the current blocker) — download `dd27a850` from the Higgsfield gallery, or re-isolate it in a session that can see Higgsfield output.
2. **Trademark + domain + @handle check on "Apex"** before committing the name.
3. **Lock the APEX colorway** (one cohesive palette).
4. **Build the brand kit:** primary logo, icon-only mark, wordmark, `APEX + SUMMER LEAGUE` lockup, colorways, on-light/on-dark, clear-space/sizing.
5. **Global rename** once name is final: find-and-replace `TN Elite Summer League` / `TN ELITE SL` → `APEX` across all files; update brand tokens to the APEX palette.
6. Resume the original 4-step work order from the kickoff: (a) deploy site live, (b) name → done-ish, (c) **Belmont "Official Home" one-pager + TSSAA written-ruling letter**, (d) **tryout pre-registration page**.

## 5. Hard rules reminder (from CLAUDE.md — don't violate)
Season not Session · 10-man rosters / 10-round draft · Sundays off always · **D2 college crews only** (3-man league / 2-man tourneys, 3-man finals) · no PTZ cameras · no cash prizes · tournaments never streamed · coaches never coach their own school's players · first tip **Thu Jun 3, 2027** at Belmont. Don't change budget numbers/dates/structure without asking.
