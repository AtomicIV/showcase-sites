// Deterministic font replacement for sites 01-100: replaces any Google Font that lacks the
// `vietnamese` subset with its closest visual match that natively supports `/* vietnamese */`.
const fs = require('fs')
const path = require('path')

// Every target value here is verified to serve `/* vietnamese */` on Google Fonts.
const FONT_MAP = {
  'Albert Sans': { name: 'Plus Jakarta Sans', spec: 'Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800' },
  'Amiri': { name: 'Cormorant Garamond', spec: 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600' },
  'Atkinson Hyperlegible': { name: 'Be Vietnam Pro', spec: 'Be+Vietnam+Pro:ital,wght@0,400;0,500;0,700;1,400' },
  'Azeret Mono': { name: 'JetBrains Mono', spec: 'JetBrains+Mono:ital,wght@0,400..700;1,400' },
  'Bagel Fat One': { name: 'Coiny', spec: 'Coiny' },
  'Bebas Neue': { name: 'Oswald', spec: 'Oswald:wght@500;600;700' },
  'Bodoni Moda': { name: 'Noto Serif Display', spec: 'Noto+Serif+Display:ital,wght@0,400..700;1,400..700' },
  'Bowlby One': { name: 'Paytone One', spec: 'Paytone+One' },
  'Caprasimo': { name: 'Chonburi', spec: 'Chonburi' },
  'Caveat': { name: 'Patrick Hand', spec: 'Patrick+Hand' },
  'Chango': { name: 'Bungee', spec: 'Bungee' },
  'Corben': { name: 'Fraunces', spec: 'Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..700' },
  'Courier Prime': { name: 'IBM Plex Mono', spec: 'IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400' },
  'Covered By Your Grace': { name: 'Patrick Hand', spec: 'Patrick+Hand' },
  'Cutive Mono': { name: 'Space Mono', spec: 'Space+Mono:ital,wght@0,400;0,700;1,400' },
  'DM Mono': { name: 'JetBrains Mono', spec: 'JetBrains+Mono:ital,wght@0,400..700;1,400' },
  'DM Sans': { name: 'Be Vietnam Pro', spec: 'Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400' },
  'DM Serif Display': { name: 'Playfair Display', spec: 'Playfair+Display:ital,wght@0,400..800;1,400..700' },
  'Figtree': { name: 'Plus Jakarta Sans', spec: 'Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..700' },
  'Fragment Mono': { name: 'Space Mono', spec: 'Space+Mono:ital,wght@0,400;0,700;1,400' },
  'Fredoka': { name: 'Baloo 2', spec: 'Baloo+2:wght@500;600;700;800' },
  'Funnel Display': { name: 'Bricolage Grotesque', spec: 'Bricolage+Grotesque:opsz,wght@12..96,400..800' },
  'Funnel Sans': { name: 'Onest', spec: 'Onest:wght@400..700' },
  'Gabarito': { name: 'Bricolage Grotesque', spec: 'Bricolage+Grotesque:opsz,wght@12..96,400..800' },
  'Gilda Display': { name: 'Prata', spec: 'Prata' },
  'Gloock': { name: 'Prata', spec: 'Prata' },
  'Gochi Hand': { name: 'Itim', spec: 'Itim' },
  'Golos Text': { name: 'Onest', spec: 'Onest:wght@400..700' },
  'Hedvig Letters Sans': { name: 'Public Sans', spec: 'Public+Sans:ital,wght@0,400..700;1,400' },
  'Hedvig Letters Serif': { name: 'Newsreader', spec: 'Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400' },
  'Host Grotesk': { name: 'Hanken Grotesk', spec: 'Hanken+Grotesk:ital,wght@0,400..800;1,400' },
  'IM Fell English': { name: 'EB Garamond', spec: 'EB+Garamond:ital,wght@0,400..700;1,400..600' },
  'Instrument Sans': { name: 'Plus Jakarta Sans', spec: 'Plus+Jakarta+Sans:ital,wght@0,400..700;1,400..600' },
  'Instrument Serif': { name: 'Cormorant Garamond', spec: 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600' },
  'Italiana': { name: 'Cormorant SC', spec: 'Cormorant+SC:wght@400;600;700' },
  'Jost': { name: 'Josefin Sans', spec: 'Josefin+Sans:ital,wght@0,400..700;1,400' },
  'Kalam': { name: 'Sriracha', spec: 'Sriracha' },
  'Karla': { name: 'Work Sans', spec: 'Work+Sans:ital,wght@0,400..700;1,400' },
  'Libre Caslon Display': { name: 'EB Garamond', spec: 'EB+Garamond:ital,wght@0,400..700;1,400..600' },
  'Libre Caslon Text': { name: 'EB Garamond', spec: 'EB+Garamond:ital,wght@0,400..700;1,400..600' },
  'Lilita One': { name: 'Paytone One', spec: 'Paytone+One' },
  'Limelight': { name: 'Yeseva One', spec: 'Yeseva+One' },
  'Martian Mono': { name: 'Chivo Mono', spec: 'Chivo+Mono:ital,wght@0,400..700;1,400' },
  'Michroma': { name: 'Tektur', spec: 'Tektur:wght@400..700' },
  'Orbitron': { name: 'Chakra Petch', spec: 'Chakra+Petch:ital,wght@0,400;0,600;0,700;1,400' },
  'Outfit': { name: 'Lexend', spec: 'Lexend:wght@300..700' },
  'Oxanium': { name: 'Chakra Petch', spec: 'Chakra+Petch:ital,wght@0,400;0,600;0,700;1,400' },
  'PT Serif': { name: 'Lora', spec: 'Lora:ital,wght@0,400..700;1,400..600' },
  'Permanent Marker': { name: 'Sedgwick Ave', spec: 'Sedgwick+Ave' },
  'Pirata One': { name: 'Imbue', spec: 'Imbue:opsz,wght@10..100,400..800' },
  'Press Start 2P': { name: 'Handjet', spec: 'Handjet:wght@500;700;800' },
  'Red Hat Display': { name: 'Plus Jakarta Sans', spec: 'Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..700' },
  'Red Hat Mono': { name: 'JetBrains Mono', spec: 'JetBrains+Mono:ital,wght@0,400..700;1,400' },
  'Red Hat Text': { name: 'Be Vietnam Pro', spec: 'Be+Vietnam+Pro:ital,wght@0,400;0,500;0,700;1,400' },
  'Reenie Beanie': { name: 'Dancing Script', spec: 'Dancing+Script:wght@500;700' },
  'Rethink Sans': { name: 'Hanken Grotesk', spec: 'Hanken+Grotesk:ital,wght@0,400..800;1,400' },
  'Righteous': { name: 'Kanit', spec: 'Kanit:ital,wght@0,400;0,600;0,700;1,400' },
  'Rubik': { name: 'Nunito', spec: 'Nunito:ital,wght@0,400..800;1,400' },
  'Schibsted Grotesk': { name: 'Hanken Grotesk', spec: 'Hanken+Grotesk:ital,wght@0,400..800;1,400' },
  'Schoolbell': { name: 'Mali', spec: 'Mali:ital,wght@0,400;0,600;0,700;1,400' },
  'Shippori Mincho': { name: 'Noto Serif Display', spec: 'Noto+Serif+Display:ital,wght@0,400..700;1,400' },
  'Shrikhand': { name: 'Chonburi', spec: 'Chonburi' },
  'Sofia Sans': { name: 'Fira Sans', spec: 'Fira+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400' },
  'Sometype Mono': { name: 'IBM Plex Mono', spec: 'IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400' },
  'Sora': { name: 'Space Grotesk', spec: 'Space+Grotesk:wght@400..700' },
  'Special Elite': { name: 'Space Mono', spec: 'Space+Mono:ital,wght@0,400;0,700;1,400' },
  'Spline Sans Mono': { name: 'Chivo Mono', spec: 'Chivo+Mono:ital,wght@0,400..700;1,400' },
  'Syncopate': { name: 'Unbounded', spec: 'Unbounded:wght@400..800' },
  'Syne': { name: 'Unbounded', spec: 'Unbounded:wght@400..800' },
  'Tenor Sans': { name: 'Cormorant SC', spec: 'Cormorant+SC:wght@400;600;700' },
  'Ultra': { name: 'Alfa Slab One', spec: 'Alfa+Slab+One' },
  'UnifrakturMaguntia': { name: 'Imbue', spec: 'Imbue:opsz,wght@10..100,400..800' },
  'Urbanist': { name: 'Manrope', spec: 'Manrope:wght@400..800' },
  'Yellowtail': { name: 'Pacifico', spec: 'Pacifico' },
  'Young Serif': { name: 'Fraunces', spec: 'Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400' },
  'Zen Kaku Gothic New': { name: 'Be Vietnam Pro', spec: 'Be+Vietnam+Pro:ital,wght@0,400;0,500;0,700;1,400' },
  'Zilla Slab': { name: 'Roboto Slab', spec: 'Roboto+Slab:wght@400..700' },
}

function fixGoogleFontsUrl(url) {
  // Parse each family=... parameter and replace if in FONT_MAP
  const seenSpecs = new Set()
  return url.replace(/family=([^&"'\s>]+)/g, (full, famPart) => {
    const rawName = decodeURIComponent(famPart.split(':')[0]).replace(/\+/g, ' ')
    if (FONT_MAP[rawName]) {
      const targetSpec = FONT_MAP[rawName].spec
      if (seenSpecs.has(targetSpec)) return ''
      seenSpecs.add(targetSpec)
      return 'family=' + targetSpec
    }
    seenSpecs.add(famPart)
    return full
  }).replace(/\?&+/g, '?').replace(/&&+/g, '&').replace(/&(?=&|$)/g, '')
}

function fixSite(dirPath) {
  const htmlFile = path.join(dirPath, 'index.html')
  const metaFile = path.join(dirPath, 'meta.json')
  if (fs.existsSync(htmlFile)) {
    let html = fs.readFileSync(htmlFile, 'utf8')
    // 1. Set lang="vi"
    html = html.replace(/<html\s+lang=["']en["']/i, '<html lang="vi"')
    // 2. Replace Google Fonts URLs
    html = html.replace(/https:\/\/fonts\.googleapis\.com\/css2\?[^"'\s>]+/g, fixGoogleFontsUrl)
    // 3. Replace font family references in CSS/JS
    for (const [oldName, { name: newName }] of Object.entries(FONT_MAP)) {
      const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Match quoted or unquoted font name in CSS/JS
      html = html.replace(new RegExp(`(['"])${escaped}\\1`, 'g'), `$1${newName}$1`)
      html = html.replace(new RegExp(`(?<=font-family\\s*:\\s*|font\\s*:[^;{}]*?)${escaped}`, 'g'), newName)
    }
    fs.writeFileSync(htmlFile, html, 'utf8')
  }
  if (fs.existsSync(metaFile)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
      if (Array.isArray(meta.fonts)) {
        const mapped = meta.fonts.map((f) => {
          const clean = f.replace(/\s*\(.*?\)\s*$/, '').trim()
          return FONT_MAP[clean] ? FONT_MAP[clean].name : f
        })
        meta.fonts = [...new Set(mapped)]
      }
      fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n', 'utf8')
    } catch (e) {
      console.error('meta error in', dirPath, e.message)
    }
  }
}

if (require.main === module) {
  const sitesDir = path.resolve(__dirname, '..', 'sites')
  let count = 0
  for (const d of fs.readdirSync(sitesDir)) {
    const full = path.join(sitesDir, d)
    if (fs.statSync(full).isDirectory()) {
      fixSite(full)
      count++
    }
  }
  console.log(`Updated fonts and lang="vi" across ${count} sites.`)
}
module.exports = { FONT_MAP, fixSite }
