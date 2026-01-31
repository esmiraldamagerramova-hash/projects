const darkModeBtn = document.getElementById("darkmodeBtn")
let darkMode = false

function initTheme() {
  darkMode = localStorage.getItem("darkmode") === "dark"
  const body = document.getElementById("body")

  if (darkMode) {
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")

    const thumb = document.getElementById("darkThumb")
    if (thumb) thumb.classList.add("translate-x-6")
  }
}

darkModeBtn?.addEventListener("click", () => {
  const body = document.getElementById("body")
  darkMode = !darkMode
  localStorage.setItem("darkmode", darkMode ? "dark" : "light")

  const thumb = document.getElementById("darkThumb")

  if (darkMode) {
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")
    thumb?.classList.add("translate-x-6")
  } else {
    body.classList.remove("bg-slate-900", "text-white")
    body.classList.add("bg-white", "text-black")
    thumb?.classList.remove("translate-x-6")
  }
})

function getBlogIdFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get("id")
}

async function loadBlog() {
  const blogId = getBlogIdFromUrl()

  if (!blogId) {
    document.querySelector("main").innerHTML = `
      <div class="max-w-3xl mx-auto px-6 py-16 text-center">
        <p class="text-red-500">Blog not found. ID is missing.</p>
      </div>
    `
    return
  }

  try {
    const res = await fetch(`https://ilkinibadov.com/api/b/blogs/blog/${blogId}`)
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

    const blog = await res.json()

    let authorUsername = "Unknown author"
    
    if (blog.author?.name) {
      authorUsername = blog.author.name
    } else if (blog.author?.username) {
      authorUsername = blog.author.username
    } else if (blog.author?.firstname && blog.author?.lastname) {
      authorUsername = `${blog.author.firstname} ${blog.author.lastname}`
    } else if (blog.author?.email) {
      authorUsername = blog.author.email
    } else if (typeof blog.author === 'string') {
      authorUsername = blog.author
    }

    renderBlogDetails(blog, authorUsername)

  } catch (error) {
    document.querySelector("main").innerHTML = `
      <div class="max-w-3xl mx-auto px-6 py-16 text-center">
        <p class="text-red-500">Error loading blog</p>
        <p class="text-gray-500 mt-2">${error.message}</p>
        <a href="./index.html" class="text-blue-600 mt-4 inline-block hover:underline">
          ← Back to homepage
        </a>
      </div>
    `
  }
}

function renderBlogDetails(blog, authorUsername) {
  const main = document.querySelector("main")

  const title = blog.title || "No title"
  const category = blog.category || "General"
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date"

  const image =
    blog.image ||
    blog.coverImage ||
    "https://via.placeholder.com/800"

  const content =
    blog.content ||
    blog.body ||
    blog.description ||
    ""

  const authorId = blog.author?._id || blog.author?.id
  const authorLink = authorId ? `./author.html?id=${authorId}` : "#"

  main.innerHTML = `
    <div class="max-w-3xl mx-auto px-6 py-16 leading-relaxed">

      <span class="inline-block mb-4 bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-md">
        ${category}
      </span>

      <h1 class="text-2xl md:text-3xl font-semibold mb-2">
        ${title}
      </h1>

      <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a href="${authorLink}" class="font-medium hover:text-blue-600 transition">
          ${authorUsername}
        </a>
        <span>•</span>
        <span>${date}</span>
      </div>

      <img
        src="${image}"
        alt="Blog"
        class="w-full rounded-lg object-cover mb-8"
        onerror="this.src='https://via.placeholder.com/800'"
      >

      <div class="prose max-w-none">
        ${content}
      </div>
    </div>
  `
}

window.addEventListener("DOMContentLoaded", () => {
  initTheme()
  loadBlog()
})