import { get, derived, writable } from 'svelte/store'

const navigator = (process.browser && window.navigator) || {}

export const location = writable(
  process.browser &&
    localStorage.lastLocation &&
    JSON.parse(localStorage.lastLocation),
  () => {
    let init = false
    if (process.browser) {
      navigator.geolocation.getCurrentPosition(setLocation, console.error, {
        maximumAge: Infinity,
        enableHighAccuracy: false
      })
      init = navigator.geolocation.watchPosition(setLocation)
    }

    return () => {
      process.browser && navigator.geolocation.clearWatch(init)
    }

    function setLocation(data) {
      data = cloneAsObject(data)
      location.set(data)
      localStorage.lastLocation = JSON.stringify(data)
    }

    function cloneAsObject(obj) {
      if (obj === null || !(obj instanceof Object)) {
        return obj
      }
      var temp = obj instanceof Array ? [] : {}
      for (var key in obj) {
        temp[key] = cloneAsObject(obj[key])
      }
      return temp
    }
  }
)

if (process.browser) {
// setTimeout(toggleFakeLocation, 1000)
}

export const wander = process.browser ? wanderer(location) : writable()

function wanderer(location) {
  let interval = 0
  const wandering = writable(false)

  function toggle() {
    const val = !get(wandering)
    wandering.set(val)
    if (val) {
      start()
    } else {
      stop()
    }
  }

  function start() {
    const current = get(location)
    const data = {
      fake: true,
      coords: {
        longitude: current ? current.coords.longitude : 3.7697122999999997,
        latitude: current ? current.coords.latitude : 51.025255099999995
      }
    }
    data.coords.longitude += 0.0002 * Math.random() - 0.0001
    data.coords.latitude += 0.0002 * Math.random() - 0.0001
    location.set(data)
    localStorage.lastLocation = JSON.stringify(data)
    clearInterval(interval)
    interval = setInterval(() => {
      console.log('location.fake', data.coords.longitude)
      data.coords.longitude += 0.0002 * Math.random() - 0.0001
      data.coords.latitude += 0.0002 * Math.random() - 0.0001
      location.set(Object.assign({}, data))
    }, 1000)
  }

  function stop() {
    clearInterval(interval)
  }

  return { toggle, subscribe: wandering.subscribe }
}

export function toggleFakeLocation() {
  const current = get(location)
  if (current && current.interval){
    clearInterval(current.interval)
    return location.set({
      ...current,
      interval: null
    })
  }
  const data = {
    fake: true,
    coords: {
      longitude: current ? current.coords.longitude : 3.7697122999999997,
      latitude: current ? current.coords.latitude : 51.025255099999995
    }
  }
  data.coords.longitude += 0.0002 * Math.random() - 0.0001
  data.coords.latitude += 0.0002 * Math.random() - 0.0001
  location.set(data)
  localStorage.lastLocation = JSON.stringify(data)
  data.interval = setInterval(() => {
    console.log('location.fake', data.coords.longitude)
    data.coords.longitude += 0.0002 * Math.random() - 0.0001
    data.coords.latitude += 0.0002 * Math.random() - 0.0001
    location.set(Object.assign({}, data))
  }, 1000)
}

export const locationArray = derived(
  location,
  lo => lo && [lo.coords.latitude, lo.coords.longitude]
)

export function extractLocation(obj) {
  if (!obj) {
    throw new Error('Invalid location')
  }
  if (obj.location) {
    return extractLocation(obj.location)
  }
  if (obj.coords) {
    return extractLocation(obj.coords)
  }
  const out = {
    lat: obj.latitude || obj.lat,
    lng: obj.longitude || obj.lng || obj.lon,
  }
  if (!out.lat) {
    throw new Error('Invalid location')
  }
  return out
}
