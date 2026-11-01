# Showcase — 20 concept websites

Twenty standalone, award-level concept sites across different industries, plus a catalog page
(`index.html`, built separately) that links to each one. Every brand is **fictional**.
The bar is "would this get Site of the Day on Awwwards": confident art direction, smooth
purposeful motion, scroll storytelling, and at least one interaction people want to play with.

## Hard constraints

- One self-contained file per site: `sites/<NN-slug>/index.html` (inline CSS + JS). Opens via `file://`, no build step.
- External scripts only from these verified URLs (use what you need):
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js` (free since 3.13)
  - `https://unpkg.com/lenis@1.3.4/dist/lenis.min.js` (smooth scroll — then **set `window.lenis = lenis`**, the QA tool needs it)
  - `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (only if a site truly needs 3D)
- Fonts: Google Fonts only. Pick a distinctive pairing per site — never default to Inter for everything.
- Imagery: prefer CSS / SVG / canvas art you draw yourself (gradients, shapes, generative art, illustrated products). If a site genuinely needs photos, use `https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=1600&q=80` and **verify every URL returns 200 with `curl -s -o /dev/null -w '%{http_code}'`** before using it. Always give photos meaningful `alt`.
- Fictional brands only: no real company names, logos or trademarks; no real people. Testimonials/team members use clearly invented names. Put a small footer line: "Concept design — fictional brand."
- English copy, written like a real brand would write it (specific, confident, not lorem ipsum).
- Each site gets a different `<title>` and a small inline SVG favicon (`<link rel="icon" href="data:image/svg+xml,...">`).

## Quality checklist (every site)

1. **Hero with an intro sequence** (staggered reveals, kinetic headline, or a drawn/animated visual) — first impression in < 1.5s.
2. **At least one pinned / scroll-driven storytelling section** (scrub something continuous: a 3D-ish transform, a path drawing, a colour shift, a horizontal track…).
3. **One signature interactive widget** (listed per site below) that actually works.
4. 5–8 sections total, each with its own layout — avoid a stack of identical card rows.
5. Micro-interactions: hover states, magnetic/elastic buttons, cursor effects where it fits.
6. **Responsive**: looks designed at 390px wide, no horizontal page scroll, readable type (body ≥ 16px), tap targets ≥ 44px. Add a mobile menu if the nav collapses.
7. **Accessibility**: real `<button>`/`<a>`, visible focus, text contrast ≥ 4.5:1, `alt` on images, `aria-hidden` on decorative art, honour `prefers-reduced-motion` (skip intros/parallax, keep content visible and usable).
8. Performance: no huge assets; pause canvas/raf loops when off-screen (IntersectionObserver); cap DPR at 2.

## Lessons already learned (do not repeat these bugs)

- **Never scrub discrete content swaps.** If text/cards change per scroll step, let scroll pick the *active index* and play the swap on the clock (time-based tween that always completes). Scrubbing text straight from scroll position freezes it half-masked when the reader stops mid-transition. Scrub only continuous things (rotations, progress bars, colour, parallax, path drawing).
- Set initial hidden states with `gsap.set` **before** creating ScrollTriggers; prefer `toggleActions: 'play none none none'` (or `once: true`) for reveals so content never ends up stuck hidden.
- `gsap.matchMedia().add({a, b}, fn)` only runs `fn` when at least one condition matches — include a reduced-motion condition too, or handle reduced motion separately.
- Masked line reveals (`overflow:hidden` wrappers) clip accents/descenders — give the mask ~0.1em padding.
- Don't animate `width/height/top/left` for motion; use transforms and opacity.

## More lessons from batch 1 (sites 01–20)

- `tools/shoot.cjs` has been fixed: it now takes plain viewport screenshots (no clip, so fixed
  navs/backdrops and pinned sections render correctly) and always includes the page bottom.
  Its overflow number now compares against the requested width (390 / 1440), so trust it.
- `gsap.killTweensOf(array)` does **not** kill a delayed tween that targets only part of that
  array — keep references to tweens you may need to interrupt and call `.kill()` on them.
- Never hard-code a future date (countdowns, booking calendars, "closes Friday"): compute it
  relative to `new Date()` so the concept never goes stale.
- If the nav collapses on mobile, ship a working mobile menu (focus moves in, Esc closes).
- Pinned horizontal tracks often look empty on phones — consider a native swipe carousel below 768px.
- Unique ids, always: when a marquee duplicates its HTML (`html + html`) or the same inline SVG
  is rendered twice, any `id` inside (clipPath, gradient, mask) gets duplicated. Generate each
  copy separately with its own id prefix. `tools/deep.cjs` reports duplicates.
- Never put `transform` in a CSS `transition` on an element GSAP also moves (buttons, cells,
  off-canvas panels): the two fight and the element freezes part-way (seen on qt-01-nhip-admin: nav buttons
  stuck 10px high, heatmap cells stuck at scale 0). Use the separate `scale`/`translate` CSS
  properties for hover/active effects, and `clearProps` on intro tweens of CSS-positioned elements.

## QA you must run (headless Chrome — the in-app browser pane can't run animations here)

From `D:/project/personal/showcase-sites`:

```
node tools/shoot.cjs <NN-slug> desktop 1
node tools/shoot.cjs <NN-slug> mobile 1
node tools/shoot.cjs <NN-slug> desktop 1.5 --reduced
node tools/sheet.cjs <NN-slug> desktop
node tools/sheet.cjs <NN-slug> mobile
node tools/smoke.cjs <NN-slug> desktop   # fills inputs, clicks every button, reports JS errors
```

`shoot` prints console errors, failed requests, HTTP ≥ 400 and horizontal overflow. **Open the
contact sheets with the Read tool and actually look at them.** Fix anything broken, ugly,
overlapping, cut off, or stuck mid-animation, then re-shoot. Iterate until it looks great on
both desktop and mobile with a clean console and 0px overflow.

Shell notes (Windows, Git Bash): write files with the Write tool, not heredocs (heredocs here
truncate on `#`/backticks). Never `rm -rf`; delete specific files only.

