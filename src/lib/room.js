import { derived, writable } from 'svelte/store'
import { location } from './location.js'
import { connectableJSON } from 'src/lib/connectable.js'

export const room = process.browser ? connectableJSON('ws://websocket-room.now.sh/spel.fun') : writable()

export function pass(location, room) {
  return () => {
    location.subscribe(v => {
      console.log('v', v)
      room.send(v)
    })
  }
}