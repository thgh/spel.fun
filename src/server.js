import http from 'http'
import sirv from 'sirv'
import polka from 'polka'
import compression from 'compression'
import * as sapper from '@sapper/server'

import { extractLocation } from 'src/lib/location'

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'
const server = http.createServer()

const app = polka({ server })
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
  )
  .listen(PORT, err => {
    if (err) throw err
    console.log(`> Running on http://localhost:${PORT}`)
  })

// Realtime
const io = require('socket.io')(server)
const players = []
const items = []
io.on('connection', socket => {
  // Player joins room
  socket.on('join', async room => {
    
  })
  // Player leaves room
  socket.on('leave', async room => {
    socket.leave(room)
  })
  // Player location change
  socket.on('move', move => {
    const left = players.find(p => p.id === socket.id && move.room !== p.room)
    left && socket.leave(left.room)

    const current = players.find(p => p.id === socket.id && move.room === p.room)
    if (current) {
      current.location = extractLocation(move)
      syncPlayers()
      console.log('moved', current.id)
    } else {
      console.log('join', move.room, move)
      socket.join(move.room)
      const player = {
        id: socket.id,
        room: move.room,
        location: extractLocation(move)
      }
      players.push(normalize(player))

      // Update other players
      // socket.to(player.room).emit('player', player)
      syncPlayers()

      // Initial sync new player
      socket.emit('items', items)
    }
    // TODO: validate
    // const ins = await knex('players').insert(player)
    // socket.to(player.room).emit('player', { location: player.location })
  })

  // Player adds item
  socket.on('createItem', async item => {
    console.log('createItem', item)
    normalize(item)
    items.push(item)
    // socket.to(item.room).emit('item', item)
    io.in('hello').emit('items', items)
  })

  socket.on('disconnect', () => {
    players.splice(players.findIndex(p => p.id === socket.id), 1)
    syncPlayers()
  })
})

const syncPlayers = throttle(() => {
  io.in('hello').emit('players', players)
}, 1000)

// async function emitSet(socket, room) {
//   const messages = await knex('moves').where({
//     room,
//     deletedAt: null,
//   })
//   console.log('messages.set', messages.length)

//   socket.emit('set', messages.map(outgoingMessage))
// }

import { str62 } from '@bothrs/util/random'

function normalize(obj) {
  obj.id = obj.id || str62(10)
  obj.location = extractLocation(obj)
  obj.room = obj.room || 'hello'
  return obj
}

function throttle(func, wait, options) {
  var _ = {
    now :  Date.now || function() {
      return new Date().getTime();
    }
  }
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : _.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = _.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
