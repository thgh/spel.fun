<script>
  import { getContext, onMount, createEventDispatcher } from 'svelte'
  import { createIcon } from 'src/lib/leaflet'

  export let item

  const dispatch = createEventDispatcher()
  const ctx = getContext('leaflet')
  let marker

  $: lat = item.lat
  $: lng = item.lng
  $: icon = item.icon
  $: setLocation(lat, lng)
  $: setIcon(icon)

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
      // console.log('createMarker', item)
      marker = L.marker([lat, lng], {
        draggable: true
      })
      marker.addTo($ctx);
      marker.on('dragend', evt => {
        dispatch('move', {
          id: item.id,
          ...marker.getLatLng()
        })
      })
      marker.on('click', evt => {
        console.log('click mark', evt)
        L.DomEvent.stopPropagation(evt);
      })
    } else if (marker) {
      marker.setLatLng([lat, lng])
    }
  }

  function setIcon(lat, lng) {
    if (marker) {
      marker.setIcon(createIcon(item))
    }
  }
</script>
