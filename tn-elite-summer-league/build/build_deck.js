const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625

// palette
const BG = "0B0B0D", PANEL = "15151A", PANEL2 = "1B1B21", LINE = "2E2E36";
const TXT = "F5F5F4", MUT = "A1A1AA", DIM = "6B6B74";
const BLAZE = "FF4D1C", VOLT = "E8FF3A", ICE = "5EEAD4";
const HEAD = "Poppins", BODY = "Arial";

function base(s){ s.background = { color: BG }; }
function kicker(s, text, x, y, w, color){
  s.addText(text.toUpperCase(), { x, y, w, h: 0.3, fontFace: HEAD, fontSize: 10, bold: true,
    color: color || VOLT, charSpacing: 4, margin: 0 });
}
function title(s, text, x, y, w, size, color){
  s.addText(text, { x, y, w, h: 0.75, fontFace: HEAD, fontSize: size || 30, bold: true,
    color: color || TXT, margin: 0 });
}
function card(s, x, y, w, h, fill){
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.08,
    fill: { color: fill || PANEL }, line: { color: LINE, width: 0.75 } });
}

// ---------------------------------------------------------------- 1 COVER
let s = pres.addSlide(); base(s);
s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { color: BG } });
// glow blocks
s.addShape("ellipse", { x: 7.2, y: -1.6, w: 4.5, h: 3.2, fill: { color: BLAZE, transparency: 82 }, line: { type: "none" } });
s.addShape("ellipse", { x: -1.8, y: 4.3, w: 4.2, h: 2.8, fill: { color: VOLT, transparency: 88 }, line: { type: "none" } });
s.addText("TN ELITE SUMMER LEAGUE  ·  SPONSORSHIP OPPORTUNITIES  ·  SUMMER 2027", {
  x: 0.6, y: 0.55, w: 8.8, h: 0.32, fontFace: HEAD, fontSize: 10.5, bold: true, color: VOLT, charSpacing: 3, margin: 0 });
s.addText([
  { text: "REAL TEAMS.", options: { color: TXT, breakLine: true } },
  { text: "REAL DRAFT.", options: { color: TXT, breakLine: true } },
  { text: "REAL STAKES.", options: { color: BLAZE } },
], { x: 0.6, y: 1.15, w: 8.8, h: 2.7, fontFace: HEAD, fontSize: 54, bold: true, lineSpacing: 58, margin: 0 });
s.addText("The elite high-school summer basketball league built like a pro property.\nCombine. Draft. Two seasons. Nationals. Hosted at Belmont University, Nashville.", {
  x: 0.6, y: 4.15, w: 7.6, h: 0.9, fontFace: BODY, fontSize: 13, color: MUT, lineSpacing: 19, margin: 0 });
s.addNotes("Cover. Working league name — final brand TBD.");

// ---------------------------------------------------------------- 2 THE PROBLEM
s = pres.addSlide(); base(s);
kicker(s, "The Opening", 0.6, 0.5, 5);
title(s, "Families Are Done With AAU Chaos.", 0.6, 0.85, 8.8, 30);
const probs = [
  ["$3,000–$5,000", "for one AAU summer — before travel. Pay-to-play with no guarantees."],
  ["5 games a day", "in silent gyms. No development, no stakes, no story."],
  ["Zero structure", "No draft, no standings that matter, no production, no accountability."],
];
probs.forEach((p, i) => {
  const x = 0.6 + i * 3.0;
  card(s, x, 1.8, 2.8, 1.9);
  s.addText(p[0], { x: x + 0.2, y: 2.0, w: 2.4, h: 0.55, fontFace: HEAD, fontSize: 19, bold: true, color: BLAZE, margin: 0 });
  s.addText(p[1], { x: x + 0.2, y: 2.6, w: 2.4, h: 1.0, fontFace: BODY, fontSize: 11, color: MUT, lineSpacing: 15, margin: 0 });
});
card(s, 0.6, 4.0, 8.8, 1.1, PANEL2);
s.addText([
  { text: "The opening: ", options: { bold: true, color: VOLT } },
  { text: "parents are actively looking for the legit alternative. The first property that feels college/pro level owns the market — and the sponsors who join first own the story.", options: { color: TXT } },
], { x: 0.85, y: 4.18, w: 8.3, h: 0.75, fontFace: BODY, fontSize: 12.5, lineSpacing: 17, margin: 0 });

