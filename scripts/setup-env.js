#!/usr/bin/env node

/**
 * Setup script to create .env.local from .env.example
 * Run: node scripts/setup-env.js
 */

const fs = require('fs')
const path = require('path')

const envExamplePath = path.join(process.cwd(), '.env.example')
const envLocalPath = path.join(process.cwd(), '.env.local')

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists. Skipping setup.')
  console.log('   If you want to recreate it, delete .env.local first.')
  process.exit(0)
}

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example not found. Please create it first.')
  process.exit(1)
}

// Copy .env.example to .env.local
try {
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8')
  fs.writeFileSync(envLocalPath, envExampleContent)
  
  console.log('✅ Created .env.local from .env.example')
  console.log('📝 Please edit .env.local and add your actual values:')
  console.log('   - OPENAI_API_KEY: Your OpenAI API key')
  console.log('   - Other values should be correct for your AWS setup')
  console.log('')
  console.log('💡 Note: AWS credentials are loaded from ~/.aws/credentials automatically')
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message)
  process.exit(1)
}

