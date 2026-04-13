import { AssemblyAI } from "assemblyai";
import { envConfig } from "../config/env.js";

export const client = new AssemblyAI({
  apiKey: envConfig.ASSEMBLY_API_KEY
});