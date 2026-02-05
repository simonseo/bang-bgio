#!/bin/bash

# Asset download script for Bang! card game
# This is a placeholder - manual download is recommended

echo "Bang! Asset Download Helper"
echo "============================"
echo ""
echo "Manual download is recommended:"
echo "1. Visit https://bang-cardgame.fandom.com/wiki/List_Of_Cards"
echo "2. Right-click and save images for each card"
echo "3. Rename to lowercase with hyphens (e.g., 'bang.png', 'missed.png')"
echo "4. Place in public/assets/cards/ folders:"
echo "   - playing/ for instant cards"
echo "   - weapons/ for weapons"
echo "   - equipment/ for equipment"
echo "   - characters/ for character portraits"
echo ""
echo "Estimated time: 2-3 hours for all 80+ images"
echo ""
echo "Alternative sources:"
echo "- WeeWabbit Guide: https://weewabbit.com/bang-card-game-simplified-rules-strategy-guide/"
echo "- Official game assets (if available)"
echo ""

# Create directories
mkdir -p ../public/assets/cards/{playing,weapons,equipment,characters}
mkdir -p ../public/assets/icons/{suits,ui}
mkdir -p ../public/assets/backgrounds

echo "Created asset directories."
echo ""
echo "The game will use placeholder cards until real images are added."
