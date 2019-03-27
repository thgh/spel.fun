import { loadStyle, loadScript } from 'src/lib/loadScript.js'

let loaded = false
export async function leaflet() {
  if (!loaded) {
    loaded = true
    loadStyle('https://unpkg.com/leaflet@1.4.0/dist/leaflet.css')
    await loadScript('https://unpkg.com/leaflet@1.4.0/dist/leaflet.js')
  }
}