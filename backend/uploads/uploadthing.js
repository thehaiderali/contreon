import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  // Image uploader
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    console.log("Image upload complete", data);
  }),
  
  // Audio uploader
  audioUploader: f({
    audio: {
      maxFileCount: 1,
      maxFileSize: "64MB",
    },
  }).onUploadComplete((data) => {
    console.log("Audio upload complete", data);
  }),
  
  // Transcription JSON uploader
  transcriptionUploader: f({
    blob: {
      maxFileCount: 1,
      maxFileSize: "64MB",
    },
  }).onUploadComplete((data) => {
    console.log("Transcription upload complete", data);
  }),

  // videoUploader:f({
  //   video:{
  //     maxFileCount:1,
  //     maxFileSize:"128MB"
  //   }
  // })
};