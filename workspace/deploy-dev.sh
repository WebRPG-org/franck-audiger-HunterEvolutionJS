#!/bin/bash

set -e  # Stop on error

echo "🧹 Suppression de ./tmp..."
rm -rf ./tmp

echo "📁 Création de ./tmp..."
mkdir ./tmp
cd ./tmp

echo "📥 Clonage de la branche main du repo HunterEvolutionJS..."
git clone --branch main https://github.com/franck-audiger/HunterEvolutionJS.git .

echo "📁 Copie des fichiers vers le dossier game-dev..."

DEST=/home/u116286536/domains/hunter-evolution-game.com/public_html/game-dev

cp -v ./index.html "$DEST/index.html"
cp -v ./icon.png "$DEST/icon.png"
cp -v ./package.json "$DEST/package.json"

cp -vr ./data/* "$DEST/data/"
cp -vr ./fonts/* "$DEST/fonts/"
cp -vr ./icon/* "$DEST/icon/"
cp -vr ./img/* "$DEST/img/"
cp -vr ./json/* "$DEST/json/"
cp -vr ./movies/* "$DEST/movies/"

cd ..

rm -rf ./tmp