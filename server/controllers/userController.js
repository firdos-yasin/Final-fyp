import sql from "../configs/db.js";


export const getUserCreations = async (req, res)=>{
    try {
        const {userId} = req.auth()

        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
        
        res.json({success: true, creations});
    } catch (error) {
        res.json({success: false, message: error.message});

    }
}

/*export const getPiblishedCreations = async (req, res)=>{
    try {

        const creations = await sql`
        SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        
        res.json({success: true, creations});
    } catch (error) {
        res.json({success: false, message: error.message});

    }
}
    */
export const getPiblishedCreations = async (req, res)=>{
    try {
        const creations = await sql`
        SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        
        res.json({success: true, creations});
    } catch (error) {
        console.log("ERROR:", error.message);
        res.json({success: false, message: error.message});
    }
}
export const togglePublishCreation = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}`

        if (!creation) {
            return res.json({ success: false, message: "Creation not found" })
        }

        const updatedCreation = await sql`
            UPDATE creations SET publish = ${!creation.publish} 
            WHERE id = ${id} AND user_id = ${userId}
            RETURNING *`

        res.json({ success: true, publish: updatedCreation[0].publish })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const toggleLikeCreations = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {id} = req.body

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`

        if(!creation){
            return res.json({ success: false, message: "Creation not found"})
        }

        const currentLikes = creation.likes || [];
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = 'Creations Unliked'
        } else {
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creations Liked'
        }

        // 👇 yeh fix hai - .json() nahi .join() hota hai
        await sql`UPDATE creations SET likes = ${updatedLikes}::text[] WHERE id = ${id}`;
        
        res.json({success: true, message});
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}
