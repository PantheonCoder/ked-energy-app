# KED Demo App

## Requirements

- Windows 10 or later
- Node.js 18 or later (includes npm)
- Internet access for the initial dependency installation

## First-time setup

1. Extract the archive.
2. Open PowerShell in the extracted `ked-app` folder.
3. Install dependencies:

   ```powershell
   npm --prefix server install
   npm --prefix client install
   ```

4. Start the app:

   ```powershell
   npm run dev
   ```

The browser opens at <http://localhost:5173>. Keep the terminal open while using the app. Press `Ctrl+C` in that terminal to stop both the web app and API.

## Publish a public demo for free

The repository includes a Render Blueprint in `render.yaml`. After uploading this project to GitHub, sign in at <https://dashboard.render.com>, choose **New → Blueprint**, connect the GitHub repository, and deploy the `ked-demo-app` web service on the **Free** plan. Render builds the frontend and serves it together with the API.

Free Render services sleep when idle and wake on the next visit. This demo stores its data in a local JSON file, which Render may erase on sleep, restart, or redeploy. The app is for demonstration only: its demo credentials and data are public, and it is not suitable for real customer information, payments, or production use.

## Open it on a phone

1. Connect the phone and computer to the same trusted Wi-Fi network.
2. Start the app using `npm run dev` as above.
3. Find the `http://...:5173` phone address printed in the terminal and open it in the phone's browser.

If the Wi-Fi network is marked **Public** in Windows, change its Network profile to **Private** only when it is your trusted home network: **Settings → Network & internet → Wi-Fi → your connected network → Network profile type → Private**. If Windows Firewall prompts when the app starts, allow Node.js on **Private networks**. If no prompt appears and the phone cannot connect, add Node.js to **Windows Security → Firewall & network protection → Allow an app through firewall** and enable it for **Private** networks only. Do not open these development-server ports to Public networks or the public internet. The phone address can change when the computer reconnects to Wi-Fi.

## Demo sign-in

- **Admin:** `admin123` / `12345678`
- **Customer:** `KED-84920` / `password123`

The app uses local demo data. The local database file is intentionally not included; the server creates a fresh demo database on first start.
