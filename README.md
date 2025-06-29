# OTP Verification System

A complete serverless OTP verification system built with AWS Lambda, DynamoDB, and API Gateway, with a modern Vue 3 frontend.

## Architecture

### Backend (AWS Serverless)
- **Lambda Functions**: Generate OTP, verify OTP, cleanup expired OTP
- **DynamoDB**: Store OTP codes with expiration
- **API Gateway**: RESTful API endpoints
- **CloudWatch Events**: Scheduled cleanup of expired OTPs

### Frontend (Vue 3)
- **Vue 3** with Composition API
- **Vite** for fast development
- **TailwindCSS** for styling
- **Pinia** for state management
- **Axios** for API calls

## Project Structure

```
otp-verification-system/
├── lambda/                    # AWS Lambda functions
│   ├── generate-otp.js       # Generate and store OTP
│   ├── verify-otp.js         # Verify OTP code
│   └── cleanup-expired-otp.js # Cleanup expired OTPs
├── src/                      # Vue 3 frontend
│   ├── views/
│   │   ├── RequestOTP.vue
│   │   └── VerifyOTP.vue
│   ├── store/
│   │   └── useOtpStore.js
│   └── ...
├── template.yaml             # SAM template
├── samconfig.toml           # SAM deployment config
└── package.json             # Lambda dependencies
```

## Features

### Backend Features
- ✅ **Generate OTP**: Creates 6-digit OTP and stores in DynamoDB
- ✅ **Verify OTP**: Validates OTP with expiration and attempt limits
- ✅ **Auto Cleanup**: Removes expired OTPs automatically
- ✅ **Rate Limiting**: Maximum 3 attempts per OTP
- ✅ **TTL**: 15-minute expiration for OTPs

### Frontend Features
- ✅ **Request OTP**: Email input and OTP generation
- ✅ **Verify OTP**: OTP input with validation
- ✅ **15-second Timer**: Frontend countdown timer
- ✅ **Resend OTP**: Request new OTP after expiration
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Loading States**: User-friendly loading indicators

## Deployment

### Prerequisites
- AWS CLI configured
- AWS SAM CLI installed
- Node.js 18+ installed

### Backend Deployment

1. **Install dependencies**:
```bash
npm install
```

2. **Build the application**:
```bash
sam build
```

3. **Deploy to AWS**:
```bash
sam deploy --guided
```

4. **Get the API Gateway URL** from the deployment output and update your `.env` file:
```env
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

### Frontend Development

1. **Install dependencies**:
```bash
cd src
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

## API Endpoints

### Generate OTP
- **POST** `/generate-otp`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "message": "OTP sent successfully", "email": "user@example.com" }`

### Verify OTP
- **POST** `/verify-otp`
- **Body**: `{ "email": "user@example.com", "otp": "123456" }`
- **Response**: `{ "message": "OTP verified successfully", "email": "user@example.com" }`

## DynamoDB Schema

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "expirationTime": 1640995200,
  "createdAt": 1640994300,
  "attempts": 0
}
```

## Security Features

- **OTP Expiration**: 15-minute TTL
- **Attempt Limiting**: Maximum 3 attempts per OTP
- **Auto Cleanup**: Expired OTPs removed automatically
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Email and OTP validation

## Environment Variables

### Backend (Lambda)
- `OTP_TABLE_NAME`: DynamoDB table name

### Frontend
- `VITE_API_URL`: API Gateway endpoint URL

## Monitoring

- **CloudWatch Logs**: Lambda function logs
- **CloudWatch Metrics**: API Gateway metrics
- **DynamoDB Metrics**: Table performance metrics

## Cost Optimization

- **Pay-per-request**: DynamoDB billing mode
- **Auto-scaling**: Lambda functions scale automatically
- **TTL**: Automatic cleanup reduces storage costs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `sam local start-api`
5. Deploy and test in AWS
6. Submit a pull request

## License

This project is licensed under the MIT License. 