// ---------------------------------------------------------------- 3 THE LEAGUE
s = pres.addSlide(); base(s);
kicker(s, "The Product", 0.6, 0.5, 5);
title(s, "A League That Feels Like The Pros", 0.6, 0.85, 8.8, 30);
const stats = [
  ["16", "TEAMS — 8 BOYS / 8 GIRLS"],
  ["192", "DRAFTED PLAYERS"],
  ["156+", "GAMES — ALL STREAMED"],
  ["2×5", "WEEK SEASONS"],
  ["5,085", "SEAT ARENA AT BELMONT"],
];
stats.forEach((p, i) => {
  const x = 0.6 + i * 1.8;
  s.addText(p[0], { x, y: 1.75, w: 1.65, h: 0.6, fontFace: HEAD, fontSize: 30, bold: true, color: i === 2 ? BLAZE : TXT, margin: 0 });
  s.addText(p[1], { x, y: 2.35, w: 1.65, h: 0.5, fontFace: HEAD, fontSize: 7.5, bold: true, color: DIM, charSpacing: 1.5, margin: 0 });
});
const steps = [
  ["01 · TRYOUTS", "Statewide, ~600 athletes. Every region of Tennessee."],
  ["02 · COMBINE", "Top 300. Testing, measurements, media day — every station brandable."],
  ["03 · DRAFT NIGHT", "Produced, live-streamed, in the arena. The most clippable night of the year."],
  ["04 · SEASONS + NATIONALS", "Two 5-week seasons with playoffs; a 10-day national invitational (Yr 2–3)."],
];
steps.forEach((p, i) => {
  const x = 0.6 + i * 2.28;
  card(s, x, 3.0, 2.12, 2.05);
  s.addText(p[0], { x: x + 0.16, y: 3.2, w: 1.8, h: 0.3, fontFace: HEAD, fontSize: 10.5, bold: true, color: VOLT, margin: 0 });
  s.addText(p[1], { x: x + 0.16, y: 3.55, w: 1.8, h: 1.35, fontFace: BODY, fontSize: 10.5, color: MUT, lineSpacing: 14, margin: 0 });
});

// ---------------------------------------------------------------- 4 PROOF
s = pres.addSlide(); base(s);
kicker(s, "The Proof", 0.6, 0.5, 5);
title(s, "This Model Already Works", 0.6, 0.85, 8.8, 30);
card(s, 0.6, 1.75, 4.3, 3.3);
s.addText("UNRIVALED", { x: 0.85, y: 1.95, w: 3.8, h: 0.35, fontFace: HEAD, fontSize: 15, bold: true, color: BLAZE, margin: 0 });
s.addText("3v3 women's pro league — our brand inspiration", { x: 0.85, y: 2.3, w: 3.8, h: 0.3, fontFace: BODY, fontSize: 10, italic: true, color: DIM, margin: 0 });
s.addText([
  { text: "$35M raised before its first game", options: { bullet: true, breakLine: true } },
  { text: "$95M → $340M valuation in ~18 months", options: { bullet: true, breakLine: true } },
  { text: "~$27–30M revenue season one — near break-even", options: { bullet: true, breakLine: true } },
  { text: "~$100M/6yr TNT media deal", options: { bullet: true, breakLine: true } },
  { text: "14+ sponsors: Ally, Samsung, Under Armour, State Farm, Sephora, Wilson, Miller Lite…", options: { bullet: true } },
], { x: 0.85, y: 2.7, w: 3.85, h: 2.2, fontFace: BODY, fontSize: 11, color: TXT, paraSpaceAfter: 6, margin: 0 });
card(s, 5.1, 1.75, 4.3, 3.3);
s.addText("OVERTIME ELITE", { x: 5.35, y: 1.95, w: 3.8, h: 0.35, fontFace: HEAD, fontSize: 15, bold: true, color: ICE, margin: 0 });
s.addText("HS-age league built as a content engine", { x: 5.35, y: 2.3, w: 3.8, h: 0.3, fontFace: BODY, fontSize: 10, italic: true, color: DIM, margin: 0 });
s.addText([
  { text: "$250M+ raised (Bezos, Drake, KD, Liberty Media)", options: { bullet: true, breakLine: true } },
  { text: "Gatorade & State Farm multi-year, multimillion deals", options: { bullet: true, breakLine: true } },
  { text: "Amazon Prime Video global rights + docuseries", options: { bullet: true, breakLine: true } },
  { text: "23M views on opening weekend", options: { bullet: true, breakLine: true } },
  { text: "4 NBA lottery picks produced in 3 years", options: { bullet: true } },
], { x: 5.35, y: 2.7, w: 3.85, h: 2.2, fontFace: BODY, fontSize: 11, color: TXT, paraSpaceAfter: 6, margin: 0 });
s.addText("Nobody has built this at the state level. Tennessee goes first.", {
  x: 0.6, y: 5.15, w: 8.8, h: 0.35, fontFace: HEAD, fontSize: 12.5, bold: true, color: VOLT, margin: 0 });

