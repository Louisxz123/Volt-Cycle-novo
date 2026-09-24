import express from "express"
import mysql2 from "mysql2"
import cors from "cors"

const app = express()
app.use(cors())

app.use(express.json())

app.get("/", (request, response) => {
    response.json({
        message: "CRUD de filmes"
    })
})

app.get("/all-films", (request, response) => {
    const selectCommand = "SELECT * FROM filmes_LuizF"

    sql.query(selectCommand, (error, titulo) => {
        if(error) {
            console.log(error)
            return
        }

        response.json(titulo)
    })
})

app.post("/create-film", (request, response) => {
    const {titulo, genero, duracao, classificacao} = request.body

    const insertCommand = "INSERT INTO filmes_LuizF(titulo, genero, duracao, classificacao) VALUES (?, ?, ?, ?)"

    sql.query(insertCommand, [titulo, genero, duracao, classificacao], (error) => {
        if(error) {
            console.log(error)
            return
        }

        response.status(201).json({
            message: "Filme cadastrado seu bosta!"
        })
    })
})

app.delete("/delete-film/:id", (request,response)=> {
    const {id} = request.params

    const deleteCommand = "DELETE FROM filmes_LuizF WHERE id = ?"

    sql.query(deleteCommand, [id], (error) => {
        if(error) {
            console.log(error)
            return
        }

        response.json({
            message: "Filme deletado seu bosta!"
        })
    })
})

app.put("/update-film/:id", (request, response) => {
    const { id } = request.params
    const { titulo, genero, duracao, classificacao } = request.body

    let updateCommand
    let valores
    
    if(titulo && genero && duracao && classificacao) {
    updateCommand = "UPDATE filmes_LuizF SET titulo = ?, genero = ?, duracao = ?, classificacao = ? WHERE id = ?"
    valores = [titulo, genero, duracao, classificacao, id]

     } else if(titulo && genero && duracao) {
        updateCommand = "UPDATE filmes_LuizF SET titulo = ?, genero = ?, duracao = ? WHERE id = ?"
        valores = [titulo, genero, duracao, id]
        } else {
        return response.status(400).json({ error: "Envie pelo menos titulo, genero, duracao e faixa etaria" })
    }

    sql.query(updateCommand, valores, (error) => {
        if(error) {
            console.log(error)
            return response.status(500).json({ error: "Erro ao atualizar o filme" })
        }

        response.json({
            message: "Filme atualizado com sucesso!"
        })
    })
})

app.listen(3000, () => {
    console.log("CRUD de filmes funcionando babaca!")
})  

const sql = mysql2.createPool({
    host: "benserverplex.ddns.net",
    user: "alunos",
    password: "senhaAlunos",
    database: "alunos_garotos"
})