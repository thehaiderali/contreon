import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {envConfig} from "../config/env.js"


export const eleven = new ElevenLabsClient({
  apiKey: envConfig.ELEVEN_API_KEY
});