// ---------------------------------------------------------------- 5 AUDIENCE
s = pres.addSlide(); base(s);
kicker(s, "Who You Reach", 0.6, 0.5, 5);
title(s, "The Audience Money Can't Usually Buy", 0.6, 0.85, 8.8, 30);
const aud = [
  ["192 elite athletes", "The most-followed teenagers in their towns — and TSSAA allows direct sponsor-to-player NIL deals."],
  ["Thousands of families", "Parents of teens: peak spending years — autos, insurance, healthcare, tutoring, food."],
  ["Every game streamed", "Season-long impressions, not one-night signage. Highlights clipped and shared all summer."],
  ["College coaches courtside", "Marquee weekends aligned to NCAA live periods put D-I staffs in the building."],
  ["Statewide footprint", "Tryouts in every region make this Tennessee's league, not just Nashville's."],
  ["Earned media", "Draft night, combine, a girls' league equal to the boys' — stories local press wants to cover."],
];
aud.forEach((p, i) => {
  const x = 0.6 + (i % 3) * 3.0, y = 1.8 + Math.floor(i / 3) * 1.75;
  card(s, x, y, 2.8, 1.6);
  s.addText(p[0], { x: x + 0.18, y: y + 0.16, w: 2.45, h: 0.32, fontFace: HEAD, fontSize: 12, bold: true, color: TXT, margin: 0 });
  s.addText(p[1], { x: x + 0.18, y: y + 0.52, w: 2.45, h: 1.0, fontFace: BODY, fontSize: 9.5, color: MUT, lineSpacing: 13, margin: 0 });
});

// ---------------------------------------------------------------- 5b BROADCAST STAGE
s = pres.addSlide(); base(s);
kicker(s, "The Stage", 0.6, 0.5, 5);
title(s, "Real Cameras. Real Crews. Real Refs.", 0.6, 0.85, 8.8, 28);
const stage = [
  ["BROADCAST CAMERAS — NO SHORTCUTS", "Manned broadcast cameras on every marquee night — via Belmont's in-house ESPN-platform production infrastructure, Nashville's deep freelance broadcast bench, and school media-program partnerships (MTSU, Curb College).", BLAZE],
  ["COLLEGE OFFICIATING (D2)", "The #1 AAU complaint is the refs — so ours are college crews, recruited through college officiating coordinators. Players learn the college whistle before campus; parents feel it in the first quarter.", VOLT],
  ["THE DISTRIBUTION LADDER", "Year 1: league YouTube + TikTok engine and a paid league pass. Year 2: local TV Game of the Week. Year 2-3: ESPN+ through packagers (Paragon has curated ESPN's HS slate since 2002) — the road there is star recruits + a broadcast-grade feed.", ICE],
  ["BIG-STAGE FEEL, EVERY NIGHT", "Walkout tunnel intros, per-team hype videos, DJ + PA, live stat overlays, press-conference backdrop. Cheap to run — reads pro in every clip. And clips are the product.", TXT],
];
stage.forEach((p, i) => {
  const x = 0.6 + (i % 2) * 4.5, y = 1.7 + Math.floor(i / 2) * 1.75;
  card(s, x, y, 4.3, 1.6, i === 0 ? PANEL2 : PANEL);
  s.addText(p[0], { x: x + 0.2, y: y + 0.14, w: 3.9, h: 0.3, fontFace: HEAD, fontSize: 10.5, bold: true, color: p[2], charSpacing: 1, margin: 0 });
  s.addText(p[1], { x: x + 0.2, y: y + 0.48, w: 3.9, h: 1.05, fontFace: BODY, fontSize: 9.5, color: MUT, lineSpacing: 13, margin: 0 });
});
s.addText("Every game streamed. 16 marquee nights with full broadcast treatment in Year 1 — 60+ in the Full Vision.", {
  x: 0.6, y: 5.2, w: 8.8, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VOLT, margin: 0 });

