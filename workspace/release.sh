#!/bin/bash

set -e  # Stop on error

TAG_NAME="$1"

if [ -z "$TAG_NAME" ]; then
  echo "❌ Aucun tag fourni. Abandon."
  exit 1
fi

echo "🏷 Clonage du tag $TAG_NAME..."

echo "🧹 Suppression de ./tmpRelease..."
rm -rf ./tmpRelease

echo "📁 Création de ./tmpRelease..."
mkdir ./tmpRelease
cd ./tmpRelease

echo "📥 Clonage du dépôt à partir du tag $TAG_NAME..."
git clone --branch "$TAG_NAME" --depth 1 https://github.com/franck-audiger/HunterEvolutionJS.git .


echo "📁 Vérification des fichier..."
# --- Vérification de l'existence des fichiers attendus ---
if [ ! -d "./data" ] || [ ! -d "./fonts" ] || [ ! -d "./js" ] || [ ! -d "./icon" ] || [ ! -d "./img" ] || [ ! -d "./audio" ] || [ ! -d "./movies" ]; then
  echo "❌ Dossiers sources manquants dans le dépôt cloné. Abandon."
  exit 1
fi

# --- Copie vers le dossier web live ---
echo "📁 Copie des fichiers vers le dossier du jeu web..."
DEST_WEB="/home/u116286536/domains/hunter-evolution-game.com/public_html"
DEST_GAME="$DEST_WEB/game"

cp -vr ./data/*    "$DEST_GAME/data/"
cp -vr ./fonts/*   "$DEST_GAME/fonts/"
cp -vr ./icon/*    "$DEST_GAME/icon/"
cp -vr ./img/*     "$DEST_GAME/img/"
cp -vr ./audio/*   "$DEST_GAME/audio/"
cp -vr ./movies/*  "$DEST_GAME/movies/"
cp -vr ./js/*      "$DEST_GAME/js/"

# --- Copie vers le dossier de build Windows ---
echo "📁 Copie des fichiers vers le dossier de build Windows..."
DEST="$DEST_WEB/workspace/buildWeb/Hunter/www"

cp -vr ./data/*    "$DEST/data/"
cp -vr ./fonts/*   "$DEST/fonts/"
cp -vr ./icon/*    "$DEST/icon/"
cp -vr ./img/*     "$DEST/img/"
cp -vr ./audio/*   "$DEST/audio/"
cp -vr ./movies/*  "$DEST/movies/"
cp -vr ./js/*      "$DEST/js/"

# --- Copie des éléments du site ---
echo "📁 Copie des fichiers du site et du workspace..."


# --- Vérification de l'existence des fichiers attendus ---
if [ ! -d "./workspace" ] || [ ! -d "./site/desktop" ]; then
  echo "❌ Dossiers sources manquants dans le dépôt cloné. Abandon."
  exit 1
fi

cp -vr ./workspace/*         "$DEST_WEB/workspace/"
cp -vr ./site/desktop/*      "$DEST_WEB/desktop/"
cp -v ./*                    "$DEST_WEB/"

cd ..

rm -rf ./tmpRelease

echo "📦 Création de l'archive ZIP..."

cd /home/u116286536/domains/hunter-evolution-game.com/public_html/workspace/buildWeb
zip -r "Hunter$TAG_NAME.zip" Hunter

mv /home/u116286536/domains/hunter-evolution-game.com/public_html/workspace/buildWeb/Hunter$TAG_NAME.zip /home/u116286536/domains/hunter-evolution-game.com/public_html/desktop/Hunter$TAG_NAME.zip

echo "✅ Déploiement et archivage du tag $TAG_NAME terminé avec succès."