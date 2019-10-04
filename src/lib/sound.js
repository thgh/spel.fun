import { loadScript } from '@bothrs/util/loadScript'

const cache = {}
export const sounds = {
  whale: { src: ['/assets/sound/monster.mp3'] },
  kraken: { src: ['/assets/sound/godzilla.mp3'] },
  invincible: { src: ['/assets/sound/totally-not-mario.mp3'] },
}

export async function play(name) {
  await loadScript(
    'https://unpkg.com/howler@2.1.2/dist/howler.min.js',
    'howlersdk'
  )
  if (!cache[name]) {
    cache[name] = new Howl(sounds[name] || {
      src: ['/assets/sound/' + name + '.mp3']
    })
  }
  cache[name].play()
}

export async function playFor(name, ms) {
  await loadScript(
    'https://unpkg.com/howler@2.1.2/dist/howler.min.js',
    'howlersdk'
  )
  if (!cache[name]) {
    cache[name] = new Howl(sounds[name] || {
      src: ['/assets/sound/' + name + '.mp3']
    })
  }
  cache[name].loop(1)
  cache[name].play()
  setTimeout(function() {
    cache[name].loop(0)
  }, ms)
}
