import { generateUploadButton } from "@uploadthing/react";


const uploadthingUrl=import.meta.env.VITE_BACKEND_URL +  "/uploadthing"
console.log("Upload Thing Url :",uploadthingUrl)
export const UploadButton = generateUploadButton({
  url:uploadthingUrl ,

});

import { generateReactHelpers } from "@uploadthing/react";
export const { useUploadThing, uploadFiles } =generateReactHelpers({
  url:uploadthingUrl
});