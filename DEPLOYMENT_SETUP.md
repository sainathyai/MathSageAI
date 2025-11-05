# Automatic Deployment Setup Guide

This guide explains how to set up automatic deployment to EC2 using GitHub Actions.

## Prerequisites

1. EC2 instance running Ubuntu
2. Node.js and npm installed on EC2
3. PM2 installed globally on EC2 (`npm install -g pm2`)
4. Git installed on EC2
5. SSH access to your EC2 instance

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

#### `EC2_HOST`
- Your EC2 instance public IP or hostname
- Example: `ec2-xx-xx-xx-xx.compute-1.amazonaws.com` or `54.123.456.789`

#### `EC2_USERNAME`
- The username for SSH login (typically `ubuntu` for Ubuntu instances or `ec2-user` for Amazon Linux)
- Example: `ubuntu`

#### `EC2_SSH_KEY`
- Your private SSH key used to connect to EC2
- To get this:
  ```bash
  # On your local machine, display your private key
  cat ~/.ssh/your-ec2-key.pem
  ```
- Copy the **entire** key including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
- Paste it as the secret value

### 2. Initial EC2 Setup

SSH into your EC2 instance and run these commands:

```bash
# Navigate to home directory
cd ~

# Clone the repository (if not already cloned)
git clone https://github.com/sainathyai/MathSageAI.git
cd MathSageAI

# Install dependencies
npm install

# Create .env.local file with your environment variables
nano .env.local
# Add your OpenAI API key and other secrets

# Build the project
npm run build

# Start with PM2
pm2 start npm --name "mathsageai" -- start

# Save PM2 configuration to restart on reboot
pm2 save
pm2 startup

# Configure firewall (if needed)
sudo ufw allow 3000
```

### 3. Environment Variables on EC2

Create a `.env.local` file on your EC2 instance with your secrets:

```bash
cd ~/MathSageAI
nano .env.local
```

Add your environment variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=mathsageai-sessions
S3_BUCKET_NAME=mathsageai-images
NEXT_PUBLIC_API_URL=http://your-ec2-ip:3000
```

### 4. Test the Workflow

1. Make a commit and push to `master`, `main`, or `feature/advanced-features` branch
2. Go to GitHub → Actions tab
3. Watch the deployment workflow run
4. Check the logs for any errors

### 5. Verify Deployment

After the workflow completes:

```bash
# SSH into EC2
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-ip

# Check PM2 status
pm2 status

# Check application logs
pm2 logs mathsageai

# Test the application
curl http://localhost:3000
```

## Troubleshooting

### Deployment fails with "Permission denied"
- Ensure the SSH key in GitHub Secrets matches the key used to access EC2
- Check that the key format is correct (include header and footer)

### Build fails on EC2
- Ensure Node.js version on EC2 matches your local development version
- Check if all dependencies are properly installed
- Review build logs: `pm2 logs mathsageai`

### Application doesn't start
- Check PM2 logs: `pm2 logs mathsageai --lines 100`
- Verify environment variables are set correctly in `.env.local`
- Ensure port 3000 is not already in use: `lsof -i :3000`

### Git pull fails
- Ensure the EC2 instance has read access to the GitHub repository
- For private repos, you may need to set up a deploy key or use HTTPS with a personal access token

## Manual Deployment

If you need to deploy manually:

```bash
# SSH into EC2
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-ip

# Navigate to project
cd ~/MathSageAI

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Restart PM2
pm2 restart mathsageai
```

## Security Notes

- **Never commit** your `.env.local` file or SSH keys to GitHub
- Use GitHub Secrets for all sensitive data
- Regularly rotate your SSH keys and API keys
- Consider using AWS Secrets Manager for production secrets
- Set up proper security groups on EC2 to restrict access

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

