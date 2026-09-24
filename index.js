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
app.listen(3000, () => {
    console.log("vamo ver se funciona")
})  

const sql = mysql2.createPool({
    host: "benserverplex.ddns.net",
    user: "alunos",
    password: "senhaAlunos",
    database: "alunos_garotos"
})