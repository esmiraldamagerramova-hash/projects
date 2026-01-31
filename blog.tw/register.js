const body = document.getElementById("body");

const nameInput = document.getElementById("nameInput");
const surnameInput = document.getElementById("surnameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const registerBtn = document.getElementById("registerBtn");
const eyeIcon = document.getElementById("eyeIcon");
const darkmodeBtn = document.getElementById("darkmodeBtn");

if (eyeIcon && passwordInput) {
  eyeIcon.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    eyeIcon.src = isPassword
      ? "./assets/icons/eye-closed.svg"
      : "./assets/icons/eye.svg";
  });
}

darkmodeBtn.addEventListener("click", () => {
  const current = localStorage.getItem("darkmode") || "light";
  const next = current === "light" ? "dark" : "light";
  localStorage.setItem("darkmode", next);
  applyTheme(next);
});

const applyTheme = (mode) => {
  if (mode === "dark") { 
    body.classList.remove("bg-white", "text-black");
    body.classList.add("bg-slate-900", "text-white");
  } else {
    body.classList.remove("bg-slate-900", "text-white");
    body.classList.add("bg-white", "text-black");
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("darkmode") || "light";
  applyTheme(saved);
});

const registerUser = async () => {
  const userData = {
    firstname: nameInput.value.trim(),
    lastname: surnameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value.trim()
  };

  if (
    !userData.firstname ||
    !userData.lastname ||
    !userData.email ||
    !userData.password
  ) {
    alert("Fill in all fields");
    return;
  }

  try {
    console.log("SEND:", userData);

    const res = await fetch(
      "https://ilkinibadov.com/api/b/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      }
    );

    if (!res.ok) {
      throw new Error("Registration failed");
    }

    const data = await res.json();
    console.log("SUCCESS:", data);

    window.location.href = "http://127.0.0.1:5502/login.html";

  } catch (error) {
    console.error(error.message);
    alert(error.message);
  }
};

registerBtn.addEventListener("click", (e) => {
  e.preventDefault();
  registerUser();
});
