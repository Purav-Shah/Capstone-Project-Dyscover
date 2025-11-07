export function getInitialDarkMode() {
  try {
    const val = window.localStorage.getItem('darkMode')
    if (val === 'true') return true
    if (val === 'false') return false
  } catch {}
  return false
}

export function setDarkMode(enabled) {
  try {
    window.localStorage.setItem('darkMode', enabled ? 'true' : 'false')
  } catch {}
}



