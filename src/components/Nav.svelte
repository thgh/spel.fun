<nav>
	<ul>
		<li><a href="/">home</a></li>
		<li><a href="/rooms/hello">room hello</a></li>
	</ul>
  <button on:click={toggleFakeLocation}>Set fake location</button>
</nav>


<script>
  import { location, toggleFakeLocation } from 'src/lib/location.js'
	export let segment = ''
</script>

<style>
	nav {
		position: fixed;
		bottom: 0;
		left: 0;
		border-bottom: 1px solid rgba(170, 30, 30, 0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}
	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
		background: white;
	}
</style>
