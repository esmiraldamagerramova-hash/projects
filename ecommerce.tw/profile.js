import { refreshAccessToken } from "./utils.js" 
const container = document.getElementById("container")

async function getUserInfo () {
    try {
        const accessToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken")
        const res = await fetch("https://ilkinibadov.com/api/v1/auth/me", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })

        console.log(res);

        if(res.status === 401){
            refreshAccessToken(getUserInfo)
        }

        if(res.ok){
            const data = await res.json()
            container.innerText = JSON.stringify(data)
        }
    } catch (error) {
        console.error(error)
    }
}
getUserInfo()
