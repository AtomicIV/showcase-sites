// Render the catalog template with placeholder data into tools/_cattest/ for QA before real sites exist.
const fs = require('fs')
const path = require('path')
const cats = ['AI', 'AI', 'AI', 'AI', 'AI', 'Personal brand', 'Personal brand', 'Personal brand', 'Personal brand', 'Company', 'Company', 'Company', 'Company', 'Company', 'Commerce', 'Commerce', 'Commerce', 'Commerce', 'Commerce', 'Commerce']
const names = ['Nimbus', 'Synapse Studio', 'Voxa', 'Orbit', 'Ledgerly', 'Linh Tran', 'Kai Nakamura', 'Mai', 'Sora Studio', 'Meridian Freight', 'Atlas Robotics', 'Verdant Energy', 'Lumen Dental', 'Halden & Co.', 'Brew & Bloom', 'Kicks Lab', 'Maison Ivoire', 'Verde Market', 'Nomad Stays', 'Velo']
const sites = names.map((title, i) => ({
  slug: `x${i}`, href: '#', thumb: '', title, sector: 'Sample sector', category: cats[i],
  tagline: 'A one-line tagline that describes the concept', palette: ['#111111', ['#7c5cff', '#3fb8a9', '#e8834a', '#f2ff5e'][i % 4], '#ffffff'], fonts: [`Font ${i % 7}`],
}))
const dir = path.join(__dirname, '_cattest')
fs.mkdirSync(dir, { recursive: true })
const html = fs.readFileSync(path.join(__dirname, 'catalog.template.html'), 'utf8').replace('/*SITES*/[]', JSON.stringify(sites))
fs.writeFileSync(path.join(dir, 'index.html'), html)
console.log('written', path.join(dir, 'index.html'))
