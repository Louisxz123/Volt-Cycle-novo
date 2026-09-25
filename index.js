import express from "express"
import mysql2 from "mysql2"
import cors from "cors"

const app = express()
app.use(cors())

app.use(express.json())

app.get("/", (request, response) => {
    response.json({
        message: "TCC"
    })
})

app.get("/all-users", (request, response) => {
    const selectCommand = "SELECT * FROM users"

    sql.query(selectCommand, (error, email) => {
        if(error) {
            console.log(error)
            return
        }

        response.json(email)
    })
})

app.post("/create-user", (request, response) => {
    const {email, password} = request.body

    const insertCommand = "INSERT INTO users(email, password) VALUES (?, ?)"

    sql.query(insertCommand, [email, password], (error) => {
        if(error) {
            console.log(error)
            return
        }

        response.status(201).json({
            message: "Usuário cadastrado!"
        })
    })
})

app.listen(3000, () => {
    console.log("vamo ver se funciona")
})  

const sql = mysql2.createPool({
    host: "benserverplex.ddns.net",
    user: "alunos",
    password: "senhaAlunos",
    database: "alunos_garotos"
})