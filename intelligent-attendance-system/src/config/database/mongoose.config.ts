import { MongooseModuleOptions } from '@nestjs/mongoose';
import * as dns from 'node:dns';

// Fix DNS SRV resolution issue on Node.js
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

export const mongooseConfig: MongooseModuleOptions = {
  uri: process.env.MONGODB_URI,
};
