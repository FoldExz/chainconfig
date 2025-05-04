// agent.js (versi ES module)

import fs from 'fs';
import path from 'path';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Client } from 'ssh2';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load generated canister ID
const canisterIdsPath = path.resolve(__dirname, '../.dfx/local/canister_ids.json');
if (!fs.existsSync(canisterIdsPath)) {
  console.error('❌ Cannot find canister_ids.json at', canisterIdsPath);
  process.exit(1);
}

const canisterIds = JSON.parse(fs.readFileSync(canisterIdsPath, 'utf8'));
const canisterId = canisterIds['chainconfig_backend']?.local;
if (!canisterId) {
  console.error('❌ Cannot find canister ID for `chainconfig_backend` in canister_ids.json');
  process.exit(1);
}

// Dynamically import idlFactory from ESM
const { idlFactory } = await import(
  '../src/declarations/chainconfig_backend/chainconfig_backend.did.js'
);

// Init agent
const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });
await agent.fetchRootKey(); // Only needed for local

// Create actor
const chainConfig = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

// Polling config
const POLL_INTERVAL = 5000;

async function applyConfigs() {
  try {
    const configs = await chainConfig.get_configs();
    const devices = await chainConfig.get_devices();
    console.log("Configs:", configs);
    console.log("Devices:", devices);

    for (const cfg of configs) {
      if (!cfg.status || !cfg.status['#Approved']) {
        console.log(`Skipping config #${cfg.id} as it is not approved`);
        continue;
      }

      const dev = devices.find(d => d.id === cfg.deviceId);
      if (!dev) {
        console.log(`Device with ID ${cfg.deviceId} not found`);
        continue;
      }

      if (!dev.isOnline) {
        console.log(`Device ${dev.name} (${dev.ip}) is offline, skipping`);
        continue;
      }

      console.log(`Applying config #${cfg.id} to device ${dev.name} (${dev.ip})`);

      // SSH connection setup
      const conn = new Client();
      conn.on('ready', () => {
        console.log(`🛠 SSH connection ready to ${dev.ip}`);
        conn.exec(cfg.content, (err, stream) => {
          if (err) {
            console.error(`SSH exec error for config #${cfg.id}:`, err);
            return conn.end();
          }
          stream.on('close', code => {
            console.log(`✅ Config #${cfg.id} applied with exit code ${code}`);
            conn.end();
          }).on('data', data => console.log(`STDOUT: ${data}`))
            .stderr.on('data', data => console.error(`STDERR: ${data}`));
        });
      }).on('error', err => {
        console.error(`❌ SSH connection error to ${dev.ip}:`, err);
      }).connect({
        host: dev.ip === '127.0.0.1' ? dev.ip : '127.0.0.1', // Use '127.0.0.1' for testing devices on localhost
        port: 22,
        username: 'netops',
        privateKey: fs.readFileSync(path.resolve(__dirname, 'id_rsa'))
      });
    }
  } catch (e) {
    console.error('❌ Error fetching or applying configs:', e);
  }
}

setInterval(applyConfigs, POLL_INTERVAL);
console.log('🚀 Agent started, polling every', POLL_INTERVAL, 'ms');
