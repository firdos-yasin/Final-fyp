
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import FormData from "form-data";
import { v2 as cloudinary } from "cloudinary";
import ai from "../configs/gemini.js";
import fs from "fs";
import { createRequire } from "module";
import { GoogleGenAI } from "@google/genai";
import Replicate from "replicate";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
//ARTCILE GENRATE
const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!prompt) {
            return res.json({ success: false, message: "Prompt is required" });
        }

        if (plan !== 'premium' && free_usage >= 15) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        const response = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt, // ✅ FIXED
                },
            ],
            temperature: 0.7,
            max_tokens: 1024
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'article')
        `;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
    console.log("Status:", error.status);
    console.log("Message:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2)); // ✅ full detail
    res.json({ success: false, message: error.message });
}
};
//BLOG title
export const generateBlogTitle = async (req, res)=>{
    try {
        const { userId } = req.auth();
        const { prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 15) {
            return res.json({success: false, message: "Limit reached. Upgrade to continue."})
        }

        const response = await openai.chat.completions.create({
    model: "gemini-3-flash-preview",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature: 0.7,
    max_tokens: 3000,
});
     
     const content = response.choices[0].message.content

     await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId},
     ${prompt}, ${content}, 'blog-title')`;

     if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata:{
                free_usage: free_usage + 1
            }
        })
     }

     res.json({success: true, content})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}


//generate image


export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        console.log("USER:", userId);
        console.log("PLAN:", plan);

        if (!prompt) {
            return res.json({ success: false, message: "Prompt is required" });
        }

        if (plan !== "premium" && free_usage >= 15) {
            return res.json({
                success: false,
                message: "Limit reached. Upgrade to continue."
            });
        }

        // 🔥 CLEAN PROMPT (IMPORTANT)
      const cleanPrompt = prompt
    .replace("Generate an image of", "")
    .trim();

const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

        console.log("IMAGE:", imageUrl);

        // DB SAVE
        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${imageUrl}, 'image')
        `;

        // usage update
        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({
            success: true,
            image: imageUrl
        });

    } catch (error) {
        console.log("ERROR:", error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
};












//remove background
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {image} = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions."
            });
        }


        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        });

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};



//remove image object
export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const {image} = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions."
            });
        }


        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id,{
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${`Removed  ${object} from image`}, ${imageUrl}, 'image')`;

        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};



//resume
export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions."
            });
        }

        if (!resume) {
            return res.json({
                success: false,
                message: "No resume file uploaded."
            });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({
                success: false,
                message: "Resume file size exceeds allowed size (5MB)."
            });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdfParse(dataBuffer);

        const prompt = `Review the following resume and provide constructive feedback on 
its strengths, weaknesses, and areas of improvement.

Resume Content:

${pdfData.text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};