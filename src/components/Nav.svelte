<nav class:center={$page.path === '/'} on:click={() => muted.set(false)}>
	<ul>
		{#if $muted && $page.path.startsWith('/rooms/')}
			<li><button class="btn">muted</button></li>
		{/if}
		<li><a class="btn" class:hidden={$page.path === '/'} href="/">Home</a></li>
		<li><a class="btn" class:hidden={$page.path === '/rooms/hello'} href="/rooms/hello">Play</a></li>
		<li><button class="btn" class:stop={$wander} on:click={wander.toggle}>{$wander ? 'Wandering...' : 'Wander'}</button></li>
	</ul>
</nav>

<script context="module">
	import { writable } from 'svelte/store'
  const muted = writable(true)
</script>
<script>
	import { stores } from '@sapper/app'
  import { location, wander } from 'src/lib/location.js'
	export let segment = ''

	const { page } = stores()
</script>

<style>
	nav {
		position: fixed;
		bottom: 0;
		left: 0;
		transition: transform .2s;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	li {
		margin: .5em;
		display: block;
	}
	.btn {
		margin: 0;
		padding: .5em 1em;
		border: 0;
		border-radius: 2em;
		display: inline-block;
		line-height: 1.2em;
		font: inherit;
		text-decoration: none;
		box-sizing: border-box;
		background: rgba(0, 0, 0, .6);
		color: white;
		opacity: .8;
	}
	.btn:hover,.btn:focus {
		outline: none;
		opacity: 1;
	}
	.hidden {
		display: none;
	}
	.stop {
		background: rgba(50, 0, 0, .6);
		color: #f99;
	}
	.center {
		transform: translate(calc(50vw + -70px), calc(-50vh + 70px));
	}
</style>