// ---------------------------------------------------------------- 6 TIERS
s = pres.addSlide(); base(s);
kicker(s, "Partnership Tiers", 0.6, 0.5, 5);
title(s, "Four Ways In", 0.6, 0.85, 8.8, 30);
const tiers = [
  ["TITLE PARTNER", "$50–75K", "1 available", "Your name in the league's name. Center court, every jersey patchline, every broadcast, every post. Category exclusivity everywhere.", BLAZE],
  ["FOUNDING PARTNER", "$20–30K", "4–6 available", "“Founding Partner — est. 2027” forever. Category exclusivity, first-refusal renewal rights, premium inventory across venue + broadcast.", VOLT],
  ["OFFICIAL PARTNER", "$5–15K", "8–10 available", "Official category status (bank, health, auto, QSR, drink…), court + stream presence, activation nights.", ICE],
  ["GAME NIGHT PARTNER", "$1–5K", "flexible", "Owned moments: door/gate branding, halftime contests, t-shirt toss, play-of-the-night segments, theme nights.", MUT],
];
tiers.forEach((t, i) => {
  const x = 0.6 + i * 2.28;
  card(s, x, 1.75, 2.12, 3.35, i === 0 ? PANEL2 : PANEL);
  s.addText(t[0], { x: x + 0.16, y: 1.95, w: 1.8, h: 0.5, fontFace: HEAD, fontSize: 11.5, bold: true, color: t[4], margin: 0 });
  s.addText(t[1], { x: x + 0.16, y: 2.5, w: 1.8, h: 0.45, fontFace: HEAD, fontSize: 20, bold: true, color: TXT, margin: 0 });
  s.addText(t[2].toUpperCase(), { x: x + 0.16, y: 2.98, w: 1.8, h: 0.26, fontFace: HEAD, fontSize: 8, bold: true, color: DIM, charSpacing: 1.5, margin: 0 });
  s.addText(t[3], { x: x + 0.16, y: 3.32, w: 1.8, h: 1.6, fontFace: BODY, fontSize: 9.5, color: MUT, lineSpacing: 13, margin: 0 });
});
s.addText("Every tier includes streamed-game impressions, social content, and a community story — partnerships, not logo slaps.", {
  x: 0.6, y: 5.2, w: 8.8, h: 0.3, fontFace: BODY, fontSize: 10.5, italic: true, color: DIM, margin: 0 });

// ---------------------------------------------------------------- 6b OWN A FRANCHISE
s = pres.addSlide(); base(s);
s.addShape("ellipse", { x: 7.4, y: -1.4, w: 4.2, h: 3.0, fill: { color: BLAZE, transparency: 84 }, line: { type: "none" } });
kicker(s, "The Premium Play", 0.6, 0.5, 5);
title(s, "Own A Franchise", 0.6, 0.85, 8.8, 30);
s.addText("16 founding ownerships. One per team. Never available again at this price.", {
  x: 0.6, y: 1.5, w: 8.2, h: 0.35, fontFace: BODY, fontSize: 12.5, italic: true, color: MUT, margin: 0 });
card(s, 0.6, 2.05, 2.7, 3.0, PANEL2);
s.addText("$15–25K", { x: 0.8, y: 2.35, w: 2.3, h: 0.6, fontFace: HEAD, fontSize: 26, bold: true, color: BLAZE, margin: 0 });
s.addText("FOUNDING TEAM OWNER", { x: 0.8, y: 2.95, w: 2.3, h: 0.3, fontFace: HEAD, fontSize: 9.5, bold: true, color: DIM, charSpacing: 1.5, margin: 0 });
s.addText("One brand, two teams — your franchise fields both a boys and a girls squad. The Big3 / TBT model, brought to Tennessee.", {
  x: 0.8, y: 3.35, w: 2.3, h: 1.5, fontFace: BODY, fontSize: 10, color: MUT, lineSpacing: 14, margin: 0 });
const perks = [
  ["Naming input", "Help name and brand your franchise — your business woven into the identity."],
  ["Courtside hospitality", "Owner seats + suite access on marquee nights, for you and your clients."],
  ["Merch revenue share", "A cut of your franchise's jersey and merch sales, every season."],
  ["Founders wall + legacy", "“Founding Owner — est. 2027” permanently in the arena and on every team page."],
  ["Draft night on the floor", "You're on camera when your team makes its picks."],
  ["First refusal, forever", "If franchises ever become true equity, founding owners get the first call."],
];
perks.forEach((p, i) => {
  const x = 3.55 + (i % 2) * 2.95, y = 2.05 + Math.floor(i / 2) * 1.02;
  card(s, x, y, 2.8, 0.9);
  s.addText(p[0], { x: x + 0.16, y: y + 0.1, w: 2.5, h: 0.26, fontFace: HEAD, fontSize: 10.5, bold: true, color: VOLT, margin: 0 });
  s.addText(p[1], { x: x + 0.16, y: y + 0.38, w: 2.5, h: 0.48, fontFace: BODY, fontSize: 8.5, color: MUT, lineSpacing: 11.5, margin: 0 });
});
s.addText("Owners recruit each other — nobody wants to be the one without a team.", {
  x: 0.6, y: 5.2, w: 8.8, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: BLAZE, margin: 0 });

