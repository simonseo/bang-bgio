#!/bin/bash

# Download Bang! card images from wiki
# This script parses the wiki page and downloads all card images

set -e

WIKI_URL="https://bang-cardgame.fandom.com/wiki/List_Of_Cards"
BASE_DIR="public/assets/cards"

echo "🎴 Bang! Card Image Downloader"
echo "================================"
echo ""

# Create directories
mkdir -p "$BASE_DIR/playing"
mkdir -p "$BASE_DIR/weapons"
mkdir -p "$BASE_DIR/equipment"
mkdir -p "$BASE_DIR/characters"

echo "📥 Fetching card list from wiki..."
HTML=$(curl -s "$WIKI_URL")

# Extract unique image URLs
echo "🔍 Parsing card images..."
IMAGES=$(echo "$HTML" | grep -o 'https://static.wikia.nocookie.net/bang-cardgame/images/[^"]*\.png[^"]*' | sort -u)

# Function to download and rename card
download_card() {
    local url="$1"
    local filename=$(echo "$url" | sed 's/.*\/\([^/]*\)\.png.*/\1/' | sed 's/%21/!/g' | sed 's/%20/ /g')

    # Convert to lowercase with hyphens
    local output_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | tr ' _!' '---' | sed 's/---*/-/g' | sed 's/-$//')

    # Determine folder based on card type
    local folder="playing"

    case "$output_name" in
        *volcanic*|*schofield*|*remington*|*winchester*|*rev-carabine*|*carabine*)
            folder="weapons"
            ;;
        *barrel*|*dynamite*|*jail*|*mustang*|*scope*)
            folder="equipment"
            ;;
        *bart*|*black*|*calamity*|*gringo*|*jesse*|*jourdonnais*|*kit*|*lucky*|*paul*|*pedro*|*rose*|*sid*|*slab*|*suzy*|*vulture*|*willy*)
            folder="characters"
            ;;
    esac

    # Get high-res version (remove scale-to-width-down parameter)
    local highres_url=$(echo "$url" | sed 's/scale-to-width-down\/[0-9]*?//')

    local output_path="$BASE_DIR/$folder/${output_name}.png"

    # Skip if already exists
    if [ -f "$output_path" ]; then
        echo "  ⏭️  Skipping $output_name (already exists)"
        return
    fi

    echo "  📥 Downloading: $output_name → $folder/"

    # Download with retry
    if curl -s -f -o "$output_path" "$highres_url" 2>/dev/null; then
        echo "  ✅ Saved: $output_path"
    else
        echo "  ❌ Failed: $output_name"
    fi
}

# Download each unique image
total=0
success=0

while IFS= read -r url; do
    if [[ ! -z "$url" ]]; then
        ((total++))
        download_card "$url" && ((success++)) || true
    fi
done <<< "$IMAGES"

echo ""
echo "================================"
echo "✨ Download Complete!"
echo ""
echo "📊 Statistics:"
echo "  Total images processed: $total"
echo "  Successfully downloaded: $success"
echo ""
echo "📁 Images saved to:"
echo "  - $BASE_DIR/playing/"
echo "  - $BASE_DIR/weapons/"
echo "  - $BASE_DIR/equipment/"
echo "  - $BASE_DIR/characters/"
echo ""
echo "🎮 Restart your dev server to see the new images!"
echo "   npm run dev"
