# KED Demo App

## Requirements

- Windows 10 or later
- Node.js 18 or later (includes npm)
- Internet access for the initial dependency installation

## First-time setup

1. Extract the archive to a folder.
2. Install [Node.js 18 or later](https://nodejs.org/) if it isn't already installed.
3. Open `ked-app.code-workspace` from the extracted folder in VS Code, and allow the workspace if VS Code asks.
4. In VS Code, choose **Terminal → Run Task → Install KED Dependencies** and wait for it to finish. You only need to do this once.
5. Choose **Terminal → Run Task → Start KED App**. The app opens at <http://localhost:5173>.

You can also run the setup from a terminal in the project folder:

   ```powershell
   npm run setup
   npm run dev
   ```

Keep the VS Code task or terminal running while using the app. Press `Ctrl+C` in its terminal to stop both the web app and API.

## Publish a public demo for free

The repository includes Vercel configuration. Sign in at <https://vercel.com/new>, import `PantheonCoder/ked-energy-app` from GitHub, and deploy using the defaults in `vercel.json`. Vercel builds the frontend and hosts the API.

Vercel's Hobby plan is free for personal projects. The demo database uses temporary serverless storage and may reset; don't enter real personal information or use this app for production or real payments. The source and demo credentials are public.

## Open it on a phone

1. Connect the phone and computer to the same trusted Wi-Fi network.
2. Start the app using `npm run dev` as above.
3. Find the `http://...:5173` phone address printed in the terminal and open it in the phone's browser.

If the Wi-Fi network is marked **Public** in Windows, change its Network profile to **Private** only when it is your trusted home network: **Settings → Network & internet → Wi-Fi → your connected network → Network profile type → Private**. If Windows Firewall prompts when the app starts, allow Node.js on **Private networks**. If no prompt appears and the phone cannot connect, add Node.js to **Windows Security → Firewall & network protection → Allow an app through firewall** and enable it for **Private** networks only. Do not open these development-server ports to Public networks or the public internet. The phone address can change when the computer reconnects to Wi-Fi.

## Demo sign-in

- **Admin:** `admin123` / `12345678`
- **Customer:** `KED-84920` / `password123`

The app uses local demo data. The local database file is intentionally not included; the server creates a fresh demo database on first start.
