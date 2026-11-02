const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const projectRoot = __dirname;
const serverDirectory = path.join(projectRoot, 'server');
const clientDirectory = path.join(projectRoot, 'client');
const viteEntry = path.join(clientDirectory, 'node_modules', 'vite', 'bin', 'vite.js');

let server;
let client;
let shuttingDown = false;

const stopApp = (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  if (server && server.exitCode === null) server.kill();
  if (client && client.exitCode === null) client.kill();
  process.exitCode = exitCode;
  setTimeout(() => process.exit(exitCode), 500).unref();
};

const startClient = () => {
  if (client || shuttingDown) return;
  console.log('[KED] Opening the web interface at http://localhost:5173');
  const lanAddresses = Object.values(os.networkInterfaces())
    .flat()
    .filter((network) => network && network.family === 'IPv4' && !network.internal)
    .map((network) => network.address);
  lanAddresses.forEach((address) => console.log(`[KED] On the same Wi-Fi, open http://${address}:5173 on your phone`));
  client = spawn(process.execPath, [viteEntry, '--host', '0.0.0.0', '--strictPort', '--open'], {
    cwd: clientDirectory,
    stdio: 'inherit',
    windowsHide: true
  });
  client.once('error', (error) => {
    console.error('[KED] Could not start the web interface:', error);
    stopApp(1);
  });
  client.once('exit', (code) => {
    if (!shuttingDown) {
      console.error(`[KED] Web interface stopped${code === null ? '' : ` (exit ${code})`}.`);
      stopApp(code || 1);
    }
  });
};

console.log('[KED] Starting the API and web interface...');
server = spawn(process.execPath, ['server.js'], {
  cwd: serverDirectory,
  stdio: ['inherit', 'pipe', 'inherit'],
  windowsHide: true
});

server.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  if (chunk.toString().includes('API running on http://localhost:3001')) startClient();
});
server.once('error', (error) => {
  console.error('[KED] Could not start the API server:', error);
  stopApp(1);
});
server.once('exit', (code) => {
  if (!shuttingDown) {
    console.error(`[KED] API server stopped${code === null ? '' : ` (exit ${code})`}.`);
    stopApp(code || 1);
  }
});

process.once('SIGINT', () => stopApp(0));
process.once('SIGTERM', () => stopApp(0));
