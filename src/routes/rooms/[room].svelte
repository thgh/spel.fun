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
<button bind:this={bombButton} class="btn-bomb" on:click={(e) => createItem(e, {type: 'bomb', icon:'/bomb.png'}, extractLocation($location))}>Bomb</button>

<Nav />

<script>
  import {
    location,
    toggleFakeLocation,
    extractLocation,
  } from 'src/lib/location.js'
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

  let bombButton

  $: room = $page.params.room

  onMount(() =>
    location.subscribe(async location => {
      location &&
        socket.emit('move', {
          id: await socket.wait(),
          room,
          ...extractLocation(location),
        })
    })
  )

  onMount(() => {
    socket.on('connect', function() {
      socket.emit('move', {
        id: socket.id,
        room,
        ...extractLocation($location),
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
      console.log('received items', list)
    })

    socket.on('explosion', function(bomb) {
      console.log('bomb exploded', bomb)
      const copy = $items
      const idx = copy.findIndex(i => i.id === bomb.id)
      copy[idx].json.explode = true
      items.set(copy)
      // update bomb icon to circles
      console.log('bam', $items[idx]);
    })

    return () => {
      socket.emit('leave', room)
    }
  })


  function createItem(evt, json = {}, fields = {}) {
    const item = {
      json: {
        ...json,
        type: json.type || 'coin',
      },
      ...fields,
      ...evt.detail,
    }
    socket.emit('createItem', item)
  }
</script>

<style>
  .btn-bomb {
    position: fixed;
    bottom: 1em;
    right: 1em;
    font-weight: 300;
    padding: 1em;
  }
</style>