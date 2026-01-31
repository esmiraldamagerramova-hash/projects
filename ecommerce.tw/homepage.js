const homeContainer = document.getElementById('homeContainer')
const darkmodeBtn = document.getElementById("darkmodeBtn")
const categoriesContainer = document.getElementById("categoriesContainer")
const productsTitle = document.getElementById("productsTitle")
const searchInput = document.getElementById("searchInput")
const viewMoreBtn = document.getElementById('viewMoreBtn')

let selectedCategory = ''
let searchTerm = ''
let limit = 8
let activeButton = null

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value
        selectedCategory = ''
        limit = 8
        productsTitle.innerText = searchTerm || "Explore Our Products"
        getAllProducts()
    })
}

const categories = [
    'electronics','clothing','books','furniture','toys','groceries','beauty','sports','automotive','other']

categories.forEach(category => {
    const button = document.createElement("button")
    button.innerText = category
    button.classList.add("border","p-5","rounded-lg","hover:cursor-pointer","hover:bg-[#DB4444]","hover:text-white")

    button.addEventListener("click", () => {
        if (activeButton) {
            activeButton.classList.remove("bg-[#DB4444]", "text-white", "border-[#DB4444]")
        }

        button.classList.add("bg-[#DB4444]", "text-white", "border-[#DB4444]")
        activeButton = button

        selectedCategory = category
        searchTerm = ''
        limit = 8
        productsTitle.innerText = category.toUpperCase()
        getAllProducts()
    })

    categoriesContainer.append(button)
})


if (darkmodeBtn) {
    darkmodeBtn.addEventListener("click", () => {
        const darkmode = localStorage.getItem("darkmode")
        localStorage.setItem("darkmode", darkmode === "light" ? "dark" : "light")

        applyTheme()
    })
}

function applyTheme() {
    const body = document.getElementById("body")
    const mode = localStorage.getItem("darkmode") || "light"

    if (mode === "light") {
        body.classList.remove("bg-slate-900", "text-white")
        body.classList.add("bg-white", "text-black")
    } else {
        body.classList.remove("bg-white", "text-black")
        body.classList.add("bg-slate-900", "text-white")
    }
}


viewMoreBtn.addEventListener("click", () => {
    limit += 8
    getAllProducts()
})


async function getAllProducts() {
    try {
        let url = ""

        if (!selectedCategory && !searchTerm) {
            url = `https://ilkinibadov.com/api/v1/products?page=1&limit=${limit}`
        }

        if (selectedCategory) {
            url = `https://ilkinibadov.com/api/v1/products/category/${selectedCategory}`
        }

        if (searchTerm.length >= 3) {
            url = `https://ilkinibadov.com/api/v1/search?searchterm=${searchTerm}`
        }

        homeContainer.innerHTML = ""

        const res = await fetch(url)

        if (res.status === 404) {
            const h2 = document.createElement("h2")
            h2.innerText = "No product found"
            homeContainer.append(h2)
            return
        }

        if (res.ok) {
            const data = await res.json()

            let products = data.products || data.data || data || []

            if (searchTerm.length >= 3) {
                products = data.content || []
            }

            const total = data.totalProducts || products.length

            if (limit >= total) {
                viewMoreBtn.classList.add("hidden")
            } else {
                viewMoreBtn.classList.remove("hidden")
            }

            renderItems(products.slice(0, limit))
        }
    } catch (error) {
        console.error(error)
    }
}

function renderItems(products) {
    products.forEach(product => {
        const div = document.createElement("div")
        const img = document.createElement("img")
        const h3 = document.createElement("h3")
        const p = document.createElement("p")
        const span = document.createElement("span")
        const a = document.createElement("a")

        img.src = product.image || product.images?.[0]
        img.classList.add("size-50", "object-contain", "mx-auto")

        h3.innerText = product.title
        h3.classList.add("font-bold", "mt-2")

        p.innerText = product.description?.slice(0, 55) || ""
        p.classList.add("text-xs", "my-2")

        span.innerText = `${product.currency}${product.price}`
        span.classList.add("text-red-500", "font-semibold")

        div.classList.add("border","border-zinc-300","px-3","py-2","rounded-md","shadow-xl","flex","flex-col", "w-full", "h-full")
        a.classList.add("w-full", "h-full")
        a.href = `http://127.0.0.1:5500/product.html?id=${product._id || product.id}`

        div.append(img, h3, p, span)
        a.append(div)
        homeContainer.append(a)
    })
}

window.addEventListener("DOMContentLoaded", () => {
    applyTheme()
    getAllProducts()
})
