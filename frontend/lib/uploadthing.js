import { generateUploadButton } from "@uploadthing/react";


const uploadthingUrl=import.meta.env.VITE_BACKEND_URL +  "/api/uploadthing"
export const UploadButton = generateUploadButton({
  url:uploadthingUrl ,
});

import { generateReactHelpers } from "@uploadthing/react";
export const { useUploadThing, uploadFiles } =generateReactHelpers({
  url:uploadthingUrl
});