import { Resend } from 'resend';
import { envConfig } from './env.js';

const resend = new Resend(envConfig.RESEND_API_KEY);

export default resend