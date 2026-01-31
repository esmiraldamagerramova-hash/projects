const titleInput = document.getElementById('title')
const categorySelect = document.getElementById('category')
const thumbnailInput = document.getElementById('thumbnail')
const thumbnailLabel = document.getElementById('thumbnailLabel')
const bodyInput = document.getElementById('bodyInput')
const submitBtn = document.getElementById('submitBtn')
const form = document.getElementById('blogForm')
const darkmodeBtn = document.getElementById('darkmodeBtn')
const bodyElement = document.getElementById('body')

let blogData = {
  title: "",
  category: "",
  description: "",
  image: ""
}

const getToken = () => {
  return sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken")
}

titleInput?.addEventListener("input", e => {
  blogData.title = e.target.value
})

categorySelect?.addEventListener("change", e => {
  blogData.category = e.target.value
})

bodyInput?.addEventListener("input", e => {
  blogData.description = e.target.value
})

thumbnailInput?.addEventListener("change", e => {
  const file = e.target.files[0]
  if (!file) return

  blogData.image = file.name
  thumbnailLabel.textContent = file.name
})

const getCategories = async () => {
  try {
    const res = await fetch("https://ilkinibadov.com/api/b/blogs/categories")
    if (!res.ok) throw new Error(res.status)

    const categories = await res.json()
    categorySelect.innerHTML = `<option value="" disabled selected hidden>Select category</option>`

    categories.forEach(cat => {
      const option = document.createElement("option")
      option.value = cat
      option.textContent = cat
      categorySelect.appendChild(option)
    })

  } catch (err) {
    console.error("Category error:", err)
  }
}

const submitRequest = async () => {
  const token = getToken()

  if (!token) {
    alert("Please login again")
    window.location.href = "./login.html"
    return
  }

  if (!blogData.title || !blogData.category || !blogData.description) {
    alert("Fill all required fields")
    return
  }

  try {
    const res = await fetch("https://ilkinibadov.com/api/b/blogs", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(blogData)
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || `Error: ${res.status}`)
    }

    alert("✓ Blog created successfully")
    resetForm()
    window.location.href = "./myblogs.html"

  } catch (err) {
    console.error("Submit error:", err)
    alert(`Failed to create blog: ${err.message}`)
  }
}

form?.addEventListener("submit", e => {
  e.preventDefault()
  submitRequest()
})

const resetForm = () => {
  blogData = { title: "", category: "", description: "", image: "" }
  form.reset()
  thumbnailLabel.textContent = "Choose image"
}

darkmodeBtn?.addEventListener("click", () => {
  const mode = localStorage.getItem("darkmode") === "dark" ? "light" : "dark"
  localStorage.setItem("darkmode", mode)
  applyTheme(mode)
})

window.addEventListener("DOMContentLoaded", () => {
  applyTheme(localStorage.getItem("darkmode") || "light")
  getCategories()
})

function applyTheme(mode) {
  if (mode === "dark") {
    bodyElement.classList.add("bg-slate-900", "text-white")
    bodyElement.classList.remove("bg-white", "text-black")
    const thumb = document.getElementById("darkThumb")
    if (thumb) thumb.classList.add("translate-x-6")
  } else {
    bodyElement.classList.add("bg-white", "text-black")
    bodyElement.classList.remove("bg-slate-900", "text-white")
    const thumb = document.getElementById("darkThumb")
    if (thumb) thumb.classList.remove("translate-x-6")
  }
}