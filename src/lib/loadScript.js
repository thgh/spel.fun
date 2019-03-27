export function loadScript (src) {
  return new Promise(resolve => {
    const s = document.createElement('script')
    s.src = src
    s.defer = true
    s.crossOrigin = 'anonymous'
    s.onload = resolve
    document.head.appendChild(s)
  })
}

export function loadStyle (href) {
  const s = document.createElement('link')
  s.rel = 'stylesheet'
  s.crossOrigin = 'anonymous'
  s.href = href
  document.head.appendChild(s)
}
