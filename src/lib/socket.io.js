// export function socketio() {
//   loadScript('https://unpkg.com/leaflet@1.5.1/dist/leaflet.js')
//   const socket = window.io()
// }

import { loadScript } from '@bothrs/util/loadScript'

// Lazy socketio
export const socket = {
  init,
  emit: async (a, b) => (await init()).emit(a, b),
  on: async (a, b) => (await init()).on(a, b),
  off: async (a, b) => process.browser && (await init()).off(a, b),
  wait: (a, b) => {
    return init().then(sock => {
      return sock.id || new Promise(async res => {
        const socket = await init()
        socket.once('connect', () => res(socket.id))
      })
    })
  },
}

Object.defineProperty(socket, 'id', {
  get: function() {
    return window.__socket__ && window.__socket__.id
  },
})

async function init(a, b) {
  if (!window.__socket) {
    window.__socket = loadScript('/socket.io/socket.io.js').then(
      () => (window.__socket__ = window.io())
    )
  }
  return window.__socket
}
