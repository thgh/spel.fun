import http from 'http'
import sirv from 'sirv'
import polka from 'polka'
import compression from 'compression'
import * as sapper from '@sapper/server'

import { extractLocation } from 'src/lib/location'
import { BOMB_FUSE_TIME } from './constants.js'
import { knex } from '@bothrs/util/knex-env'

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
  let room
  // Player joins room
  socket.on('join', async room => {})
  // Player leaves room
  socket.on('leave', async room => {
    players.splice(players.findIndex(p => p.id === socket.id), 1)
    socket.leave(room)
  })
  // Player location change
  socket.on('move', async move => {
    const left = players.find(p => p.id === socket.id && move.room !== p.room)

    if (left) {
      await leaveRoom(socket, left)
    }

    const current = players.find(
      p => p.id === socket.id && move.room === p.room
    )
    if (current) {
      current.lat = extractLocation(move).lat
      current.lng = extractLocation(move).lng
      syncPlayers()
      console.log('moved', current.id)

      // Initial sync new player
      const items = await knex('items').where({
        room: move.room,
      // Detect collisions
      const items = await knex('items')
        .where('room', current.room)
        .whereNull('found_at')
      const foundIds = items
        .filter(item => distance(item, current) < 0.03)
        .map(item => item.id)
      if (foundIds.length) {
        const ok = await knex('items')
          .where('room', current.room)
          .whereNull('found_at')
          .whereNull('found_by')
          .whereIn('id', foundIds)
          .update({
            found_at: Date.now(),
            found_by: current.id,
          })
        socket.emit('foundItems', ok)
        const items = await knex('items')
          .where('room', current.room)
          .whereNull('found_at')
        socket.emit('items', items.map(fromDatabase))
      }
    } else if (move.room) {
      socket.join(move.room, async () => {
        console.log('join', move.room, socket.rooms)
        const player = {
          id: socket.id,
          room: move.room,
          ...extractLocation(move),
        }
        players.push(normalize(player))

        // Update other players
        // socket.to(player.room).emit('player', player)
        syncPlayers()

        // Initial sync new player
        const items = await knex('items')
          .where('room', move.room)
          .whereNull('found_at')
        socket.emit('items', items.map(fromDatabase))
      })
    }
    // TODO: validate
    // const ins = await knex('players').insert(player)
    // socket.to(player.room).emit('player', { location: player.location })
  })

  // Player adds item
  socket.on('createItem', async item => {
    console.log('createItem', item)
    normalize(item)
    await knex('items').insert(toDatabase(item))
    const items = await knex('items')
      .where('room', item.room)
      .whereNull('found_at')
    // socket.to(item.room).emit('item', item)
    io.in('hello').emit('items', items.map(fromDatabase))

    if (item.json.type === 'bomb') {
      setTimeout(() => {
        io.in('hello').emit('explosion', item)
        // TODO: get every player in the bomb area 

        // remove bomb item from db
        const x = knex('items')
          .where('id', item.id)
          .del()
          .then(async () => {
            const items = await knex('items').where({
              room: item.room,
            })
            console.log('items.length emittnig', items.length);
            io.in('hello').emit('items', items.map(fromDatabase))
          })
      }, BOMB_FUSE_TIME)
    }
  })

  // Player moves item
  socket.on('moveItem', async ({ id, lat, lng }) => {
    console.log('moveItem', socket.rooms)
    const ok = await knex('items')
      .where({ id })
      .update(toDatabase({ lat, lng }))
    const items = await knex('items')
      .where('room', getRoom(socket))
      .whereNull('found_at')
    // socket.to(item.room).emit('item', item)
    io.in('hello').emit('items', items.map(fromDatabase))

    // Detect collisions?
  })

  socket.on('disconnect', () => {
    players.splice(players.findIndex(p => p.id === socket.id), 1)
    syncPlayers()
  })
})

const syncPlayers = throttle(() => {
  io.in('hello').emit('players', players)

  // Detect collisions?
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
  obj.lat = extractLocation(obj).lat
  obj.lng = extractLocation(obj).lng
  obj.room = obj.room || 'hello'
  return obj
}

function throttle(func, wait, options) {
  var _ = {
    now:
      Date.now ||
      function() {
        return new Date().getTime()
      },
  }
  var context, args, result
  var timeout = null
  var previous = 0
  if (!options) options = {}
  var later = function() {
    previous = options.leading === false ? 0 : _.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function() {
    var now = _.now()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

function getRoom(socket) {
  return Object.keys(socket.rooms).find(item => item !== socket.id)
}

function toDatabase(obj) {
  if (!obj.json) {
    return obj
  }
  return {
    ...obj,
    json: JSON.stringify(obj.json || {}),
  }
}

function fromDatabase(obj) {
  if (!obj.json) {
    return obj
  }
  return {
    ...obj,
    json: JSON.parse(obj.json || '{}'),
  }
}

function distance(a, b) {
  const { lat: lat1, lng: lon1 } = a
  const { lat: lat2, lng: lon2 } = b
  var R = 6371 // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1) // deg2rad below
  var dLon = deg2rad(lon2 - lon1)
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c // Distance in km
  return d
}
function deg2rad(v) {
  return (v * Math.PI) / 180
}


function leaveRoom(socket, left) {
  return new Promise(res => {
    const index = players.findIndex(p => p.id === socket.id)
    if (index >= 0) players.splice(index, 1)
    
    socket.leave(left.room, res)
  })
}
