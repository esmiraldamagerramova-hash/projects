const darkModeBtn = document.getElementById("darkmodeBtn")
let darkMode = false

function initTheme() {
  darkMode = localStorage.getItem("darkmode") === "dark"
  const body = document.getElementById("body")
  
  if (darkMode) {
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")
    if (document.getElementById("darkThumb")) {
      document.getElementById("darkThumb").classList.add("translate-x-6")
    }
  }
}

darkModeBtn.addEventListener("click", () => {
  const body = document.getElementById("body")
  darkMode = !darkMode
  localStorage.setItem("darkmode", darkMode ? "dark" : "light")

  if (darkMode) {
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")
    document.getElementById("darkThumb").classList.add("translate-x-6")
  } else {
    body.classList.remove("bg-slate-900", "text-white")
    body.classList.add("bg-white", "text-black")
    document.getElementById("darkThumb").classList.remove("translate-x-6")
  }
})

function getBlogIdFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get("id")
}

async function loadAuthorData(userId) {
  try {
    const res = await fetch(`https://ilkinibadov.com/api/b/blogs/user/${userId}?limit=1`)
    
    if (!res.ok) {
      console.warn(`Could not load author data: ${res.status}`)
      return null
    }

    const data = await res.json()
    const blogs = data.blogs || []
    
    if (blogs.length > 0) {
      const firstBlog = blogs[0]
      if (firstBlog.author?.name) {
        return { name: firstBlog.author.name }
      } else if (firstBlog.author?.firstname && firstBlog.author?.lastname) {
        return { name: `${firstBlog.author.firstname} ${firstBlog.author.lastname}` }
      } else if (typeof firstBlog.author === 'string') {
        return { name: firstBlog.author }
      }
    }
    
    return null
  } catch (error) {
    console.error("Error loading author data:", error)
    return null
  }
}

async function loadBlog() {
  const blogId = getBlogIdFromUrl()
  
  if (!blogId) {
    console.error("Blog ID not found in URL")
    document.querySelector("main").innerHTML = `
      <div class="max-w-3xl mx-auto px-6 py-16 text-center">
        <p class="text-red-500">Blog not found. ID is missing.</p>
      </div>
    `
    return
  }

  try {
    console.log(`Loading blog with ID: ${blogId}`)
    
    const res = await fetch(`https://ilkinibadov.com/api/b/blogs/blog/${blogId}`)
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const blog = await res.json()
    console.log("Blog loaded:", blog)
    
    let authorData = null
    const authorId = blog.author?._id || blog.author?.id || blog.authorId
    
    if (authorId) {
      authorData = await loadAuthorData(authorId)
      console.log("Author data loaded:", authorData)
    }
    
    renderBlogDetails(blog, authorData)

  } catch (error) {
    console.error("Error fetching blog:", error)
    document.querySelector("main").innerHTML = `
      <div class="max-w-3xl mx-auto px-6 py-16 text-center">
        <p class="text-red-500">Error loading blog. Please try again.</p>
        <p class="text-gray-500 mt-2">${error.message}</p>
        <a href="./index.html" class="text-blue-600 mt-4 inline-block hover:underline">← Back to homepage</a>
      </div>
    `
  }
}

function renderBlogDetails(blog, authorData = null) {
  const main = document.querySelector("main")
  
  const title = blog.title || "No title"
  const category = blog.category || "General"
  
  let authorName = "Unknown author"
  const authorId = blog.author?._id || blog.author?.id || blog.authorId
  
  if (authorData?.name) {
    authorName = authorData.name
  } else if (blog.author?.name) {
    authorName = blog.author.name
  } else if (blog.author?.firstname && blog.author?.lastname) {
    authorName = `${blog.author.firstname} ${blog.author.lastname}`
  } else if (typeof blog.author === 'string') {
    authorName = blog.author
  }
  
  const authorLink = authorId ? `./author.html?id=${authorId}` : "#"
  const date = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Unknown date"
  const image = blog.image || blog.coverImage || "https://via.placeholder.com/800"
  const content = blog.content || blog.body || blog.description || ""

  main.innerHTML = `
    <div class="max-w-3xl mx-auto px-6 py-16 text-gray-700 leading-relaxed">

      <div class="inline-block mb-4">
        <span class="bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-md">
          ${category}
        </span>
      </div>

      <h1 class="text-2xl md:text-3xl font-semibold text-black mb-2">
        ${title}
      </h1>

      <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a href="${authorLink}" class="font-medium text-gray-700 hover:text-blue-600 transition">
          ${authorName}
        </a>
        <span>•</span>
        <span>${date}</span>
      </div>

      <div class="mb-8">
        <img src="${image}" alt="Blog" class="w-full rounded-lg object-cover" onerror="this.src='https://via.placeholder.com/800'">
      </div>

      <div class="prose max-w-none text-gray-700">
        ${content}
      </div>
    </div>
  `
}

window.addEventListener("DOMContentLoaded", () => {
  initTheme()
  loadBlog()
})