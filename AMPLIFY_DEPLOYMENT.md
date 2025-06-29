# AWS Amplify Deployment Guide

This guide will help you deploy your OTP verification system using AWS Amplify for the frontend and AWS SAM for the backend.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vue 3 App     │    │   API Gateway   │    │   Lambda        │
│   (Amplify)     │───▶│   (SAM)         │───▶│   Functions     │
│                 │    │                 │    │   (SAM)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   DynamoDB      │    │   CloudWatch    │
                       │   (SAM)         │    │   Events        │
                       └─────────────────┘    └─────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured
3. **AWS SAM CLI** installed
4. **Node.js** 18+ installed
5. **Git** repository for your project

## Step 1: Deploy Backend (AWS SAM)

### 1.1 Install Dependencies
```bash
# In the root directory (where template.yaml is located)
npm install
```

### 1.2 Build and Deploy Backend
```bash
# Build the SAM application
sam build

# Deploy to AWS (first time)
sam deploy --guided

# Follow the prompts:
# - Stack Name: otp-verification-stack
# - AWS Region: us-east-1 (or your preferred region)
# - Confirm changes: Yes
# - Allow SAM CLI IAM role creation: Yes
# - Save arguments to configuration file: Yes
```

### 1.3 Get API Gateway URL
After deployment, note the API Gateway URL from the output:
```
Key                 ApiGatewayUrl
Description        API Gateway endpoint URL
Value              https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

## Step 2: Deploy Frontend (AWS Amplify)

### 2.1 Prepare Frontend for Amplify

The frontend is already configured for Amplify deployment with:
- `amplify.yml` - Build configuration
- `src/` directory - Contains all Vue 3 files
- Environment variables setup

### 2.2 Connect Repository to Amplify

1. **Go to AWS Amplify Console**
   - Navigate to AWS Amplify in your AWS Console
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your repository
   - Choose the branch (main/master)

3. **Configure Build Settings**
   - Amplify will auto-detect the `amplify.yml` file
   - Verify the build settings:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm ci
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: dist
         files:
           - '**/*'
     ```

4. **Add Environment Variables**
   - Add the API Gateway URL as an environment variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://your-api-gateway-url.amazonaws.com/prod`

5. **Deploy**
   - Click "Save and deploy"
   - Amplify will build and deploy your Vue 3 app

## Step 3: Configure Environment Variables

### 3.1 In Amplify Console
1. Go to your app in Amplify Console
2. Navigate to "Environment variables"
3. Add the following variables:
   ```
   VITE_API_URL = https://your-api-gateway-url.amazonaws.com/prod
   ```

### 3.2 Redeploy After Environment Variable Changes
- Go to "All builds" in Amplify Console
- Click "Redeploy this version" to apply new environment variables

## Step 4: Test Your Deployment

### 4.1 Test Backend API
```bash
# Test generate OTP endpoint
curl -X POST https://your-api-gateway-url.amazonaws.com/prod/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test verify OTP endpoint
curl -X POST https://your-api-gateway-url.amazonaws.com/prod/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

### 4.2 Test Frontend
1. Visit your Amplify app URL
2. Navigate to "Request OTP" page
3. Enter an email address
4. Check the browser console for the generated OTP
5. Go to "Verify OTP" page and enter the OTP

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain in Amplify
1. Go to "Domain management" in Amplify Console
2. Click "Add domain"
3. Enter your domain name
4. Follow the DNS verification steps

### 5.2 Update CORS in API Gateway
If using a custom domain, update the CORS settings in your SAM template:
```yaml
Cors:
  AllowMethods: "'POST, OPTIONS'"
  AllowHeaders: "'Content-Type'"
  AllowOrigin: "'https://yourdomain.com'"
```

## Monitoring and Troubleshooting

### 5.1 Backend Monitoring
- **CloudWatch Logs**: Check Lambda function logs
- **API Gateway**: Monitor API usage and errors
- **DynamoDB**: Check table metrics and performance

### 5.2 Frontend Monitoring
- **Amplify Console**: View build logs and deployment status
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Monitor API calls

### 5.3 Common Issues

#### CORS Errors
- Ensure API Gateway CORS is configured correctly
- Check that the frontend URL is allowed in CORS settings

#### Environment Variables Not Working
- Redeploy the app after adding environment variables
- Check that variable names start with `VITE_`

#### Build Failures
- Check the build logs in Amplify Console
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Cost Optimization

### 5.1 Backend Costs
- **Lambda**: Pay per request (very low cost)
- **DynamoDB**: Pay per request billing
- **API Gateway**: Pay per API call

### 5.2 Frontend Costs
- **Amplify**: Free tier includes 1000 build minutes/month
- **CloudFront**: Free tier includes 1TB data transfer

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data to Git
2. **API Keys**: Use IAM roles instead of hardcoded credentials
3. **CORS**: Restrict allowed origins in production
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate all inputs on both frontend and backend

## Updates and Maintenance

### 5.1 Backend Updates
```bash
# Update Lambda functions
sam build
sam deploy
```

### 5.2 Frontend Updates
- Push changes to your Git repository
- Amplify will automatically rebuild and deploy

### 5.3 Environment Variable Updates
- Update in Amplify Console
- Redeploy the application

## Support and Resources

- **AWS Amplify Documentation**: https://docs.aws.amazon.com/amplify/
- **AWS SAM Documentation**: https://docs.aws.amazon.com/serverless-application-model/
- **Vue 3 Documentation**: https://vuejs.org/
- **AWS Support**: Available with AWS Support plans 