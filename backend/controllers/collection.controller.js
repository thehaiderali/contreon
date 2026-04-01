import mongoose from "mongoose";
import Collection from "../models/collection.model.js";
import { collectionSchema, collectionUpdateSchema } from "../validation/zod.js";
import { errorParser } from "../validation/zod.js";




export async function creationCollection(req,res){
    
    try {
        
     const {success,data,error:ZodError}=collectionSchema.safeParse(req.body);
     if(!success){
        return res.status(400).json({
            success:false,
            error:errorParser(ZodError)
        })
     }  
     
     const already=await Collection.findOne({title:data.title,creatorId:req.user.userId});
     if(already){
        return res.status(400).json({
            success:false,
            error:"The Collection with Same title Already Exists."
        })
     }

     const newCollection=new Collection({
        title:data.title,
        creatorId:req.user.userId,
        description:data.description || ""
     })

     await newCollection.save();

     return res.status(200).json({
        success:true,
        data:{
            newCollection
        }
     })


    } catch (error) {
       console.log("Error in Collection Creation : ",error);
       return res.status(500).json({
        success:false,
        error:"Internal Server Error"
       }) 
    }


}



export async function updateCollection(req,res){
    
    try {
        
     const {collectionId}=req.params;   

     if(!mongoose.Types.ObjectId.isValid(collectionId)){
         return res.status(400).json({
            success:false,
            error:"Invalid Collection ID"
         })   
     }

     const already=await Collection.findById(collectionId)
     if(!already){
        return res.status(400).json({
            success:false,
            error:"The Collection Doesnot Exists"
        })
     }
     if(req.user.userId.toString()!==already.creatorId.toString()){
        return res.status(403).json({
            success:false,
            message:"Unauthorized Access. Cannot Update"
        })
     }
     const {success,data,error:ZodError}=collectionUpdateSchema.safeParse(req.body);
     if(!success){
        return res.status(400).json({
            success:false,
            error:errorParser(ZodError)
        })
     }  
     
     if(!data.title && !data.description){
        return res.status(400).json({
            success:false,
            error:"Empty Fields Nothing to Update"
        })
     }
  
    let update={}
    if(data.title){
       
     const alreadyTitle=await Collection.findOne({title:data.title,creatorId:req.user.userId});
     if(alreadyTitle){
        return res.status(400).json({
            success:false,
            error:"The Collection with Same title Already Exists."
        })
     }
     else{
         update.title=data.title
     }
    }
    if(data.description){
        update.description=data.description
    }
    
     const updatedCollection= await Collection.findByIdAndUpdate(collectionId,{
        title:data.title,
        creatorId:req.user.userId,
        description:data.description || ""
     })

     return res.status(200).json({
        success:true,
        data:{
            updatedCollection
        }
     })
    } catch (error) {
       console.log("Error in Collection Updation : ",error);
       return res.status(500).json({
        success:false,
        error:"Internal Server Error"
       }) 
    }
}
export async function deleteCollection(){

    try {
      const {collectionId}=req.params;
          if(!mongoose.Types.ObjectId.isValid(collectionId)){
         return res.status(400).json({
            success:false,
            error:"Invalid Collection ID"
         })   
     }
     const already=await Collection.findById(collectionId)
     if(!already){
        return res.status(400).json({
            success:false,
            error:"The Collection Doesnot Exists"
        })
     }

      if(req.user.userId.toString()!==already.creatorId.toString()){
        return res.status(403).json({
            success:false,
            message:"Unauthorized Access. Cannot Update"
        })
     }

        await Collection.findByIdAndUpdate(collectionId);

        return res.status(200).json({
            success:true,
            message:"Collection Deleted Successfully"
        })

    } catch (error) {
       console.log("Error in Collection Deletion : ",error);
       return res.status(500).json({
        success:false,
        error:"Internal Server Error"
       }) 
    }

}