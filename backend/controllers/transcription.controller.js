import { client } from "../utils/assembly.js";
import fetch from "node-fetch"

export async function createTranscription(req,res){

    try {

     const {audioUrl}=req.body;
     if(!audioUrl){
        return res.status(400).json({
            success:false,
            error:"Audio Url Not Found"
        })

     }   
     console.log("Audio Url : ",audioUrl)      
     
     const params = {
        audio: audioUrl,
        speech_models: ["universal-3-pro", "universal-2"],
        language_detection: true,
         speaker_labels: true,
        };

    const transcript = await client.transcripts.transcribe(params);

    // console.log( "Transcription : ",transcript.text);
    // console.log("Transcription JSON : ",transcript)

    return res.status(200).json({
        success:true,
        data:{
            transcript
        }
    })

     
    } catch (error) {

        console.log("Error in Transcribing Audio : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
        
    }

}