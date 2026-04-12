import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    console.log("Upload Complete")
  }),
  audioUploader:f({
      audio:{
        maxFileCount:1,
        maxFileSize:"64MB"
      }
  }),
  transcriptionUploader:f({
    text:{
      maxFileCount:1,
      maxFileSize:"64MB"
    }
  })
} 
