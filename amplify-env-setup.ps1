# AWS Amplify Environment Variables Setup Script
# Run this after entering your OpenAI API key below

# ===================================
# REQUIRED: Add your OpenAI API key here
# ===================================
$OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"  # Replace with your actual key

# ===================================
# App Configuration
# ===================================
$APP_ID = "d2ohw6j2qrh9l8"
$REGION = "us-east-1"

# Set environment variables
Write-Host "Setting environment variables for MathSageAI Amplify app..." -ForegroundColor Green

aws amplify update-app `
    --app-id $APP_ID `
    --environment-variables `
        "OPENAI_API_KEY=$OPENAI_API_KEY,DYNAMODB_TABLE_NAME=mathsage-sessions,S3_BUCKET_NAME=mathsage-images-971422717446,NEXT_PUBLIC_APP_URL=https://master.d2ohw6j2qrh9l8.amplifyapp.com" `
    --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d2ohw6j2qrh9l8" -ForegroundColor White
    Write-Host "2. Click 'Connect repository'" -ForegroundColor White
    Write-Host "3. Select GitHub > sainathyai/MathSageAI > master branch" -ForegroundColor White
    Write-Host "4. Click 'Save and deploy'" -ForegroundColor White
    Write-Host ""
    Write-Host "Your app will be live at: https://master.d2ohw6j2qrh9l8.amplifyapp.com" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error setting environment variables" -ForegroundColor Red
    Write-Host "Please check your AWS CLI configuration and try again" -ForegroundColor Red
}

