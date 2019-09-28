<Leaflet center={[51.04317474, 3.71724129]} on:click={createItem}>
  {#each $players as player (player.id)}
    <Player player={player} />
  {/each}
  {#each $items as item (item.id)}
    <Item item={item} on:move={moveItem} />
  {/each}
</Leaflet>
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
  import Player from 'src/components/Player.svelte'
  import Item from 'src/components/Item.svelte'

  import { socket } from 'src/lib/socket.io'
  import { play } from 'src/lib/sound'

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

    // socket.on('player', function(msg) {
    //   // players
    //   console.warn('received player', msg)
    // })

    // socket.on('item', function(msg) {
    //   // players
    //   console.warn('received player', msg)
    // })

    socket.on('players', players.set)
    socket.on('items', items.set)
    socket.on('foundItems', playCoin)

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

  function moveItem(evt) {
    play('timebombshort')
    // for (var i = 3; i >= 0; i--) {
    //   setTimeout(() => play('coin'), Math.random() * 1000)
    // }
    const { id, lat, lng } = evt.detail
    socket.emit('moveItem', { id, lat, lng })
  }

  function playCoin(times) {
    for (var i = times - 1; i >= 0; i--) {
      setTimeout(() => play('coin'), i * 300)
    }
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
