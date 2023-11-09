// // const http=require("http")
// import http from "http";
// // console.log("hello");
// import path from "path";
// // console.log(path.dirname("/index.js"));

// const server=http.createServer((req,res)=>{
//     if(req.url==="/")
//     {
//         res.end("<h1>Home page</h1>")
//     }
//     else if(req.url==="/about")
//     {
//         res.end("<h1>About Page</h1>")
//     }
//     else
//     {
//         res.end("<h1>No Such Page Found</h1>")
//     }
// })

// server.listen(5000,()=>{
//     console.log("Server is working");
// })

import express from "express";

import path from "path";

import mongoose from "mongoose";
import { name } from "ejs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017",{
dbName:"backend"
}).then(()=>console.log("Database connected")).catch((e)=>console.log(e))

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const User=mongoose.model("user",userSchema)

const server=express();
// Using middlewares 
server.use(express.static(path.join(path.resolve(),"public")))
server.use(express.urlencoded({extended:true}))
server.use(cookieParser())

server.set("view engine","ejs")
const isAuthenticated= async (req,res,next)=>{
    // res.sendStatus(404)
    // res.json({
    //     success:true,
    //     products:[]
    // })
    
    // res.status(400).send("Meri waali alag hai")
    // const pathlocation=path.resolve();
    // res.sendFile(path.join(pathlocation,"./index.html"))
    const {token}=req.cookies;
    if(token)
    {
        const decoded=jwt.verify(token,"fhcccuyfufuyf")
        
        req.user=await User.findById(decoded._id)
        next();
    }
    else
    {
        res.redirect("login")  
    }
    
    // res.sendFile("index")
    
    }
server.get("/",isAuthenticated,(req,res)=>{
    res.render("logout",{name:req.user.name}) 
})
server.get("/register",(req,res)=>{

    res.render("register") 
})
server.get("/login",(req,res)=>{
res.render("login")
})
// server.get("/add",(req,res)=>{
//     Message.create({name:"Animesh",email:"sample@gmail.com"}).then(()=>{
//         res.send("Nice")
//     })
//     res.send("Nice")
// })
// server.post("/contact",async (req,res)=>{
//     const {name,email}=req.body;
//     await Message.create({name,email})
//     res.redirect("/success")
// })
// server.post("/",(req,res)=>{
//     console.log(req.body);
//     })

server.post("/login", async (req,res)=>{
    const {email,password}=req.body;

    let user= await User.findOne({email});
    if(!user)
    {
return res.redirect("/register")
    }

    //  user=await User.create({name,email})
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch)
    {
        return res.render("login",{email,message:"wrong Password"})
    }
    const token=jwt.sign({_id:user._id},"fhcccuyfufuyf")
    
res.cookie("token",token,{httpOnly:true,expires:new Date(Date.now()+60*1000)})

res.redirect("/")
})
server.post("/register",async (req,res)=>{
    const {name,email,password}=req.body;
    let user=await User.findOne({email})
    if(user)
    {
        return res.redirect("/login")
    }
    const hashedPassword=await bcrypt.hash(password,10)
    user=await User.create({name,email,password:hashedPassword})
    const token=jwt.sign({_id:user._id},"fhcccuyfufuyf")
    
res.cookie("token",token,{httpOnly:true,expires:new Date(Date.now()+60*1000)})

res.redirect("/")

})
server.get("/logout",(req,res)=>{
    res.cookie("token",null,{httpOnly:true,expires:new Date(Date.now())})
    res.redirect("/")
    })
server.listen(3000,()=>{
    console.log("Server is workingg");
})