## The 20 sites

| # | Folder | Brand | Sector | Art direction | Signature interaction |
|---|---|---|---|---|---|
| 01 | `01-nimbus` | Nimbus | AI notes app | Soft aurora gradients, glassmorphism 2.0, airy light-on-dark | Canvas particle "thought orb" that reacts to cursor + a chat demo that types answers grounded in sample notes |
| 02 | `02-synapse` | Synapse Studio | AI image generation | Pitch black, neon, kinetic oversized type, gallery wall | Prompt box → generates a unique generative SVG/canvas artwork seeded from the prompt text |
| 03 | `03-voxa` | Voxa | AI voice agent for support teams | Deep violet, audio-reactive waveforms, rounded futurism | Live waveform "call" demo with streaming transcript, sentiment meter and handoff button |
| 04 | `04-orbit` | Orbit | AI code review for dev teams | Terminal brutalism: monospace, 1px borders, zero radius, ASCII accents | Animated pull-request diff where the AI leaves review comments; user can accept/dismiss them |
| 05 | `05-ledgerly` | Ledgerly | AI personal finance | Light cream + forest green, editorial bento grid, Swiss calm | Savings/goal calculator with an animated growth chart and draggable sliders |
| 06 | `06-linh-tran` | Linh Tran | Photographer (personal brand) | Editorial black & white, huge serif, image mask reveals | Horizontal pinned gallery + click-to-open lightbox with keyboard nav |
| 07 | `07-kai` | Kai Nakamura | Creative developer (personal brand) | Playful, flow-field / noise canvas, bold colour | Project list with hover-following image previews + cursor-reactive background |
| 08 | `08-mai` | Mai | Yoga & wellness coach | Pastel, organic morphing blobs, rounded type, slow motion | Guided breathing circle (inhale/hold/exhale timer) + class schedule booking |
| 09 | `09-sora` | Sora Studio | Illustrator / designer | Anti-grid brutalism with loud colour, stickers, collage | Draggable sticker canvas (pointer + touch) visitors can rearrange |
| 10 | `10-meridian` | Meridian Freight | Global logistics | Navy/ice blue, data-viz, world map with animated routes | Shipment tracker: enter a code (sample codes given) → animated route + status timeline |
| 11 | `11-atlas` | Atlas Robotics | Industrial robotics | Dark graphite + safety orange, technical HUD, CSS 3D | Scroll-driven robot arm that assembles/rotates in 3D; spec hotspots on hover |
| 12 | `12-verdant` | Verdant Energy | Renewable energy | Sky that shifts dawn→noon→dusk as you scroll, warm greens | Rooftop solar estimator (roof size, sun hours → kWh, savings, CO₂) |
| 13 | `13-lumen` | Lumen Dental | Healthcare clinic | Calm mint/teal, soft light theme, generous whitespace | Multi-step appointment booking widget with validation and a summary |
| 14 | `14-halden` | Halden & Co. | Strategy consulting firm | Navy + gold, classic serif, restrained luxury | Interactive timeline of the firm + case-study filter with animated metrics |
| 15 | `15-brew-bloom` | Brew & Bloom | Specialty coffee shop | Warm terracotta & cream, illustrated, tactile | Drink configurator (bean, roast, milk, size) with an animated cup filling + cart drawer |
| 16 | `16-kicks-lab` | Kicks Lab | Sneaker store | Loud brutalist street style, giant type, marquee | SVG sneaker colour customiser (sole, body, laces) + size picker |
| 17 | `17-maison-ivoire` | Maison Ivoire | Luxury jewellery | Ivory, black, gold leaf, slow elegant fades, high-contrast serif | Lookbook with zoom-on-hover detail lens + metal/stone selector |
| 18 | `18-verde-market` | Verde Market | Organic grocery delivery | Playful, bouncy, bright greens, illustrated produce | Add-to-cart with items flying into the basket + live delivery-slot picker |
| 19 | `19-nomad` | Nomad Stays | Travel & boutique stays | Layered parallax mountains, golden hour, cinematic | Destination explorer: pick a region → animated card deck + date/guest picker |
| 20 | `20-velo` | Velo | Premium e-bike | Dark studio product scrollytelling (Apple/Avera style) | Pinned SVG e-bike that assembles part by part as you scroll + colour switcher |

