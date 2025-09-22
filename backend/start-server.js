// start-server.js
// This script ensures the server starts correctly regardless of the current working directory

import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change to the backend directory
process.chdir(__dirname);

console.log('🚀 Starting Green Harvest Backend Server...');
console.log('📂 Working directory:', process.cwd());

// Import and run the main server
import('./index.js').catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});