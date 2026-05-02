import { envConfig } from "./env.js"
import  { Stripe } from "stripe"
const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
});

export default stripe;