// ---------------------------------------------------------------- 7 WHAT YOU CAN OWN
s = pres.addSlide(); base(s);
kicker(s, "The Inventory", 0.6, 0.5, 5);
title(s, "What You Can Own", 0.6, 0.85, 8.8, 30);
const inv = [
  ["ON THE PLAYER", "Jersey front & back patches · warm-ups · gear bags · official ball · shoes & socks"],
  ["IN THE VENUE", "Court decals · scorer's table · entry gates & doors · ticket-backs · suites · seat-backs"],
  ["ON THE STREAM", "Presenting sponsor · 30-sec spots · replay & stats graphics · “Play of the Night by ___”"],
  ["TENTPOLE EVENTS", "Combine title & testing stations · Draft Night + green room · Media Day · Awards · All-Star night"],
  ["IN THE CONTENT", "Mic'd-up series · all-access doc · podcast · fantasy pick'em · player NIL collabs"],
  ["IN THE COMMUNITY", "Scholarship fund · team meals · recovery lounge · youth clinics · theme nights · host hotel"],
];
inv.forEach((p, i) => {
  const x = 0.6 + (i % 2) * 4.5, y = 1.75 + Math.floor(i / 2) * 1.18;
  card(s, x, y, 4.3, 1.03);
  s.addText(p[0], { x: x + 0.2, y: y + 0.12, w: 3.9, h: 0.28, fontFace: HEAD, fontSize: 10.5, bold: true, color: VOLT, charSpacing: 2, margin: 0 });
  s.addText(p[1], { x: x + 0.2, y: y + 0.44, w: 3.9, h: 0.5, fontFace: BODY, fontSize: 10, color: TXT, lineSpacing: 13, margin: 0 });
});
s.addText("60+ sellable assets. Category exclusivity available on every one.", {
  x: 0.6, y: 5.25, w: 8.8, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: BLAZE, margin: 0 });

// ---------------------------------------------------------------- 8 ACTIVATION EXAMPLES
s = pres.addSlide(); base(s);
kicker(s, "Built-In Activation", 0.6, 0.5, 6);
title(s, "Partnerships, Not Logo Slaps", 0.6, 0.85, 8.8, 30);
const act = [
  ["“Play of the Night by ___”", "A branded recurring broadcast segment — the exact model Samsung ran with Unrivaled's “Galaxy Game Winner.” Your brand inside the moment fans rewatch."],
  ["“Vertical Jump powered by ___”", "Combine testing stations carry your brand in every measurement graphic — numbers that get quoted in recruiting posts all year."],
  ["The Scholarship Story", "Your dollars visibly waive player fees for families in need. 501(c)(3) deductible — and it's the side of the anti-pay-to-play story parents already agree with."],
  ["Draft Night Green Room", "Your brand behind every hug, hat, and handshake — the most-shared images of the entire summer."],
];
act.forEach((p, i) => {
  const x = 0.6 + (i % 2) * 4.5, y = 1.75 + Math.floor(i / 2) * 1.7;
  card(s, x, y, 4.3, 1.55, i === 0 ? PANEL2 : PANEL);
  s.addText(p[0], { x: x + 0.2, y: y + 0.15, w: 3.9, h: 0.32, fontFace: HEAD, fontSize: 12.5, bold: true, color: TXT, margin: 0 });
  s.addText(p[1], { x: x + 0.2, y: y + 0.52, w: 3.9, h: 0.95, fontFace: BODY, fontSize: 10, color: MUT, lineSpacing: 14, margin: 0 });
});

