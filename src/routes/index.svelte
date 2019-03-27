<style>
:global(body) {
  background: black;
  color: white;
}
</style>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

{#if !$location}
  Waiting for location
  <button on:click={setFakeLocation}>Set fake location</button>
{:else}
  {JSON.stringify($location)}
  <Leaflet center={[51.04317474, 3.71724129]} />
{/if}

<script>
	import { location, setFakeLocation } from 'src/store/location.js'

  import Leaflet from 'src/components/Leaflet.svelte'
</script>
