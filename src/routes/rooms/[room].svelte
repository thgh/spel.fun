<Leaflet center={[51.04317474, 3.71724129]} on:click={createItem}>
  {#each $players as player (player.id)}
    <Player player={player} />g
  {/each}
  {#each $items as item (item.id)}
    <Item item={item} />d
  {/each}
</Leaflet>
<p>
{JSON.stringify($location)}
</p>

<Nav />

<script>
  import { location, toggleFakeLocation, extractLocation } from 'src/lib/location.js'
  import { stores } from '@sapper/app'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'

  import Leaflet from 'src/components/Leaflet.svelte'
  import Nav from 'src/components/Nav.svelte'
  import Player from 'src/components/Player.svelte'
  import Item from 'src/components/Item.svelte'

  import { socket } from 'src/lib/socket.io'

  const players = writable([])
  const items = writable([])
  const { page } = stores()

  $: room = $page.params.room

  onMount(() =>
    location.subscribe(async location => {
      socket.emit('move', {
        id: await socket.wait(),
        room,
        location: extractLocation(location),
      })
    })
  )

  onMount(() => {
    socket.on('connect', function() {
      socket.emit('move', {
        id: socket.id,
        room,
        location: extractLocation($location),
      })
    })

    socket.on('player', function(msg) {
      // players
      console.warn('received player', msg)
    })

    socket.on('item', function(msg) {
      // players
      console.warn('received player', msg)
    })

    socket.on('players', function(list) {
      players.set(list)
      // console.log('received players', list)
    })

    socket.on('items', function(list) {
      items.set(list)
      // console.log('received items', list)
    })
    return () => {
      socket.emit('leave', room)
    }
  })
  function fromLocationArray(latlng) {
    return {
      latitude: latlng.lat,
      longitude: latlng.lng
    }
  }

  function createItem(evt) {
    const item = {
      type: 'coin',
      location: fromLocationArray(evt.detail)
    }
    socket.emit('createItem', item)
  }

</script>