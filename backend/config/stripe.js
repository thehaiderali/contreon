import { envConfig } from "./env.js"
import  { Stripe } from "stripe"
const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover', 
});

export default stripe;