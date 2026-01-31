const container = document.getElementById("myBlogsContainer")
const darkModeBtn = document.getElementById("darkmodeBtn")

let tokenRefreshPromise = null

darkModeBtn?.addEventListener("click", () => {
  const body = document.getElementById("body")
  const darkThumb = document.getElementById("darkThumb")

  const mode =
    localStorage.getItem("darkmode") === "dark" ? "light" : "dark"

  localStorage.setItem("darkmode", mode)

  if (mode === "dark") {
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")
    darkThumb?.classList.add("translate-x-6")
  } else {
    body.classList.remove("bg-slate-900", "text-white")
    body.classList.add("bg-white", "text-black")
    darkThumb?.classList.remove("translate-x-6")
  }
})

window.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("darkmode") || "light"
  if (mode === "dark") {
    const body = document.getElementById("body")
    const darkThumb = document.getElementById("darkThumb")
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-slate-900", "text-white")
    darkThumb?.classList.add("translate-x-6")
  }
})

async function refreshAccessToken() {
  if (tokenRefreshPromise) {
    return tokenRefreshPromise
  }

  tokenRefreshPromise = (async () => {
    try {
      const refreshToken = sessionStorage.getItem("refreshToken")

      if (!refreshToken) {
        clearTokens()
        window.location.href = "./login.html"
        throw new Error("No refresh token available")
      }

      const response = await fetch("https://ilkinibadov.com/api/b/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        throw new Error("Token refresh failed")
      }

      const data = await response.json()
      sessionStorage.setItem("accessToken", data.accessToken)

      if (data.refreshToken) {
        sessionStorage.setItem("refreshToken", data.refreshToken)
      }

      return data.accessToken
    } catch (error) {
      console.error("Token refresh error:", error)
      clearTokens()
      window.location.href = "./login.html"
      throw error
    } finally {
      tokenRefreshPromise = null
    }
  })()

  return tokenRefreshPromise
}

async function getAccessToken() {
  let accessToken = sessionStorage.getItem("accessToken")

  if (!accessToken) {
    accessToken = await refreshAccessToken()
  }

  return accessToken
}

function clearTokens() {
  sessionStorage.removeItem("accessToken")
  sessionStorage.removeItem("refreshToken")
  localStorage.removeItem("rememberedEmail")
}

async function apiCall(url, options = {}) {
  try {
    const accessToken = await getAccessToken()

    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    }

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`
    }

    let response = await fetch(url, {
      ...options,
      headers
    })

    if (response.status === 401) {
      try {
        const newAccessToken = await refreshAccessToken()
        headers["Authorization"] = `Bearer ${newAccessToken}`

        response = await fetch(url, {
          ...options,
          headers
        })
      } catch (error) {
        clearTokens()
        window.location.href = "./login.html"
        throw error
      }
    }

    return response
  } catch (error) {
    console.error("API call error:", error)
    throw error
  }
}

async function deleteBlog(blogId) {
  if (!confirm("Are you sure you want to delete this blog?")) {
    return
  }

  try {
    const response = await apiCall(
      `https://ilkinibadov.com/api/b/blogs/${blogId}`,
      { method: "DELETE" }
    )

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`)
    }

    alert("✓ Blog deleted successfully")
    getMyBlogs()
  } catch (error) {
    console.error("Delete error:", error)
    alert("Failed to delete blog")
  }
}

async function getMyBlogs() {
  try {
    container.innerHTML = `<p>Loading...</p>`

    const res = await apiCall("https://ilkinibadov.com/api/b/blogs/user/me", {
      method: "GET"
    })

    if (!res.ok) {
      if (res.status === 401) {
        clearTokens()
        window.location.href = "./login.html"
        return
      }
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const blogs = data.blogs || []

    if (blogs.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-gray-500">You have no blogs yet</p>
          <a href="./newblog.html" class="text-blue-600 hover:underline mt-2 inline-block">Create your first blog</a>
        </div>
      `
      return
    }

    container.innerHTML = ""

    blogs.forEach(blog => {
      const div = document.createElement("div")
      div.className = "border rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col"

      div.innerHTML = `
        <a href="./blogdetails.html?id=${blog._id || blog.id}" class="flex-grow">
          <img
            src="${blog.image || blog.coverImage || 'https://via.placeholder.com/300'}"
            alt="${blog.title}"
            class="w-full h-[200px] object-cover"
            onerror="this.src='https://via.placeholder.com/300'"
          />
          <div class="p-4">
            <h3 class="font-bold text-lg line-clamp-2">
              ${blog.title}
            </h3>
            <p class="text-sm text-gray-500 line-clamp-2 mt-2">
              ${blog.excerpt || blog.description || ""}
            </p>
          </div>
        </a>

        <div class="p-4 pt-0 flex gap-2">
          <button
            onclick="deleteBlog('${blog._id || blog.id}')"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition"
          >
            Delete
          </button>
          <a
            href="./newblog.html?id=${blog._id || blog.id}"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition text-center"
          >
            Edit
          </a>
        </div>
      `

      container.appendChild(div)
    })

  } catch (err) {
    console.error("Error loading blogs:", err)
    container.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-red-500">Error loading your blogs</p>
        <p class="text-gray-500 text-sm mt-2">${err.message}</p>
        <button onclick="getMyBlogs()" class="text-blue-600 hover:underline mt-4">Try again</button>
      </div>
    `
  }
}

window.addEventListener("DOMContentLoaded", getMyBlogs)