When a site is finished, also write `sites/<NN-slug>/meta.json`:
`{"title": "...", "sector": "...", "category": "AI | Personal brand | Company | Commerce | Landing", "tagline": "one line", "palette": ["#hex", "#hex", "#hex"], "fonts": ["...", "..."]}`
— the catalog page reads these.

## Batch 2 — sites 21–50

Same constraints, checklist, lessons and QA as above. These must look clearly different from
batch 1 *and* from each other — new layouts, type pairings, palettes and motion ideas.

| # | Folder | Brand | Sector | Art direction | Signature interaction |
|---|---|---|---|---|---|
| 21 | `21-prism` | Prism | AI brand-identity generator | Y2K chrome, iridescent gradients, liquid metal type | Type a brand word → generates a palette, type pairing and logo mark live |
| 22 | `22-tessera` | Tessera | AI analytics (ask your data) | Data-noir: near-black, thin grid, electric lime charts | Ask a question in plain English → the matching chart builds itself with an explanation |
| 23 | `23-lingo-loop` | Lingo Loop | AI language tutor | Friendly, chunky rounded shapes, bright primaries | Mini conversation lesson: pick replies, get instant feedback, XP bar + streak |
| 24 | `24-sentinel` | Sentinel | AI cybersecurity | Black + signal red, radar sweeps, HUD typography | Live threat radar: incoming attacks appear; click to block, AI auto-blocks with a log |
| 25 | `25-quill` | Quill Health | AI medical scribe for clinicians | Clinical white, calm blue, precise grid | Doctor–patient transcript streams in and becomes a structured visit note |
| 26 | `26-fable` | Fable | AI bedtime stories for kids | Storybook: paper texture, watercolour shapes, hand-drawn type | Pick hero + place + mood → a 4-page illustrated story with page-turn animation |
| 27 | `27-dara` | Dara Okafor | UX researcher & speaker | Swiss typographic grid, one red accent, strict rhythm | Research-method picker: answer 3 questions → recommended method with rationale |
| 28 | `28-theo` | Theo Marchetti | Chef / restaurant | Dark moody food, candlelit warm tones, elegant serif | Recipe card with a servings scaler (quantities update) + step timer |
| 29 | `29-aiko` | Aiko Mori | Electronic musician | Vinyl and analog gear, warm noise, rotating record | Playable synth keyboard (Web Audio API, starts only after a click) with a visualizer |
| 30 | `30-lena` | Lena Volk | Fitness trainer | Neon on black, condensed athletic type, high energy | Interval workout builder + running timer with rounds and rest |
| 31 | `31-hugo` | Hugo Lindqvist | Architect | Monochrome blueprint linework, minimal, lots of air | Floor-plan explorer: hover/tap rooms to see area, light and photos-as-drawings |
| 32 | `32-priya` | Priya Nair | Novelist | Literary cream paper, ink, drop caps, page margins | Read the first chapter with real page-turn + highlight-a-quote to "share" |
| 33 | `33-northstar` | Northstar Aerospace | Launch company | Deep space starfield, parallax, mission-control mono | Scroll-driven rocket launch with stage separation + a live countdown sequence |
| 34 | `34-tidewater` | Tidewater Institute | Ocean research | Underwater: colour darkens with a depth meter as you scroll | Depth explorer: creatures and facts appear at real depths; tap to inspect |
| 35 | `35-ironbark` | Ironbark Build | Construction firm | Raw concrete + hazard yellow, bold industrial grid | A building rises floor by floor on scroll + project cost estimator |
| 36 | `36-cobalt` | Cobalt | Neobank | Sleek fintech, glossy 3D card, cool blues | Card customiser (colour, finish, name) with 3D tilt + spending insights donut |
| 37 | `37-kinetic` | Kinetic | Creative agency | Maximalist: giant blend-mode cursor, clashing type, motion everywhere | Interactive project brief builder that assembles a proposal as you choose |
| 38 | `38-harbor` | Harbor Mutual | Home insurance | Trustworthy and warm, illustrated houses, soft navy | Quote calculator: coverage sliders change an illustrated house + monthly price |
| 39 | `39-evergreen` | Evergreen Academy | Online school | Cheerful academic, chalkboard green, doodles | Course-finder quiz with branching questions and a result card |
| 40 | `40-aurora-spa` | Aurora Hotel & Spa | Hospitality | Soft-focus luxury, mist gradients, slow fades | Room switcher (suite tour with day/night toggle) + availability picker |
| 41 | `41-petal-stem` | Petal & Stem | Florist | Botanical illustration, blush and sage | Bouquet builder: drag flowers into a vase, wrap colour, card message |
| 42 | `42-analog` | Analog Audio | Headphones | Matte black product studio, macro details | Sound-signature EQ: switch modes and watch a live frequency visualizer |
| 43 | `43-terra` | Terra Ceramics | Handmade ceramics | Earthy minimal, clay textures, generous whitespace | Drag-to-spin pot on a wheel + glaze picker |
| 44 | `44-pixel-arcade` | Pixel Arcade | Indie game shop | Pixel art, CRT scanlines, retro chiptune vibes | A small playable game (keyboard + touch) with a high-score table |
| 45 | `45-bloom` | Bloom Skin | Skincare | Dewy gradients, soft glass, clean sans | Skin quiz → personalised 3-step routine with product cards |
| 46 | `46-ridgeline` | Ridgeline Outdoor | Outdoor gear | Topographic contour lines, rugged earth tones | Pack planner: tick gear, live pack weight gauge and trip readiness |
| 47 | `47-noir` | Noir Parfums | Fragrance | Dark luxe smoke, glass and gold, slow reveals | Scent pyramid explorer: top/heart/base notes with animated layers |
| 48 | `48-tiny-paws` | Tiny Paws | Pet supplies subscription | Playful pastel, cartoon pet that reacts | Build-a-box: pick pet + size + treats, box fills, pet reacts |
| 49 | `49-volt` | Volt Motors | Electric car | Sleek automotive, studio lighting, wide type | Car configurator (paint, wheels, battery) with live range + price |
| 50 | `50-nook` | Nook Furniture | Scandinavian furniture | Light oak, airy, soft shadows | Mini room planner: drag furniture onto a floor plan (pointer + touch) |

