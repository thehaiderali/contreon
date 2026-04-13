import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js"
import { commentSchema, errorParser } from "../validation/zod.js";



export async function createComment(req,res){

    try {
        const {success,data,error:Zoderror}=commentSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                success:false,
                error:errorParser(Zoderror)
            })
        }
        const id=req.params.postId;
        const post=await Post.findById(id);
        if(!post){
            return res.status(404).json({
                success:false,
                error:"Post not found"
            })
        }
        const user=await User.findById(req.user.Id);
        const alreadyComment=Comment.findOne({postId:id,authorId:user._id})
        if(alreadyComment){
            return res.status(400).json({
                success:false,
                error:"One one Comment Per post allowed"
            })
        }
        
        const newComment=new Comment({
            authorId:user._id,
            postId:id,
            content:data.content

        })
        await newComment.save()
        return res.status(200).json({
            success:true,
            data:{
                comment:newComment
            },
            message:"Comment Created Successfully"
        })
    } catch (error) {
       console.log("Error in Creating Comments : ",error);
       return res.status(500).json({
        succcess:false,
        error:"Internal Server Error"
       }) 

    }


}


export async function updateComment(req,res){

    try {
        const {success,data,error:Zoderror}=commentSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                success:false,
                error:errorParser(Zoderror)
            })
        }
        const id=req.params.id;
        const user=await User.findById(req.user.Id);
        const alreadyComment=Comment.findById(id);
        if(!alreadyComment){
            return res.status(400).json({
                success:false,
                error:"Comment not Found"
            })
        }
       const newComment= await Comment.findByIdAndUpdate(alreadyComment._id,{
            content:data.content
        })
        return res.status(200).json({
            success:true,
            data:{
                comment:newComment
            },
            message:"Comment Updated Successfully"
        })
    } catch (error) {
       console.log("Error in Updating Comments : ",error);
       return res.status(500).json({
        succcess:false,
        error:"Internal Server Error"
       }) 

    }


}


export async function deleteComment(req, res) {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: "Post not found"
            });
        }
        
        const user = await User.findById(req.user.Id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        
        const comment = await Comment.findOne({ 
            postId: postId, 
            authorId: user._id 
        });
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: "Comment not found"
            });
        }
        
        await Comment.findByIdAndDelete(comment._id);
        
        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
        
    } catch (error) {
        console.log("Error in Deleting Comment: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export async function getAllCommentsForPost(req,res){
    try {
     
     const id=req.params.id;
     const post=await Post.findById(id);
     if(!post){
        return res.status(404).json({
            success:false,
            error:"Post Not Found"
        })
     }
     if(post.creatorId!==req.user.userId){
        return res.status(403).json({
            success:false,
            error:"Unauthorized Cannot Access Other Creator's Post Data"
        })
     }   
     
     const comments=Comment.find({
        postId:post._id 
     })

     return res.status(200).json({
        success:true,
        data:{
            comments
        }
     })


    } catch (error) {
        console.log("Error in Gettings Comments for a Post : ",error)
        return res.status(500).json({
            success:true,
            error:"Internal Server Error"
        })
        
    }
}

export async function creatorDeleteComment(req,res){
    try {
       
      const id=req.params.id;
      const commentId=req.params.commentId;
      const post=await Post.findById(id);
     if(!post){
        return res.status(404).json({
            success:false,
            error:"Post Not Found"
        })
     }
     if(post.creatorId!==req.user.userId){
         return res.status(403).json({
            success:false,
            error:"Unauthorized Cannot Access Other Creator's Post Data"
        })
     }
     const comment=await Comment.findById(commentId);
     if(!comment){
        return res.status(404).json({
            success:false,
            error:"Comment not Found"
        })
     }

     await Comment.findByIdAndDelete(commentId);

     return res.status(200).json({
        success:true,
        message:"Comment Delete Successfully"
     })

    } catch (error) {

       console.log("Error in Deleting Comment By Creator for a Post : ",error)
        return res.status(500).json({
            success:true,
            error:"Internal Server Error"
        })

    }
}


export async function creatorFeaturedCommentToggle(req,res){
    try {
       
      const id=req.params.id;
      const commentId=req.params.commentId;
      const post=await Post.findById(id);
     if(!post){
        return res.status(404).json({
            success:false,
            error:"Post Not Found"
        })
     }
     if(post.creatorId!==req.user.userId){
         return res.status(403).json({
            success:false,
            error:"Unauthorized Cannot Access Other Creator's Post Data"
        })
     }
     const comment=await Comment.findById(commentId);
     if(!comment){
        return res.status(404).json({
            success:false,
            error:"Comment not Found"
        })
     }

     await Comment.findByIdAndUpdate(commentId,{
        featured:!comment.featured,
     });

     return res.status(200).json({
        success:true,
        message:"Comment Featured Toggle Successfully"
     })

    } catch (error) {

       console.log("Error in Toggle Featuring Comment By Creator for a Post : ",error)
        return res.status(500).json({
            success:true,
            error:"Internal Server Error"
        })

    }
}