import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { validationResult } from "express-validator"
import UserSchema from "../models/user.js"


export const register = async (req, res) => {
    try {
        const Error = validationResult(req)
        if (!Error.isEmpty()) {
            return res.status(400).json(Error.array())
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const doc = new UserSchema({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash,
            avatarUrl: req.body.avatarUrl,
        })
        const user = await doc.save()
        const token = jwt.sign(
            {
                _id: user._id,
            },
            "secret",
            {
                expiresIn: '30d',
            }
        );
        const { passwordHash, ...userData } = user._doc
        res.json({ ...userData, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Не удалось зарегистрироваться" })
    }
}

export const login = async (req, res) => {
    try {
        const user = await UserSchema.findOne({ email: req.body.email });

        if (!user) {
            return req.status(404).json({
                massage: 'Пользователь не найден !'
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return req.status(403).json({
                massage: 'Неверный логин или пароль !'
            })
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            "secret",
            {
                expiresIn: '30d',
            }
        );

        const { passwordHash, ...userData } = user._doc
        res.json({ ...userData, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Не удалось авторизоваться" })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.userId);
        if (!user) {
            res.status(404).json({ massage: "Такого пользователья нет" })
        }
        const { passwordHash, ...userData } = user._doc
        res.json(userData)
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Нет доступа " })
    }
}