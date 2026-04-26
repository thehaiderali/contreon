import { Resend } from 'resend';
import { envConfig } from './env';

const resend = new Resend(envConfig.RESEND_API_KEY);

export default resend