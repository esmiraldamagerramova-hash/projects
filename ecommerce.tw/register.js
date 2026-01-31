const firstNameInput = document.getElementById('firstNameInput')
const lastNameInput = document.getElementById('lastNameInput')
const emailInput = document.getElementById('emailInput')
const passwordInput = document.getElementById('passwordInput')
const createAccountBtn = document.getElementById('createAccountBtn')

let userData = {}

firstNameInput.addEventListener("input", (e) => {
    userData = {
        ...userData,
        first_name: e.target.value
    }
})

lastNameInput.addEventListener("input", (e) => {
    userData = {
        ...userData,
        last_name: e.target.value
    }
})

emailInput.addEventListener("input", (e) => {
    userData = {
        ...userData,
        email: e.target.value
    }
})

passwordInput.addEventListener("input", (e) => {
    userData = {
        ...userData,
        password: e.target.value
    }
})

const registerUser = async () => {
    try {
        const res = await fetch("https://ilkinibadov.com/api/v1/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })

        if (res.ok) {
            const data = await res.json()
            console.log(data)
            window.location.href = "./index.html"
        } else {
            alert("Registration failed!")
        }

    } catch (error) {
        console.error(error)
    }
}

createAccountBtn.addEventListener("click", (e) => {
    registerUser()
})
