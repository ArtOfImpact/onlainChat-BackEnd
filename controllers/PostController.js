import { request } from "http";
import PostSchema from "../models/post.js"

export const All = async (req, res) => {
    try {
        const posts = await PostSchema.find().populate("user").exec();

        res.json(posts);
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Не возможно получить посты!" })
    }
}

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostSchema.find().limit(5).exec();
        const tags = posts.map(el => el.tags).flat().slice(0, 5)
        res.json(tags);
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Не возможно получить посты!" })
    }
}


export const One = async (req, res) => {
    try {
        const postId = req.params.id;
        PostSchema.findOneAndUpdate(
            {
                _id: postId
            },
            {
                $inc: { viewsCount: 1 }
            },
            {
                returnDocument: "after"
            },
            (err, doc) => {
                if (err) {
                    console.log(error)
                    return res.status(500).json({ massage: "Не возможно получить пост!" })
                }
                if (!doc) {
                    return res.status(404).json({ massage: "Статья не найдена!" })
                }
                res.json(doc)
            }
        ).populate("user")
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Не возможно получить посты!" })
    }
}

export const removeOne = async (req, res) => {
    try {
        const postId = req.params.id;
        PostSchema.findOneAndDelete(
            { _id: postId },
            (err, doc) => {
                if (err) {
                    res.status(500).json({ massage: "Не возможно удалить пост!" })
                }
                if (!doc) {
                    res.status(404).json({ massage: "Пост не найден!" })
                }
                res.json({
                    success: true
                })
            }
        )
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Не возможно удалить посты!" })
    }
}

export const Create = async (req, res) => {
    try {
        const doc = new PostSchema({
            title: req.body.title,
            text: req.body.text,
            tags: req.body.tags.split(','),
            user: req.userId,
            imageUrl: req.body.imageUrl,
        });

        const post = await doc.save();

        res.json(post);
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Не возможно  создать пост!" })
    }
};

export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        await PostSchema.updateOne(
            { _id: postId },
            {
                title: req.body.title,
                text: req.body.text,
                tags: req.body.tags.split(','),
                user: req.userId,
                imageUrl: req.body.imageUrl,
            },
            res.json({
                success: true
            })
        )
    } catch (error) {
        res.status(500).json({ massage: "Не возможно  обновить  пост!" })
    }
}