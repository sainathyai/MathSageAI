# MathSageAI EC2 Deployment Guide

## 🚀 Deployment Status: LIVE

✅ **Application deployed and running successfully!**

- **Domain**: https://mathsageai.sainathyai.com (primary access - HTTPS enabled ✅)
- **HTTP Redirect**: Automatically redirects to HTTPS
- **Direct IP**: http://98.93.189.92 (also accessible)
- **Deployment Date**: November 4, 2025
- **Build**: Production (Next.js optimized build)
- **Process Manager**: PM2 (auto-restart enabled)
- **Boot Startup**: Configured (survives reboots)
- **Web Server**: Nginx (reverse proxy to port 3000)
- **SSL Certificate**: Let's Encrypt (valid until Feb 2, 2026, auto-renews)
- **DNS**: Route 53 A record → 98.93.189.92

---

## Instance Information

**Instance Details:**
- **Instance ID**: `i-0158b20c6a22170d1`
- **Type**: t3.medium (2 vCPU, 4GB RAM)
- **OS**: Ubuntu 22.04 LTS (Ubuntu 24.04)
- **Public IP**: `98.93.189.92` (Not static - changes on stop/start)
- **Public DNS**: `ec2-98-93-189-92.compute-1.amazonaws.com`
- **Status**: ✅ Running with MathSageAI deployed

**Security Group**: MathSageAI-SG (sg-08368523b5c493482)
- SSH (22): Open to 0.0.0.0/0
- HTTP (80): Open to 0.0.0.0/0
- HTTPS (443): Open to 0.0.0.0/0
- Custom TCP (3000): Open to 0.0.0.0/0

**IAM Configuration**:
- **Role**: MathSageAI-EC2-Role
- **Instance Profile**: MathSageAI-EC2-Profile
- **Permissions**: DynamoDB (mathsage-sessions), S3 (mathsageai-images)

## Step 1: Connect to EC2 Instance

### Using Windows PowerShell

```powershell
# Navigate to project directory
cd "C:\Users\Sainatha Yatham\Documents\GauntletAI\Week4\MathSageAI"

# Connect to EC2
ssh -i mathsageai-ec2-key.pem ubuntu@98.93.189.92
```

### Using WSL/Git Bash

```bash
cd /mnt/c/Users/Sainatha\ Yatham/Documents/GauntletAI/Week4/MathSageAI
chmod 400 mathsageai-ec2-key.pem
ssh -i mathsageai-ec2-key.pem ubuntu@98.93.189.92
```

## Step 2: Deploy Application

Once connected to EC2, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Clone repository
cd /home/ubuntu
git clone https://github.com/sainathyai/MathSageAI.git
cd MathSageAI

# Create .env.local file
nano .env.local
```

## Step 3: Configure Environment Variables

Paste this into `.env.local` (press Ctrl+O to save, Ctrl+X to exit):

```env
# OpenAI
OPENAI_API_KEY=your-actual-openai-api-key

# AWS Configuration  
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=mathsage-sessions
S3_BUCKET_NAME=mathsageai-images

# Application
NEXT_PUBLIC_APP_URL=http://98.93.189.92:3000

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_Bx9K9vP2c
NEXT_PUBLIC_COGNITO_CLIENT_ID=4h5clbiu4n5kdbgjgblhd9kck9
```

## Step 4: Build and Deploy

```bash
# Install dependencies
npm ci

# Build Next.js app
npm run build

# Start with PM2
pm2 start npm --name "mathsageai" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Copy and run the command that PM2 outputs
```

## Step 5: Access Your Application

Open your browser and navigate to:
- **http://98.93.189.92:3000**

## Useful Commands

### PM2 Management

```bash
# View logs
pm2 logs mathsageai

# Restart application
pm2 restart mathsageai

# Stop application
pm2 stop mathsageai

# Check status
pm2 status

# Monitor resources
pm2 monit
```

### Application Updates

```bash
cd /home/ubuntu/MathSageAI
git pull origin master
npm ci
npm run build
pm2 restart mathsageai
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory
free -h

# Check system load
htop
```

## Optional: Configure Custom Domain

If you have a domain (e.g., mathsageai.sainathyai.com):

1. **Add A Record** in your DNS:
   - Type: A
   - Name: mathsageai
   - Value: 98.93.189.92
   - TTL: 300

2. **Update .env.local**:
   ```env
   NEXT_PUBLIC_APP_URL=http://mathsageai.sainathyai.com:3000
   ```

3. **Restart app**:
   ```bash
   pm2 restart mathsageai
   ```

## ✅ Nginx Reverse Proxy (Already Configured)

Nginx is already set up as a reverse proxy on port 80, forwarding to Next.js on port 3000.

**Configuration Location**: `/etc/nginx/sites-available/mathsageai`

### Optional: Add SSL with Let's Encrypt (Recommended for Production)

To enable HTTPS, install Certbot and get a free SSL certificate:

```bash
# SSH into EC2
ssh -i mathsageai-ec2-key.pem ubuntu@98.93.189.92

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (interactive)
sudo certbot --nginx -d mathsageai.sainathyai.com

# Follow prompts:
# - Enter your email
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

After SSL is configured, your site will be available at:
- **https://mathsageai.sainathyai.com** (HTTPS - secure)
- http://mathsageai.sainathyai.com will redirect to HTTPS

Certbot automatically configures:
- SSL certificates (auto-renewal every 90 days)
- HTTPS redirect
- Security headers
- Certificate renewal cron job

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs mathsageai --lines 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 kill
pm2 start npm --name "mathsageai" -- start
```

### Can't connect via SSH
- Check security group allows SSH (port 22)
- Verify SSH key permissions: `icacls mathsageai-ec2-key.pem`
- Try using instance's public DNS instead of IP

### Session persistence not working
- Verify AWS credentials are configured
- Check DynamoDB table exists: `aws dynamodb list-tables`
- Check EC2 instance has IAM role or .env has AWS credentials

## Cost Monitoring

**Estimated Monthly Cost** (t3.medium):
- EC2 Instance: ~$30/month
- Data Transfer: ~$5-10/month
- Storage (20GB): ~$2/month
- **Total**: ~$37-42/month

To stop instance when not in use:
```bash
# From your local machine
aws ec2 stop-instances --instance-ids i-0158b20c6a22170d1 --region us-east-1

# Start it again
aws ec2 start-instances --instance-ids i-0158b20c6a22170d1 --region us-east-1
```

## Support

- **Instance ID**: i-0158b20c6a22170d1
- **Region**: us-east-1
- **Security Group**: sg-08368523b5c493482
- **SSH Key**: mathsageai-ec2-key

