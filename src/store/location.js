import { derive, writable } from 'svelte/store'

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
      set(data)
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
setTimeout(setFakeLocation, 1000)
}
export function setFakeLocation() {
  const data = {
    fake: true,
    coords: {
      longitude: 3.71724129,
      latitude: 51.04317474
    }
  }
  location.set(data)
  localStorage.lastLocation = JSON.stringify(data)
  setInterval(() => {
    console.log('update', data.coords.longitude)
    data.coords.longitude += 0.0002 * Math.random() - 0.0001
    data.coords.latitude += 0.0002 * Math.random() - 0.0001
    location.set(Object.assign({}, data))
  }, 1000)
}

export const locationArray = derive(
  location,
  lo => lo && [lo.coords.latitude, lo.coords.longitude]
)
