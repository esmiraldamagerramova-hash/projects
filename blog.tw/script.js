const darkModeBtn = document.getElementById("darkmodeBtn")
const homeContainer = document.getElementById("homeContainer")
const loadMoreBtn = document.getElementById("viewMoreBtn")
const searchInput = document.getElementById("searchInput")
const mainBlog = document.getElementById("mainBlog")

let searchTerm = ""
let selectedCategory = ""
let currentPage = 1
let limit = 7
let firstBlogRendered = false

darkModeBtn.addEventListener("click", () => {
  const body = document.getElementById("body")
  const darkThumb = document.getElementById("darkThumb")

  const mode =
    localStorage.getItem("darkmode") === "dark" ? "light" : "dark"

  localStorage.setItem("darkmode", mode)

  if (mode === "dark") {
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")
    darkThumb.classList.add("translate-x-6")
  } else {
    body.classList.remove("bg-slate-900", "text-white")
    body.classList.add("bg-white", "text-black")
    darkThumb.classList.remove("translate-x-6")
  }
})

window.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("darkmode") || "light"
  if (mode === "dark") {
    const body = document.getElementById("body")
    const darkThumb = document.getElementById("darkThumb")
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")
    darkThumb.classList.add("translate-x-6")
  }
  getAllBlogs()
})

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value
  currentPage = 1
  firstBlogRendered = false
  getAllBlogs()
})

loadMoreBtn.addEventListener("click", () => {
  currentPage++
  getAllBlogs(true)
})

async function getAllBlogs(append = false) {
  try {
    let url = `https://ilkinibadov.com/api/b/blogs?page=${currentPage}&limit=${limit}`

    if (selectedCategory) {
      url += `&category=${selectedCategory}`
    }
    if (searchTerm.length >= 3) {
      url += `&search=${encodeURIComponent(searchTerm)}`
    }

    if (!append) {
      homeContainer.innerHTML = `<p class="col-span-full text-center">Loading...</p>`
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error("No blogs")

    const data = await res.json()
    const blogs = data.blogs || data.data || []

    if (!append) homeContainer.innerHTML = ""

    if (blogs.length === 0) {
      loadMoreBtn.classList.add("hidden")
      return
    }

    renderBlogs(blogs, append)

    blogs.length < limit
      ? loadMoreBtn.classList.add("hidden")
      : loadMoreBtn.classList.remove("hidden")

  } catch (err) {
    console.error(err)
    homeContainer.innerHTML = `<p class="col-span-full text-center text-red-500">Error loading blogs</p>`
  }
}

function renderBlogs(blogs, append) {

  if (!firstBlogRendered && blogs.length > 0) {
    renderHeroBlog(blogs[0])
    firstBlogRendered = true
    blogs = blogs.slice(1)
  }

  blogs.forEach(blog => {
    const a = document.createElement("a")
    a.href = `./blogdetails.html?id=${blog._id || blog.id}`
    a.className = "group"

    a.innerHTML = `
      <div class="w-full h-full border rounded-xl overflow-hidden hover:shadow-lg transition">
        <img
          src="${blog.image || blog.coverImage || 'https://via.placeholder.com/300'}"
          class="w-full h-[220px] object-cover"
          onerror="this.src='https://via.placeholder.com/300'"
        />
        <div class="p-5">
          <span class="text-xs bg-blue-600 text-white px-3 py-1 rounded-md inline-block mb-3">
            ${blog.category || "General"}
          </span>
          <h3 class="font-bold text-lg mb-2 group-hover:underline line-clamp-2">
            ${blog.title}
          </h3>
          <p class="text-sm text-gray-500 line-clamp-2">
            ${blog.excerpt || blog.description || ""}
          </p>
        </div>
      </div>
    `
    homeContainer.appendChild(a)
  })
}

function renderHeroBlog(blog) {
  mainBlog.classList.remove("hidden")

  const authorName = blog.author?.name || 
                     blog.author?.username || 
                     (blog.author?.firstname && blog.author?.lastname 
                       ? `${blog.author.firstname} ${blog.author.lastname}` 
                       : "Author")

  mainBlog.innerHTML = `
    <a href="./blogdetails.html?id=${blog._id || blog.id}">
      <div class="relative rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer">
        <img
          src="${blog.image || blog.coverImage || 'https://via.placeholder.com/800'}"
          class="w-full h-[500px] object-cover"
          onerror="this.src='https://via.placeholder.com/800'"
        />

        <div class="absolute inset-0 flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/60 to-transparent">
          <span class="bg-blue-600 text-sm font-medium px-3 py-1 rounded-md w-max mb-3">
            ${blog.category || "General"}
          </span>
          <h2 class="text-3xl font-bold mb-2">
            ${blog.title}
          </h2>
          <div class="text-sm text-gray-200">
            <span>${authorName}</span> •
            <span>${new Date(blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </div>
    </a>
  `
}

document.querySelectorAll(".footer-category").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault()

    selectedCategory = link.dataset.category
    searchTerm = ""
    currentPage = 1
    firstBlogRendered = false

    searchInput.value = ""
    getAllBlogs()
  })
})