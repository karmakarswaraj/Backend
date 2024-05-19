//const express= require('express') OR
import express from 'express'

const app = express()

const port = 3000

app.get("/", (req,res) => {
    res.send("Hello king welcome to express")
})
app.get("/demo", (req,res) => {
    res.send("Hello king welcome to demo")
})
app.get("/new", (req,res) => {
    res.send("Hello king welcome to new")
})

app.listen(port, () => {
    console.log(`Server is running at ${port}...`)
})