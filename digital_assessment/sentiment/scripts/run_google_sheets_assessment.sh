#!/bin/bash
# Quick-start script for Google Sheets ITO Assessment

echo "=============================================================================="
echo "GOOGLE SHEETS ITO ASSESSMENT - QUICK START"
echo "=============================================================================="
echo ""

# Set credentials path (using existing file)
export GOOGLE_CREDENTIALS_PATH="/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json"

# Check if spreadsheet ID is provided
if [ -z "$1" ]; then
    echo "⚠️  Please provide your Google Spreadsheet ID"
    echo ""
    echo "Usage:"
    echo "  ./run_google_sheets_assessment.sh YOUR_SPREADSHEET_ID"
    echo ""
    echo "To find your Spreadsheet ID:"
    echo "1. Open your Google Sheet"
    echo "2. Look at the URL:"
    echo "   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit"
    echo "   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
    echo ""
    echo "Example:"
    echo "  ./run_google_sheets_assessment.sh 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
    echo ""
    exit 1
fi

export GOOGLE_SPREADSHEET_ID="$1"

echo "✅ Using credentials: tourism-development-d620c-5c9db9e21301.json"
echo "✅ Spreadsheet ID: $GOOGLE_SPREADSHEET_ID"
echo ""
echo "Before running, make sure:"
echo "  1. Service account has access to your sheet"
echo "     Email: tourism-development-d620c@appspot.gserviceaccount.com"
echo "  2. Sheet has columns A-D with ITO data"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Run the processor
python3 google_sheets_ito_processor.py

echo ""
echo "=============================================================================="
echo "✅ COMPLETE! Check your Google Sheet for 'ITO Assessment Results' tab"
echo "=============================================================================="
