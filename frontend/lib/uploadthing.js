import { generateUploadButton } from "@uploadthing/react";


export const UploadButton = generateUploadButton({
  url: "http://localhost:3000/api/uploadthing",
});

import { generateReactHelpers } from "@uploadthing/react";
export const { useUploadThing, uploadFiles } =generateReactHelpers({
  url:"http://localhost:3000/api/uploadthing"
});