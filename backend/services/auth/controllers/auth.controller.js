import redis from "../../../shared/redis/redis.js"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import { getAuth } from "firebase-admin/auth"

export const login=async(req, res)=>{
    try{
        const{token}=req.body
        const decoded=await getAuth(app).verifyIdToken(token)
        let user=await User.findOne({fireBaseUid:decoded.uid})

        if(!user){
            user=await User.create({
                fireBaseUid:decoded.uid,
                email:decoded.email,
                name:decoded.name,
                avatar:decoded.picture
            })
        }

        const sessionId = crypto.randomUUID()
        await redis.set(`user-session-${user?._id}`,
            sessionId
            , "EX", 7 * 24 * 60 * 60)
        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            credits:user.credits
        }), "EX", 7 * 24 * 60 * 60)

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)

    }catch(error){
        return res.status(500).json({ message: `login error ${error}` })
    }
}

export const logOut = async (req, res) => {
    try {
        const sessionId = req.cookies?.session
        await redis.del(`session-${sessionId}`)

        res.clearCookie("session")
        return res.status(200).json({ message: "logout successfully" })
    } catch (error) {
        return res.status(500).json({ message: `logout error ${error}` })
    }
}