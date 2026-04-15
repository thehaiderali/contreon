import Mux from '@mux/mux-node';
import { envConfig } from '../config/env.js';

export const mux = new Mux({
  tokenId: envConfig.MUX_ACCESS_TOKEN,
  tokenSecret: envConfig.MUX_SECRET_KEY,
  jwtSigningKey:envConfig.MUX_SIGNING_KEY_ID,
  jwtPrivateKey:envConfig.MUX_SIGNING_PRIVATE_KEY,
});
