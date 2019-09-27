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
    transition: transform .3s linear;
  }
</style>

<div bind:this={elem}></div>

<script>
  import { onMount } from 'svelte'
  import { get, writable } from 'svelte/store'

  import { leaflet } from 'src/lib/leaflet.js'
  import { location, locationArray } from 'src/store/location.js'

  export let items = writable([])
  export let center
  let elem

  onMount(async () => {
    await leaflet()
    var mymap = L.map(elem, {
      center: get(locationArray),
      zoom: 18
    })
    let mymarker
    L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
    console.log(mymap)
    locationArray.subscribe(center => {
      if (!mymarker) {
        mymarker = L.marker(center)
        mymarker.addTo(mymap);
      }
      mymarker.setLatLng(center)
    })
    items.subscribe(items => {

    })
  })
</script>
