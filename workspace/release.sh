#!/bin/bash

set -e  # Stop on error

TAG_NAME="$1"

if [ -z "$TAG_NAME" ]; then
  echo "❌ Aucun tag fourni. Abandon."
  exit 1
fi

echo "🏷 Clonage du tag $TAG_NAME..."

echo "🧹 Suppression de ./tmp..."
rm -rf ./tmp

echo "📁 Création de ./tmp..."
mkdir ./tmp
cd ./tmp

echo "📥 Clonage du dépôt à partir du tag $TAG_NAME..."
git clone --branch "$TAG_NAME" --depth 1 https://github.com/franck-audiger/HunterEvolutionJS.git .

echo "📁 Copie des fichiers vers le dossier game..."

DEST_BASE=/home/u116286536/domains/hunter-evolution-game.com/public_html/workspace/buildWeb/Hunter
DEST="$DEST_BASE/www"

cp -vr ./data/* "$DEST/data/"
cp -vr ./fonts/* "$DEST/fonts/"
cp -vr ./icon/* "$DEST/icon/"
cp -vr ./img/* "$DEST/img/"
cp -vr ./audio/* "$DEST/audio/"
cp -vr ./movies/* "$DEST/movies/"
cp -vr ./js/* "$DEST/js/"

cd ..

echo "📦 Création de l'archive ZIP..."
cd /home/u116286536/domains/hunter-evolution-game.com/public_html/workspace/buildWeb
zip -r "Hunter$TAG_NAME.zip" Hunter

cp /home/u116286536/domains/hunter-evolution-game.com/public_html/workspace/buildWeb/Hunter$TAG_NAME.zip /home/u116286536/domains/hunter-evolution-game.com/public_html/desktop/Hunter$TAG_NAME.zip

echo "✅ Déploiement et archivage du tag $TAG_NAME terminé avec succès."