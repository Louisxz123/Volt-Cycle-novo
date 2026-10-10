const form = document.getElementById("loginForm")
const message = document.querySelector(".form-message")

form.addEventListener("submit", async (event) => {
    event.preventDefault()
    const submitButton = form.querySelector("button")
    submitButton.disabled = true
    message.textContent = ""

    const usuario = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim()
    }

    try {
        const resposta = await fetch("http://localhost:3000/user-login", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(usuario)
        })
        const dados = await resposta.json()
        if (!resposta.ok) throw new Error(dados.message || "Não foi possível fazer login.")

         window.VoltCycleAuth.setAuth(dados)
        window.location.href = "../index.html"
    } catch (error) {
        message.textContent = error.message
        submitButton.disabled = false
    }
})