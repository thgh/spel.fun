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
  if (!obj.latitude) {
    throw new Error('Invalid location')
  }
  return {
    latitude: obj.latitude || obj.lat,
    longitude: obj.longitude || obj.lng || obj.lon,
  }
}