## Batch 3 — sites 51–70 (twenty new fields)

Same constraints, checklist, lessons and QA as above. Every one of these is a field the first 50
sites don't cover, so the art direction must feel native to that field — and still clearly
different from all 50 existing sites (check their thumbnails in `thumbs/` before you start).

Extra QA for this batch, after `shoot` / `sheet` / `smoke` are clean:

    node tools/deep.cjs <NN-slug>

`deep` runs static checks (dead `#anchors`, missing `alt`, unnamed buttons, unlabelled inputs,
duplicate ids, lang/title/favicon), tablet (820px) overflow, and a scroll-consistency test: each
test position is reached once by scrolling down normally and once after random jumps, and the
visible text must match. Investigate every `missing[...]` it reports (open the saved screenshot
in `tools/shots/deep/`); `extra[...]` is usually a marquee or a self-running demo.

`meta.json` for this batch also needs a `"field"` key, one of: `Tech & Software`,
`Health & Wellness`, `Food & Drink`, `Fashion & Beauty`, `Home & Living`, `Travel & Leisure`,
`Finance & Property`, `Arts & Culture`, `Media & Entertainment`, `Sport & Outdoors`,
`Science & Industry`, `Education & Causes`, `Kids & Pets`.

| # | Folder | Brand | Sector | Category | Field | Art direction | Signature interaction |
|---|---|---|---|---|---|---|---|
| 51 | `51-haven` | Haven Residences | Apartment development (real estate) | Company | Finance & Property | Architectural pastel: sand, deep teal, isometric drawings, Bauhaus geometry | Isometric tower: pick a floor → available units with floor plan, sun hours, price; filter by bedrooms |
| 52 | `52-solstice` | Solstice Festival | Three-day music festival | Landing | Media & Entertainment | 70s psychedelic gig posters: warped type, sunset gradients, grain | Lineup timetable: tap sets to build "my festival", clash warnings, generated personal poster |
| 53 | `53-canopy` | Canopy | Reforestation non-profit | Company | Education & Causes | Layered paper-cut forest, deep greens, earnest editorial serif | Donation slider plants trees on an SVG hillside (trees, CO₂, jobs) + map of planting sites |
| 54 | `54-vela` | Vela Estate | Family winery | Commerce | Food & Drink | Mediterranean: wine-dark burgundy, chalk, painterly vine rows, didone type | Aroma wheel: pick notes on a radial wheel → matched wine, tasting card and food pairing |
| 55 | `55-lumiere` | Lumière Picture House | Independent cinema | Commerce | Media & Entertainment | Art-deco: velvet red, gold leaf, marquee bulbs, film grain | Showtimes + seat map: choose a screening, pick seats (wheelchair spaces, price total) |
| 56 | `56-rivermouth` | Rivermouth FC | Football club | Company | Sport & Outdoors | Matchday poster: halftone, club colours, heavy slab type, terrace energy | Tactics board: choose a formation, drag players on the pitch, flip squad cards |
| 57 | `57-vantage` | Vantage Museum | Natural history museum | Company | Arts & Culture | Archival: specimen labels, museum green + sepia, vitrine glass | Specimen explorer with zoom hotspots + a deep-time timeline scrubber |
| 58 | `58-ines-duarte` | Ines Duarte | Type designer | Personal brand | Arts & Culture | Type specimen sheet: giant glyphs, black/white + one ink colour | Live type tester on a Google variable font (weight/width/optical axes), editable text |
| 59 | `59-crumb` | Crumb & Co. | Bakery & patisserie | Commerce | Food & Drink | Buttery yellows, flour-dusted texture, hand lettering, soft and round | Cake builder: stack sponge layers, filling, frosting, toppings, piped message → price |
| 60 | `60-seve` | Atelier Sève | Fashion house | Commerce | Fashion & Beauty | Avant-garde editorial: stark white, oversized grotesk, runway cuts | Outfit mixer on an illustrated figure: swap outer/top/bottom, colourways, look number |
| 61 | `61-helix` | Helix Bio | Biotech (gene therapy) | Company | Science & Industry | Clinical white + bioluminescent cyan, cells and molecules (three.js) | Rotatable 3D molecule + clinical pipeline tracker with expandable programmes |
| 62 | `62-hearth` | Hearth | Smart home hub | Landing | Home & Living | Warm dusk house cutaway, lamplight glow, soft rounded UI | Interactive cutaway: toggle lights/heat/blinds per room, scenes (morning/away/night), live energy graph |
| 63 | `63-mara-quinn` | Mara Quinn | Podcast host & journalist | Personal brand | Media & Entertainment | Radio studio: on-air red light, waveforms, newsprint | Episode player (simulated playback, no audio files) with chapters, speed and a live-highlighted transcript |
| 64 | `64-the-current` | The Current | Independent news magazine | Company | Media & Entertainment | Broadsheet: newspaper columns, rules, data-viz scrollytelling | Scrollytelling climate chart + "your city" picker that redraws the story's numbers |
| 65 | `65-skylark` | Skylark Air | Boutique airline | Company | Travel & Leisure | 1960s jet-age modernism: sky blue, coral, swooping lines | Route map with animated flight arcs + cabin seat map picker |
| 66 | `66-stratus` | Stratus | AI weather forecasting | AI | Tech & Software | Generative atmospheric sky, glassy data overlays | 48-hour forecast scrubber: drag through time, sky/rain/clouds animate, AI explains the change |
| 67 | `67-rootline` | Rootline Farms | Vertical farming | Company | Science & Industry | Grow-light magenta + leaf green, clean agritech, stacked shelves | Grow-tower simulator: light/water/nutrient sliders → plants grow over simulated days, yield readout |
| 68 | `68-blocksmith` | Blocksmith | Toy brand | Commerce | Kids & Pets | Glossy primary-colour plastic, chunky blocks, bouncy physics | Build-a-robot from snap-together parts (head/body/legs/colours) — it dances when done |
| 69 | `69-kindred` | Kindred | Dating app | Landing | Tech & Software | Risograph pinks and reds, handwritten notes, warm and human | Swipeable profile-prompt card stack (pointer, touch and keyboard) with a match moment |
| 70 | `70-rook-calder` | Rook Calder | Tattoo artist | Personal brand | Arts & Culture | Traditional flash sheet: cream paper, bold black line, red and green ink | Pick a flash design → preview it on an illustrated forearm (size, placement), book a consult |

