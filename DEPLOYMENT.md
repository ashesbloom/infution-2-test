# Deployment Guide for Render

This guide explains how to deploy your **Infused Nutrition** app to Render using the Free Tier.

## Prerequisites

1.  Push your latest code to GitHub.
2.  Sign up for a [Render](https://render.com/) account.

---

## Option 1: Automatic Deployment (Blueprints) - Recommended

We have created a `render.yaml` file in your project root. This file tells Render how to build and deploy both your frontend and backend.

1.  Go to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub repository.
4.  Give your blueprint a name (e.g., `infuse-app`).
5.  **Important:** Render will ask for Environment Variables. You must provide these for the **Backend** service:
    *   `MONGO_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A secret key for authentication.
    *   `EMAIL_USER`: Your email address for sending mails.
    *   `EMAIL_PASS`: Your email app password.
    *   `RAZORPAY_KEY_ID`: Your Razorpay Key ID.
    *   `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
6.  Click **Apply**.

### ⚠️ Critical Step: Fix the API Connection
Render assigns a random URL to your backend (e.g., `https://infuse-backend-xp2z.onrender.com`). The `render.yaml` file guesses the URL, but it will likely be wrong.

1.  Wait for the **Backend** service to finish deploying.
2.  Copy the **Backend URL** from the dashboard.
3.  Go to your **Frontend (Static Site)** service in the dashboard.
4.  Go to **Redirects/Rewrites**.
5.  Edit the rule for `/api/*`:
    *   **Source**: `/api/*`
    *   **Destination**: `https://<YOUR-BACKEND-URL>/api/*` (Paste your actual backend URL).
6.  Edit the rule for `/uploads/*`:
    *   **Source**: `/uploads/*`
    *   **Destination**: `https://<YOUR-BACKEND-URL>/uploads/*`
7.  Save changes.

---

## Option 2: Manual Setup (If Blueprints fail)

If you prefer to set it up manually:

### 1. Deploy Backend (Web Service)
1.  New **Web Service** -> Connect Repo.
2.  **Name**: `infuse-backend`
3.  **Root Directory**: `.` (Leave blank or dot)
4.  **Build Command**: `cd server && npm install`
5.  **Start Command**: `cd server && node server.js`
6.  **Environment Variables**: Add all the variables listed above.
7.  **Deploy**. Copy the URL (e.g., `https://infuse-backend.onrender.com`).

### 2. Deploy Frontend (Static Site)
1.  New **Static Site** -> Connect Repo.
2.  **Name**: `infuse-frontend`
3.  **Root Directory**: `client`
4.  **Build Command**: `npm install && npm run build`
5.  **Publish Directory**: `dist`
6.  **Redirects/Rewrites**:
    *   **Source**: `/api/*` -> **Destination**: `https://<YOUR-BACKEND-URL>/api/*` -> **Action**: Rewrite
    *   **Source**: `/uploads/*` -> **Destination**: `https://<YOUR-BACKEND-URL>/uploads/*` -> **Action**: Rewrite
    *   **Source**: `/*` -> **Destination**: `/index.html` -> **Action**: Rewrite
7.  **Deploy**.

---

## Troubleshooting

*   **White Screen on Frontend**: Check the browser console. If you see 404s for JS/CSS files, ensure the `Publish Directory` is set to `dist`.
*   **API Errors (404 or Network Error)**: Check your **Rewrites**. The destination must be the full URL of your backend.
*   **Images not loading**: Ensure the `/uploads/*` rewrite rule is active.
