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

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// ARTICLE GENERATE
export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;

        if (!prompt) {
            return res.json({ success: false, message: "Prompt is required" });
        }

        const response = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1024
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'article')
        `;

        res.json({ success: true, content });

    } catch (error) {
        console.log("Status:", error.status);
        console.log("Message:", error.message);
        console.log("Full error:", JSON.stringify(error, null, 2));
        res.json({ success: false, message: error.message });
    }
};

// BLOG TITLE
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;

        const response = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
        `;

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// GENERATE IMAGE (PREMIUM ONLY)
export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (!prompt) {
            return res.json({ success: false, message: "Prompt required" });
        }

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." });
        }

        const form = new FormData();
        form.append('prompt', prompt);

        const response = await axios.post(
            'https://clipdrop-api.co/text-to-image/v1',
            form,
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                    ...form.getHeaders(),
                },
                responseType: 'arraybuffer',
            }
        );

        const base64Image = Buffer.from(response.data).toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${imageUrl}, 'image', ${publish ?? false})
        `;

        return res.json({ success: true, image: imageUrl });

    } catch (error) {
        console.log("ERROR:", error.response?.data || error.message);
        return res.json({ success: false, message: error.message });
    }
};

// REMOVE BACKGROUND (FREE)
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;

        if (!userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        if (!image) {
            return res.json({ success: false, message: "No image uploaded." });
        }

        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', fs.createReadStream(image.path), {
            filename: image.originalname,
            contentType: image.mimetype,
        });

        const response = await axios.post(
            'https://api.remove.bg/v1.0/removebg',
            formData,
            {
                headers: {
                    'X-Api-Key': process.env.REMOVEBG_API_KEY,
                    ...formData.getHeaders(),
                },
                responseType: 'arraybuffer',
            }
        );

        const base64Image = Buffer.from(response.data).toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Remove background from image', ${imageUrl}, 'image')
        `;

        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.json({ success: false, message: error.response?.data?.message || error.message });
    }
};

// REMOVE IMAGE OBJECT (FREE)
export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.files['image'][0];
        const mask = req.files['mask'][0];

        if (!image || !mask) {
            return res.json({ success: false, message: "Image and mask required." });
        }

        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(image.path), {
            filename: image.originalname,
            contentType: image.mimetype,
        });
        formData.append('mask_file', fs.createReadStream(mask.path), {
            filename: 'mask.png',
            contentType: 'image/png',
        });

        const response = await axios.post(
            'https://clipdrop-api.co/cleanup/v1',
            formData,
            {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                    ...formData.getHeaders(),
                },
                responseType: 'arraybuffer',
            }
        );

        const base64Image = Buffer.from(response.data).toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Removed object from image', ${imageUrl}, 'image')
        `;

        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.json({ success: false, message: error.response?.data?.message || error.message });
    }
};

// RESUME REVIEW (FREE)
export const resumeReview = async (req, res) => {
    try {
        const { default: pdfParse } = await import("pdf-parse-fork");

        const { userId } = req.auth();
        const resume = req.file;

        if (!resume) {
            return res.json({ success: false, message: "No resume file uploaded." });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdfParse(dataBuffer);

        const prompt = `Review the following resume and provide constructive feedback on 
its strengths, weaknesses, and areas of improvement.

Resume Content:

${pdfData.text}`;

        const response = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;

        res.json({ success: true, content });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};