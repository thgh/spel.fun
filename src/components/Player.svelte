<script>
  import { extractLocation } from 'src/lib/location'
  import { getContext, onMount } from 'svelte'

  export let player

  const ctx = getContext('leaflet')
  let marker

  $: lat = player.lat
  $: lng = player.lng
  $: setLocation(lat, lng)

  onMount(() => {
    setLocation(lat, lng)
    return () => {
      if (marker) {
        $ctx.removeLayer(marker)
      }
    }
  })

  function setLocation(lat, lng) {
    if ($ctx && !marker) {
      console.log('Player.mount', player.id)
      marker = L.marker([lat, lng])
      marker.addTo($ctx);
    } else if (marker) {
      // console.log('Player.move', pl.id)
      marker.setLatLng([lat, lng])
    }
  }
</script>
