#!/bin/bash

# Tourism Commons Digital Assessment - Local Development Setup
echo "🚀 Setting up local development environment..."

# Check if we're in the right directory
if [ ! -f "digital_assessment/app/api/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create environment file for API
echo "📝 Creating environment configuration..."
cat > digital_assessment/app/api/.env << 'EOF'
# Google Sheets Configuration
SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your_project_id","private_key_id":"your_private_key_id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n","client_email":"your_service_account_email@your_project_id.iam.gserviceaccount.com","client_id":"your_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email%40your_project_id.iam.gserviceaccount.com"}

# Server Configuration
PORT=8787
NODE_ENV=development

# Firebase Configuration (for local development)
FIREBASE_PROJECT_ID=tourism-development-d620c
FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost
FIREBASE_FUNCTIONS_EMULATOR_PORT=5009
EOF

echo "✅ Environment file created at digital_assessment/app/api/.env"
echo "⚠️  Please update the .env file with your actual Google Sheets credentials"

# Install dependencies
echo "📦 Installing dependencies..."

# Install API dependencies
echo "Installing API dependencies..."
cd digital_assessment/app/api
npm install
cd ../../

# Install Web dependencies
echo "Installing Web dependencies..."
cd digital_assessment/app/web
npm install
cd ../../

# Install Functions dependencies
echo "Installing Functions dependencies..."
cd digital_assessment/functions
npm install
cd ../../

# Build functions
echo "🔨 Building Firebase functions..."
cd digital_assessment/functions
npm run build
cd ../../

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development environment:"
echo "1. Update digital_assessment/app/api/.env with your Google Sheets credentials"
echo "2. Run: ./start-local.sh"
echo ""
echo "📋 Services will be available at:"
echo "- Web App: http://localhost:5173"
echo "- API Server: http://localhost:8787"
echo "- Firebase Functions: http://localhost:5009"
echo "- Firebase Emulator UI: http://localhost:4003"

