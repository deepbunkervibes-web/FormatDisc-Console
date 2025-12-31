#!/bin/bash

# Format Disc Website Deployment Script
# This script automates the deployment of the Format Disc website to cPanel

# Configuration
FTP_HOST="formatdisc.hr"
FTP_USER="formatdi"
FTP_PASS="S1Sx]rSEtd9)79"
REMOTE_DIR="/public_html"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Format Disc Website Deployment Script ===${NC}"
echo -e "${YELLOW}Starting deployment process...${NC}"

# Check if required tools are installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is not installed. Please install curl and try again.${NC}"
    exit 1
fi

if ! command -v unzip &> /dev/null; then
    echo -e "${RED}Error: unzip is not installed. Please install unzip and try again.${NC}"
    exit 1
fi

if ! command -v lftp &> /dev/null; then
    echo -e "${RED}Error: lftp is not installed. Please install lftp and try again.${NC}"
    exit 1
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}Created temporary directory: $TEMP_DIR${NC}"

# Download the deployment package
echo -e "${YELLOW}Downloading deployment package...${NC}"
curl -L -o "$TEMP_DIR/formatdisc_deployment.zip" "https://example.com/formatdisc_deployment.zip"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to download deployment package.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${GREEN}Successfully downloaded deployment package.${NC}"

# Extract the deployment package
echo -e "${YELLOW}Extracting deployment package...${NC}"
unzip -q "$TEMP_DIR/formatdisc_deployment.zip" -d "$TEMP_DIR"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to extract deployment package.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${GREEN}Successfully extracted deployment package.${NC}"

# Upload files to server
echo -e "${YELLOW}Uploading files to server...${NC}"
echo -e "${YELLOW}This may take a few minutes depending on your internet connection.${NC}"

# Create lftp script
LFTP_SCRIPT="$TEMP_DIR/lftp_script.txt"
cat > "$LFTP_SCRIPT" << EOF
open -u $FTP_USER,$FTP_PASS $FTP_HOST
set ssl:verify-certificate no
mirror -R $TEMP_DIR/formatdisc $REMOTE_DIR
put -O $REMOTE_DIR $TEMP_DIR/contact.php
bye
EOF

# Execute lftp script
lftp -f "$LFTP_SCRIPT"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to upload files to server.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${GREEN}Successfully uploaded files to server.${NC}"

# Set file permissions
echo -e "${YELLOW}Setting file permissions...${NC}"

PERMISSION_SCRIPT="$TEMP_DIR/permission_script.txt"
cat > "$PERMISSION_SCRIPT" << EOF
open -u $FTP_USER,$FTP_PASS $FTP_HOST
set ssl:verify-certificate no
chmod 755 $REMOTE_DIR
find $REMOTE_DIR -type d -exec chmod 755 {} \;
find $REMOTE_DIR -type f -exec chmod 644 {} \;
chmod 644 $REMOTE_DIR/contact.php
bye
EOF

# Execute permission script
lftp -f "$PERMISSION_SCRIPT"

if [ $? -ne 0 ]; then
    echo -e "${RED}Warning: Failed to set file permissions. The website may still work, but you may need to set permissions manually.${NC}"
else
    echo -e "${GREEN}Successfully set file permissions.${NC}"
fi

# Clean up
echo -e "${YELLOW}Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"
echo -e "${GREEN}Successfully cleaned up temporary files.${NC}"

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://formatdisc.hr")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}Deployment successful! Your website is now live at https://formatdisc.hr${NC}"
else
    echo -e "${YELLOW}Website deployment may have been successful, but we couldn't verify it.${NC}"
    echo -e "${YELLOW}Please check your website manually at https://formatdisc.hr${NC}"
fi

echo -e "${YELLOW}=== Deployment process completed ===${NC}"
echo -e "${YELLOW}IMPORTANT: For security reasons, please change your cPanel password immediately.${NC}"