import { refreshTokens } from "./utils.js"

const basketItemsContainer = document.getElementById("basketItemsContainer")
const clearAllBtn = document.getElementById("clearAllBtn")
const totalPrice = document.getElementById("totalPrice")

let productIds = []

const removeItem = async (id) => {
  try {
    const accessToken =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")

    await fetch(`https://ilkinibadov.com/api/v1/basket/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    getBasketItems()
  } catch (error) {
    console.error(error)
  }
}

clearAllBtn.addEventListener("click", async () => {
  for (let id of productIds) {
    await removeItem(id)
  }
  basketItemsContainer.innerHTML = ""
  totalPrice.innerText = ""
  productIds = []
})

const renderBasketItems = (basketItems) => {
  basketItemsContainer.innerHTML = ""
  productIds = []

  basketItems.forEach((item) => {
    productIds.push(item.id)

    const wrapper = document.createElement("div")
    wrapper.classList.add("w-full")

    const imageBox = document.createElement("div")
    imageBox.classList.add("relative","group","w-full","bg-[#F5F5F5]","flex","justify-center","items-center","rounded-md","aspect-square")

    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add("absolute","top-3","right-3","bg-white","rounded-full","p-2","shadow","hover:bg-gray-100","transition")

    deleteBtn.innerHTML = `<img src="./assets/icon/trash.svg" class="w-4 h-4" />`

    deleteBtn.addEventListener("click", () => removeItem(item.id))

    const img = document.createElement("img")
    img.src = item.image
    img.classList.add("w-[120px]","h-[130px]","sm:w-[145px]","sm:h-[165px]","object-scale-down")

    imageBox.append(deleteBtn, img)

    const title = document.createElement("h3")
    title.innerText = `${item.title} (${item.count})`
    title.classList.add("text-sm","sm:text-base","text-black","font-semibold","mt-3","truncate")

    const price = document.createElement("p")
    price.innerText = `${item.currency}${item.total}`
    price.classList.add("text-sm","sm:text-base","font-semibold","text-[#DB4444]","mt-1")

    wrapper.append(imageBox, title, price)
    basketItemsContainer.append(wrapper)
  })
}

const getBasketItems = async () => {
  try {
    const accessToken =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")

    const res = await fetch(
      "https://ilkinibadov.com/api/v1/basket/products",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (res.status === 401) {
    refreshTokens(getBasketItems)
    return
    }
    if (res.ok) {
      const data = await res.json()

      totalPrice.innerText = `Total Price: ${data.currency || "$"}${data.basketTotal}`
      renderBasketItems(data.content)
    }
  } catch (error) {
    console.error(error)
  }
}

window.addEventListener("DOMContentLoaded", getBasketItems)
