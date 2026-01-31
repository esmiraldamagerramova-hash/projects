const emailInput = document.getElementById('emailInput')
const passwordInput = document.getElementById('passwordInput')
const loginBtn = document.getElementById('loginBtn')
const loginInput = document.getElementById('loginInput')
const rememberMe = document.getElementById('RememberMe') || document.getElementById('rememberMe')
const eyeIcon = document.getElementById('eyeIcon')
const darkmodeBtn = document.getElementById("darkmodeBtn")
const body = document.getElementById("body")

if(eyeIcon && passwordInput){
  eyeIcon.addEventListener("click", () => {
    if(passwordInput.type === "password"){
      passwordInput.type = "text"
      eyeIcon.src = "./assets/icon/eye-closed.svg"
    } else {
      passwordInput.type = "password"
      eyeIcon.src = "./assets/icon/eye.svg"
    }
  })
}

if(darkmodeBtn && body){
  darkmodeBtn.addEventListener("click", () => {
    const darkmode = localStorage.getItem("darkmode")
    localStorage.setItem("darkmode", darkmode === "light" ? "dark" : "light")

    const currentMode = localStorage.getItem("darkmode")

    if(currentMode === "light"){
      body.classList.remove("bg-slate-900","text-white")
      body.classList.add("bg-white","text-black")
    } else{
      body.classList.remove("bg-white","text-black")
      body.classList.add("bg-slate-900","text-white")
    }
  })
}

window.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("darkmode") || "light"
  if(savedMode === "light"){
    body.classList.remove("bg-slate-900","text-white")
    body.classList.add("bg-white","text-black")
  } else{
    body.classList.remove("bg-white","text-black")
    body.classList.add("bg-slate-900","text-white")
  }
})

let userData = {}

emailInput.addEventListener("input", (e) => {
  userData = {...userData, email: e.target.value}
})

passwordInput.addEventListener("input", (e) => {
  userData = {...userData, password: e.target.value}
})

const loginUser = async () => {
  try {
    const res = await fetch("https://ilkinibadov.com/api/v1/auth/login",{
      method: "POST",
      body: JSON.stringify(userData),
      headers: {"Content-type":"application/json"}
    })

    if(res.ok){
      const data = await res.json()
      localStorage.clear()
      sessionStorage.clear()

      const rememberChecked = (rememberMe && rememberMe.checked) || false

      if(rememberChecked){
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
      } else{
        sessionStorage.setItem("accessToken", data.accessToken)
        sessionStorage.setItem("refreshToken", data.refreshToken)
      }

      window.location.href = "http://127.0.0.1:5501/homepage.html"
    } else{
      alert("Email or password is incorrect!")
    }

  } catch (error){
    console.error(error)
  }
}

if(loginBtn) loginBtn.addEventListener("click", loginUser)
if(loginInput) loginInput.addEventListener("click", loginUser)
