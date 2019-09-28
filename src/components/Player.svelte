<script>
  import { extractLocation } from 'src/lib/location'
  import { getContext, onDestroy } from 'svelte'

  export let player

  const ctx = getContext('leaflet')
  let marker

  $: setLocation(player)

  function setLocation(pl) {
    const locationArray = toLocationArray(pl)
    if ($ctx && !marker && locationArray) {
      console.log('Player.mount', pl.id)
      marker = L.marker(locationArray)
      marker.addTo($ctx);
    } else if (marker) {
      console.log('Player.move', pl.id)
      marker.setLatLng(locationArray)
    }
  }

  onDestroy(() => {
    if (marker) {
      $ctx.removeLayer(marker)
    }
  })

  function toLocationArray(location) {
    location = extractLocation(location)
    return location.latitude && [location.latitude, location.longitude]
  }
</script>