## Batch 4 — sites 71–100 (to reach a hundred)

Same constraints, checklist, lessons, QA (including `smoke` and `deep`) and `meta.json` format
(with `"field"`) as batch 3. Every site must look clearly different from all 70 existing ones —
open `thumbs/` and check before you settle on an art direction.
Batch 4 leans on Landing pages (only 4 so far): treat those as single-product launch pages with a
strong hero, a product demo, pricing or sign-up, and FAQ.

Site 100's folder has three digits (`100-mosaic`); the tools handle it.

| # | Folder | Brand | Sector | Category | Field | Art direction | Signature interaction |
|---|---|---|---|---|---|---|---|
| 71 | `71-drift` | Drift | Sleep & soundscape app | Landing | Health & Wellness | Nocturnal: deep indigo, a slow moon, soft grain, very calm motion | Soundscape mixer: rain / waves / fire / wind generated with Web Audio (only after a click), per-layer volume, sleep timer that fades out |
| 72 | `72-stride` | Stride | Running club app | Landing | Sport & Outdoors | Night track: asphalt black, lane lines, neon lime, motion-blur type | Pace calculator (distance + goal time → splits table) and a route that draws itself with a live runner dot |
| 73 | `73-tally` | Tally | Tax & receipts app for freelancers | Landing | Finance & Property | Paper receipts, thermal-print mono type, warm off-white, stamp red | Drag receipts into category trays; totals, deductible amount and a quarter summary update live (clearly illustrative) |
| 74 | `74-cadence` | Cadence | AI music mastering | AI | Media & Entertainment | Studio console: brushed metal, VU needles, warm amber lights | Pick a genre and loudness target; a generated Web Audio loop plays with A/B before/after, meters and a spectrum react |
| 75 | `75-wayfinder` | Wayfinder | AI travel planner | AI | Travel & Leisure | Paper map, postage stamps, handwritten route lines, sunny palette | Pick a city + days + interests → an itinerary appears on a stylised map; drag stops between days and the route redraws |
| 76 | `76-clause` | Clause | AI contract review | AI | Tech & Software | Legal paper, redline ink, precise serif + mono, calm blue accents | Pick a sample contract; risky clauses highlight one by one with plain-English notes and suggested rewrites you can accept |
| 77 | `77-sprout` | Sprout | Coding app for kids 6–10 | Landing | Kids & Pets | Bright, chunky, friendly mascot, rounded type, bouncy motion | Block-coding puzzle: drag move/turn/repeat blocks to guide a robot across a grid to a star (several levels) |
| 78 | `78-pulse` | Pulse Heart Clinic | Cardiology clinic | Company | Health & Wellness | Clinical warm white, deep red ECG line, reassuring editorial type | Heart-rate zone explorer: age + resting rate → zones on an animated ECG; plus an appointment slot picker (state clearly: not medical advice) |
| 79 | `79-noor-haddad` | Noor Haddad | Interior designer | Personal brand | Home & Living | Warm plaster, arches, terracotta and olive, editorial serif | Moodboard: drag fabric, paint and material swatches onto a room illustration; the room recolours and a palette card builds |
| 80 | `80-felix-wren` | Felix Wren | Film director & cinematographer | Personal brand | Media & Entertainment | Letterboxed frames, film-strip edges, cinematic colour grades | Colour-grading desk: a generated scene with a before/after split, grade presets and lift/gamma/gain wheels |
| 81 | `81-amara-cole` | Amara Cole | Polar explorer & speaker | Personal brand | Sport & Outdoors | Arctic white and ice blue, wind-blown type, expedition log feel | 60-day expedition scrubber: drag through days; route, temperature, sledge weight and journal entry change |
| 82 | `82-jules-moreau` | Jules Moreau | Industrial designer | Personal brand | Home & Living | Product studio, technical callouts, soft shadows, neutral greys + one orange | Exploded-view viewer: a lamp pulls apart into labelled parts on scroll and on a slider; tap parts for materials |
| 83 | `83-dex-marlowe` | Dex Marlowe | Stand-up comedian | Personal brand | Media & Entertainment | Brick wall, single spotlight, marquee letters, punchy condensed type | Build a set: drag bits into a running order; a timer and laugh-meter curve update; tour dates computed from today |
| 84 | `84-lucia-reyes` | Lucía Reyes | Cellist & composer | Personal brand | Arts & Culture | Concert hall: black and gold, flowing staff lines, elegant serif | Playable score: tap phrases on a drawn staff to hear them (Web Audio, after a click), tempo control, highlighted notes |
| 85 | `85-coastline-rail` | Coastline Rail | High-speed rail operator | Company | Travel & Leisure | Swiss-style timetable grid, signal red, precise sans | Journey planner with a split-flap departures board; pick stations, see times, seats and a route line along the coast |
| 86 | `86-forge-silicon` | Forge Silicon | Chip designer | Company | Science & Industry | Wafer macro in iridescent foil, circuit traces, dark lab | Die-shot explorer: zoom into a drawn chip, hover blocks (cores, cache, I/O) for specs; scroll shows a wafer being diced |
| 87 | `87-hollow-pine` | Hollow Pine | Summer camp | Company | Kids & Pets | Illustrated campfire, pine greens, badge patches, hand lettering | Build your week: pick dates, cabin and activities; a camp badge and daily schedule assemble; spaces left computed |
| 88 | `88-northbank-library` | Northbank Library | Public library | Company | Education & Causes | Card-catalogue drawers, typewriter labels, oak and brass | Card catalogue: open drawers, search, flip cards; a shelf of spines you can pull out; events computed from today |
| 89 | `89-harbourlight-vets` | Harbourlight Vets | Veterinary clinic | Company | Kids & Pets | Soft seaside pastels, friendly illustrated animals | Pick your pet → visit type → slot; the pet illustration reacts; vaccine reminder timeline (illustrative) |
| 90 | `90-quarry` | Quarry | Climbing gym | Company | Sport & Outdoors | Chalk-dusted walls, coloured holds, grippy bold type | Route setter: tap holds on a wall to build a problem; grade estimate, move count and a route card |
| 91 | `91-null-sector` | Null Sector | Esports team | Company | Media & Entertainment | Glitch neon on black, angular HUD, scanlines | Roster cards with stat radar charts and a tournament bracket you click through to predict winners |
| 92 | `92-loom-and-ewe` | Loom & Ewe | Yarn & knitting shop | Commerce | Fashion & Beauty | Woolly textures, knit-stitch patterns, cosy autumn palette | Colourwork designer: paint a pixel knit chart; it renders as a knitted swatch; yarn amounts and kit price update |
| 93 | `93-ember-oak` | Ember & Oak | Chef's knives | Commerce | Food & Drink | Forge: dark steel, ember orange, Damascus patterns | Knife configurator: blade shape, steel, handle wood, engraving — live render, specs and price |
| 94 | `94-paper-tiger` | Paper Tiger | Stationery & notebooks | Commerce | Arts & Culture | Letterpress, paper grain, bold tiger-orange spot colour | Notebook builder: cover colour, paper ruling, page count, foil initials; flip through pages of the result |
| 95 | `95-optic` | Optic | Eyewear | Commerce | Fashion & Beauty | Clean optical-lab white, lens refractions, playful acetate colours | Try-on on illustrated face shapes: switch frames and colours, frame-width guide, lens options and price |
| 96 | `96-grove-tea` | Grove Tea | Loose-leaf tea | Commerce | Food & Drink | Misty tea terraces, celadon greens, slow steam | Brew guide: pick a tea → water temperature, leaf amount and a steeping timer while the leaves unfurl |
| 97 | `97-seedline` | Seedline | Garden seed shop | Commerce | Home & Living | Seed-packet illustrations, kraft paper, botanical prints | Plot planner: drop seeds onto a garden grid; spacing warnings and a bloom/harvest calendar across the months |
| 98 | `98-relay` | Relay | Team chat app | Landing | Tech & Software | Playful UI with sticker-like message bubbles and a bold sans | Live mock workspace: messages arrive, threads open, you can react, reply and switch channels |
| 99 | `99-signal-summit` | Signal Summit | Tech conference | Landing | Tech & Software | Bold grid, big numbers, swinging 3D lanyard, electric blue/yellow | Badge maker: type name/role, pick a track; a swinging lanyard badge renders; agenda builder for your track |
| 100 | `100-mosaic` | Mosaic | AI photo restoration | AI | Arts & Culture | Archival darkroom, sepia to colour, film grain | Before/after restoration on generated "old photos": scratches heal, colour returns, a slider and step toggles |