// ---------------------------------------------------------------- 9 LEGITIMACY
s = pres.addSlide(); base(s);
kicker(s, "Why It's Safe To Attach Your Brand", 0.6, 0.5, 6);
title(s, "Legit, By Design", 0.6, 0.85, 8.8, 30);
const legit = [
  ["Fully independent", "Outside all school programs — the same lane AAU operates in, run at a far higher standard. No coach is ever paired with players from their own school."],
  ["NCAA-certified events", "Certified so D-I coaches can attend live-period weekends: registered athletes, licensed coaches, background checks on every adult."],
  ["Pro-level safety", "Certified athletic trainers at every event day. College-level (D2) officiating crews — not AAU refs. $1M/$2M liability coverage."],
  ["Mission with receipts", "~$400 all-in for a player's whole summer vs $3,000+ AAU — and a scholarship fund that takes it to $0 for families who need it."],
];
legit.forEach((p, i) => {
  const x = 0.6 + (i % 2) * 4.5, y = 1.75 + Math.floor(i / 2) * 1.7;
  card(s, x, y, 4.3, 1.55);
  s.addText(p[0], { x: x + 0.2, y: y + 0.15, w: 3.9, h: 0.32, fontFace: HEAD, fontSize: 12.5, bold: true, color: ICE, margin: 0 });
  s.addText(p[1], { x: x + 0.2, y: y + 0.52, w: 3.9, h: 0.95, fontFace: BODY, fontSize: 10, color: MUT, lineSpacing: 14, margin: 0 });
});

// ---------------------------------------------------------------- 10 TIMELINE
s = pres.addSlide(); base(s);
kicker(s, "The Road To Tip-Off", 0.6, 0.5, 5);
title(s, "Founding Partners Lock In Now", 0.6, 0.85, 8.8, 30);
const tl = [
  ["FALL 2026", "Brand launch + hype video. Founding partners announced with the league itself — maximum earned media."],
  ["WINTER 2026–27", "Coaches signed. Tryout registration opens statewide. Partner content begins."],
  ["SPRING 2027", "Tryouts → Combine → Draft Night at the arena. Partner brands in every frame."],
  ["JUN 1, 2027", "First tip at Belmont. Two seasons, playoffs, every game streamed."],
];
tl.forEach((p, i) => {
  const x = 0.6 + i * 2.28;
  s.addShape("ellipse", { x: x, y: 1.95, w: 0.34, h: 0.34, fill: { color: BLAZE }, line: { type: "none" } });
  if (i < 3) s.addShape("line", { x: x + 0.42, y: 2.12, w: 1.78, h: 0, line: { color: LINE, width: 1.5 } });
  s.addText(p[0], { x, y: 2.5, w: 2.1, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VOLT, margin: 0 });
  s.addText(p[1], { x, y: 2.85, w: 2.05, h: 1.5, fontFace: BODY, fontSize: 10, color: MUT, lineSpacing: 14, margin: 0 });
});
card(s, 0.6, 4.45, 8.8, 0.75, PANEL2);
s.addText([
  { text: "Founding-era pricing ends at brand launch. ", options: { bold: true, color: TXT } },
  { text: "After Fall 2026, every tier reprices against real audience numbers.", options: { color: MUT } },
], { x: 0.85, y: 4.62, w: 8.3, h: 0.45, fontFace: BODY, fontSize: 12, margin: 0 });

// ---------------------------------------------------------------- 11 CLOSE
s = pres.addSlide(); base(s);
s.addShape("ellipse", { x: 6.8, y: 3.6, w: 4.6, h: 3.4, fill: { color: BLAZE, transparency: 82 }, line: { type: "none" } });
s.addText("BE A FOUNDING PARTNER", { x: 0.6, y: 0.9, w: 8.8, h: 0.35, fontFace: HEAD, fontSize: 11, bold: true, color: VOLT, charSpacing: 4, margin: 0 });
s.addText([
  { text: "Own the story", options: { color: TXT, breakLine: true } },
  { text: "from day one.", options: { color: BLAZE } },
], { x: 0.6, y: 1.35, w: 8.8, h: 1.9, fontFace: HEAD, fontSize: 46, bold: true, lineSpacing: 52, margin: 0 });
s.addText("Every league that made it — Unrivaled, OTE, TBT — was built with partners who got in before the first game. This is that moment for Tennessee.", {
  x: 0.6, y: 3.4, w: 7.2, h: 0.8, fontFace: BODY, fontSize: 13, color: MUT, lineSpacing: 19, margin: 0 });
s.addText("Diamond House Media  ·  diamondhousemediaco@gmail.com  ·  Nashville, TN", {
  x: 0.6, y: 4.7, w: 8.8, h: 0.35, fontFace: HEAD, fontSize: 12, bold: true, color: TXT, margin: 0 });

pres.writeFile({ fileName: "/home/claude/thsl/TESL_Sponsor_Deck.pptx" }).then(() => console.log("written"));
