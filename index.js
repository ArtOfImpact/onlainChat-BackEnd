import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import cors from "cors"
import mongoose from "mongoose"
import { registerValidator, loginValidator, postCreateValidator } from "./validation/auth.js"
import { validationResult } from "express-validator"
import UserSchema from "./models/user.js"
import chekAuth from "./utils/chekAuth.js"
import { register, login, getMe } from './controllers/UserController.js'
import { Create, All, One, removeOne, updatePost, getLastTags } from './controllers/PostController.js'
import multer from "multer"

//'mongodb+srv://admin:738733@cluster0.csusu6s.mongodb.net/blog?retryWrites=true&w=majority'

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("DB OK")
}).catch((err) => {
    console.log("DB error", err)
})

const App = express();


const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, "upload")
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage });

App.use(express.json())
App.use(cors());

App.use("/upload", express.static("upload"))

App.post("/auth/login", loginValidator, login);
App.post("/auth/register", registerValidator, register);
App.get('/auth/me', chekAuth, getMe);

App.post("/upload", chekAuth, upload.single("image"), (req, res) => {
    res.json({
        url: `/upload/${req.file.originalname}`
    })
})

App.post('/post', chekAuth, postCreateValidator, Create);
App.get('/post', All);
App.get('/tags', getLastTags);
App.get('/post/:id', One);
App.delete('/post/:id', chekAuth, removeOne);
App.patch('/post/:id', chekAuth, postCreateValidator, updatePost);


App.listen(process.env.PORT || 4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log("Server OK");
})