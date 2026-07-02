# Deployment Guide - Fixing API Routing Issues

## Problem Summary
When deployed to Vercel (or any other hosting platform), API requests were being sent to the Vercel domain instead of the deployed backend API. For example, login requests were going to `https://byway-lime.vercel.app/api/Auth/login` instead of the actual backend API endpoint.

## Root Cause
The `.env` file containing `VITE_API_BASE_URL` is not deployed with the application (it's in `.gitignore` for security). When the frontend is built on Vercel without this environment variable configured in Vercel's project settings, the API requests fall back to using relative URLs, which resolve to the Vercel domain instead of the backend API.

## Solution

### Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

   | Variable Name | Value | Notes |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://your-backend-api.com` | Use your deployed backend API URL (e.g., `http://bywayapi.runasp.net` or `https://api.yourdomain.com`) |
   | `VITE_API_URL` | `https://your-backend-api.com` | Same as above for redundancy |

4. **Important**: Make sure these variables are set for the **Production** environment

### Step 2: Redeploy
After configuring the environment variables, redeploy your Vercel project:
- Go to **Deployments** in your Vercel dashboard
- Click on the latest failed/current deployment
- Click **Redeploy** at the top right
- OR push a new commit to your repository if you have automatic deployments enabled

### Step 3: Verify the Fix
1. After deployment completes, test the login functionality
2. Open your browser's Network tab (DevTools)
3. Attempt to log in
4. Verify that the login request goes to your backend API URL, not to the Vercel domain

## Important Notes

### Environment Variable Requirements
- Both `VITE_API_BASE_URL` and `VITE_API_URL` should point to the same backend API
- Do **NOT** include trailing slashes in the URL (e.g., use `http://api.example.com` not `http://api.example.com/`)
- Use **HTTPS** for production deployments (not HTTP)
- The backend API must have CORS configured to allow requests from your Vercel domain

### Local Development
For local development, you can:
1. Use the `.env` file with your local/development backend URL
2. Or keep the default `http://bywayapi.runasp.net` and it will use that during development

### How the Configuration Works
The application uses this priority order for the API base URL:
1. `VITE_API_BASE_URL` environment variable (if set)
2. `VITE_API_URL` environment variable (if set)
3. Default fallback: `http://bywayapi.runasp.net`

### Error Handling
If the API URL is not properly configured, you will see:
- An error message in the browser console mentioning "API_BASE_URL is not properly configured"
- App functionality will not work, with clear error messages indicating the configuration issue

## Troubleshooting

### Requests Still Going to Vercel Domain
1. Verify the environment variables are set in Vercel's project settings
2. Check that the variables are set for the **Production** environment (not just Preview)
3. Clear your browser cache
4. Perform a hard redeploy (not just a regular deployment)

### Getting 404 or Connection Errors
1. Verify the backend API URL is correct and accessible
2. Check that CORS is properly configured on the backend API
3. Make sure the URL includes the protocol (`http://` or `https://`)
4. Check backend API status and logs

### Backend CORS Configuration
Make sure your backend API is configured to accept requests from your Vercel domain:
```
Allowed Origins: https://byway-lime.vercel.app (or your actual domain)
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
```

## Code Changes Made
The code has been updated to:
1. **Always validate** that `API_BASE_URL` is set and not empty before making requests
2. **Prevent relative URLs** from being used by accident
3. **Provide clear error messages** if the API URL is not configured
4. **Use absolute backend URLs** instead of relative paths for all API requests

This ensures that even if environment variables are not properly configured, the application will fail with a clear error message rather than silently routing requests to the wrong domain.
