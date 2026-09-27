const form = document.getElementById("signupForm")
const message = document.querySelector(".form-message")

form.addEventListener("submit", async (event) => {
    event.preventDefault()
    const submitButton = form.querySelector("button")
    submitButton.disabled = true
    message.textContent = ""

    const usuario = {
        nome: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        senha: document.getElementById("password").value.trim()
    }

    try {
        const resposta = await fetch("http://localhost:3000/create-user", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(usuario)
        })
        const dados = await resposta.json()
        if (!resposta.ok) throw new Error(dados.error || "Não foi possível cadastrar o usuário.")
        window.location.href = "../index.html"
    } catch (error) {
        message.textContent = error.message
        submitButton.disabled = false
    }
})