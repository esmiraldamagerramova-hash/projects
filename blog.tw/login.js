const emailInput = document.getElementById('emailInput')
const passwordInput = document.getElementById('passwordInput')
const loginBtn = document.getElementById('loginBtn')
const rememberMe = document.getElementById('rememberMe')
const eyeIcon = document.getElementById('eyeIcon')
const darkmodeBtn = document.getElementById('darkmodeBtn')
const body = document.getElementById('body')

let userData = {
  email: '',
  password: ''
}

if (eyeIcon && passwordInput) {
  eyeIcon.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password'
    passwordInput.type = isPassword ? 'text' : 'password'

    if (eyeIcon.tagName === 'IMG') {
      eyeIcon.src = isPassword
        ? './assets/icons/eye-closed.svg'
        : './assets/icons/eye.svg'
    }
  })
}

darkmodeBtn?.addEventListener('click', () => {
  const currentMode = localStorage.getItem('darkmode') || 'light'
  const newMode = currentMode === 'light' ? 'dark' : 'light'
  localStorage.setItem('darkmode', newMode)
  applyTheme(newMode)
})

window.addEventListener('DOMContentLoaded', () => {
  const savedMode = localStorage.getItem('darkmode') || 'light'
  applyTheme(savedMode)

  const rememberedEmail = localStorage.getItem('rememberedEmail')
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail
    userData.email = rememberedEmail
  }
})

function applyTheme(mode) {
  if (mode === 'light') {
    body.classList.remove('bg-slate-900', 'text-white')
    body.classList.add('bg-white', 'text-black')
  } else {
    body.classList.remove('bg-white', 'text-black')
    body.classList.add('bg-slate-900', 'text-white')
  }
}

emailInput?.addEventListener('input', (e) => {
  userData.email = e.target.value
})

passwordInput?.addEventListener('input', (e) => {
  userData.password = e.target.value
})

loginBtn?.addEventListener('click', async (e) => {
  e.preventDefault()

  if (!userData.email || !userData.password) {
    alert('Fill in all fields')
    return
  }

  try {
    const response = await fetch(
      'https://ilkinibadov.com/api/b/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }
    )

    if (!response.ok) throw new Error('Login failed')

    const data = await response.json()

    sessionStorage.setItem('accessToken', data.accessToken)
    sessionStorage.setItem('refreshToken', data.refreshToken)

    if (rememberMe?.checked) {
      localStorage.setItem('rememberedEmail', userData.email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    window.location.href = './index.html'
  } catch (error) {
    console.error('Login error:', error)
    alert('Login failed. Check your email and password.')
  }
})

async function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem('refreshToken')

  if (!refreshToken) {
    logout()
    return null
  }

  try {
    const res = await fetch(
      'https://ilkinibadov.com/api/b/auth/refresh',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      }
    )

    if (!res.ok) throw new Error('Refresh failed')

    const data = await res.json()

    sessionStorage.setItem('accessToken', data.accessToken)
    sessionStorage.setItem('refreshToken', data.refreshToken)

    return data.accessToken
  } catch (err) {
    console.error('Refresh error:', err)
    logout()
    return null
  }
}

async function authFetch(url, options = {}) {
  let accessToken = sessionStorage.getItem('accessToken')

  if (!accessToken) {
    accessToken = await refreshAccessToken()
    if (!accessToken) return null
  }

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (res.status === 401) {
    accessToken = await refreshAccessToken()
    if (!accessToken) return null

    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`
      }
    })
  }

  return res
}

function logout() {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  window.location.href = './login.html'
}