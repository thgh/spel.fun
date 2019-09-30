import { loadStyle, loadScript } from '@bothrs/util/loadScript'

let loaded = false
export async function leaflet() {
  if (!loaded) {
    loaded = true
    loadStyle('https://unpkg.com/leaflet@1.5.1/dist/leaflet.css')
    await loadScript('https://unpkg.com/leaflet@1.5.1/dist/leaflet.js')
  }
  return window.L
}

export function createIcon(item) {
  return window.L.icon({
    iconUrl: item.url || item.icon || item.json.icon || '/bitcoin.png',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 24], // point of the icon which will correspond to marker's location
    popupAnchor: [12, 12], // point from which the popup should open relative to the iconAnchor
  })
}
