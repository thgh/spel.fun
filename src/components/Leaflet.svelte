<style>
  div {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
  }
  :global(.leaflet-tile-container img) {
    filter: invert(1);
  }
  :global(leaflet-layer ){
    background: blue;
  }
  :global(.leaflet-shadow-pane > *),
  :global(.leaflet-marker-pane > *) {
    /*transition: transform .3s linear;*/
  }
</style>

<div bind:this={elem}>
  <slot />
</div>

<script>
  import { onMount, createEventDispatcher } from 'svelte'
  import { get, writable } from 'svelte/store'

  import { leaflet } from 'src/lib/leaflet.js'
  import { location, locationArray } from 'src/lib/location.js'

  import { setContext } from 'svelte'

  export let map_ = writable()
  export let center

  const dispatch = createEventDispatcher()
  let elem

  setContext('leaflet', map_)

  onMount(async () => {
    await leaflet()
    var mymap = L.map(elem, {
      center: ($locationArray),
      zoom: 18,
      zoomSnap: 2
    })
    let mymarker
    L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 16,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
    console.log(mymap)

    mymap.on('click', function(e){
      dispatch('click', e.latlng)
    });

    map_.set(mymap)
  })
</script>
