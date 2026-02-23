# Deploying ReputaGate to Vercel 🚀

To ensure users see their **live FairScale scores** on your Vercel deployment, follow these steps:

### 1. Import Project
- Go to [Vercel Dashboard](https://vercel.com/dashboard).
- Click **"Add New"** > **"Project"**.
- Import your **ReputaGate** repository from GitHub.

### 2. Configure Environment Variables
This is the **CRITICAL** step for live scores. 
- In the **"Configure Project"** screen, expand the **"Environment Variables"** section.
- Add the following:
  - **Key**: `VITE_FAIRSCALE_API_KEY`
  - **Value**: `your_fairscale_api_key_here`
- Click **"Add"**.

### 3. Deploy
- Click **"Deploy"**.
- Vercel will build your React app. 
- Once finished, any user who connects their wallet will be queried against the real FairScale API!

---

### 🛡️ Why do I need this?
The app is designed to fall back to **Mock Data** if the API key is missing (to prevent the UI from breaking). By setting the `VITE_FAIRSCALE_API_KEY` in Vercel, you "unlock" the production bridge, allowing ReputaGate to fetch real-world reputation scores for any Solana wallet.

### 🆘 Troubleshooting
If you don't see scores:
1. Ensure your API key is active at [sales.fairscale.xyz](https://sales.fairscale.xyz/).
2. Check the browser console for any "FairScale API Error" messages.
3. Verify that the variable name in Vercel exactly matches `VITE_FAIRSCALE_API_KEY`.
