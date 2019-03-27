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
</style>

<div bind:this={elem}></div>

<script>
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { leaflet } from 'src/lib/leaflet.js'
  import { location, locationArray } from 'src/store/location.js'

  export let center
  let elem

  onMount(async () => {
    await leaflet()
    var mymap = L.map(elem, {
      center: get(locationArray),
      zoom: 18
    })
    L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
    console.log(mymap)
    locationArray.subscribe(center => {
      mymap.panTo(center)
    })

    L.marker([50.5, 30.5]).addTo(map);
  })
</script>
