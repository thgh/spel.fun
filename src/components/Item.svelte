<script>
  import { getContext, onMount, createEventDispatcher } from 'svelte'
  import { createIcon } from 'src/lib/leaflet'

  import { BOMB_FUSE_TIME, BOMB_EXPLOSION_RADIUS } from 'src/constants'
  export let item

  const dispatch = createEventDispatcher()
  const ctx = getContext('leaflet')
  let marker

  $: lat = item.lat
  $: lng = item.lng
  $: icon = item.icon || item.json.icon
  $: setLocation(lat, lng)
  $: setIcon(icon)
  $: explode(item.json.explode)

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
    console.log('seticon', item)
    if (marker) {
      marker.setIcon(createIcon(item))
    }
  }

  function explode(){
    let circle
    if(item.json.explode){
      circle = L && L.circle([lat, lng], {radius: BOMB_EXPLOSION_RADIUS})
      circle.addTo($ctx);
    }
    setTimeout(function() {
      circle && circle.remove($ctx)
    }, BOMB_FUSE_TIME);
  }
</script>
