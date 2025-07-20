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

# --- Vérification de l'existence des fichiers attendus ---
if [ ! -d "./data" ] || [ ! -d "./fonts" ] || [ ! -d "./js" ] || [ ! -d "./icon" ] || [ ! -d "./img" ] || [ ! -d "./audio" ] || [ ! -d "./movies" ]; then
  echo "❌ Dossiers sources manquants dans le dépôt cloné. Abandon."
  exit 1
fi 

DEST=/home/u116286536/domains/hunter-evolution-game.com/public_html/game-dev

cp -vr ./data/* "$DEST/data/"
cp -vr ./fonts/* "$DEST/fonts/"
cp -vr ./icon/* "$DEST/icon/"
cp -vr ./img/* "$DEST/img/"
cp -vr ./audio/* "$DEST/audio/"
cp -vr ./movies/* "$DEST/movies/"
cp -vr ./js/* "$DEST/js/"

cd ..

rm -rf ./tmp

echo "✅ Déploiement du commit terminé avec succès."