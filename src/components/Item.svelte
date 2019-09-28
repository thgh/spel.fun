<script>
  import { getContext, onMount } from 'svelte'
  import { createIcon } from 'src/lib/leaflet'

  export let item

  const ctx = getContext('leaflet')
  let marker

  $: lat = item.lat
  $: lng = item.lng
  $: icon = item.icon
  $: setLocation(lat, lng)
  $: setIcon(icon)

  onMount(() => {
    setLocation(lat, lng)
  })

  function setLocation(lat, lng) {
    if ($ctx && !marker) {
      console.log('createMarker', item)
      marker = L.marker([lat, lng])
      marker.addTo($ctx);
    } else if (marker) {
      marker.setLatLng([lat, lng])
    }
  }

  function setIcon(lat, lng) {
    console.log('seticon')
    if (marker) {
      marker.setIcon(createIcon(item))
    }
  }
</script>
