#!/bin/bash

set -e  # Stop on error



# --- Vérification de tmpRelease ---
TMP_DIR="./tmp"
if [ ! -d "$TMP_DIR" ]; then
  echo "❌ Dossier $TMP_DIR introuvable. Veuillez uploader les fichiers avant de lancer ce script."
  exit 1
fi

cd "$TMP_DIR"

# --- Vérification de l'existence des fichiers attendus ---
if [ ! -d "./data" ] || [ ! -d "./fonts" ] || [ ! -d "./js" ] || [ ! -d "./icon" ] || [ ! -d "./img" ] || [ ! -d "./audio" ] || [ ! -d "./movies" ]; then
  echo "❌ Dossiers sources manquants dans le dépôt cloné. Abandon."
  exit 1
fi

# --- Copie vers le dossier de dev ---
echo "📁 Copie des fichiers vers le dossier game-dev..."
DEST="/home/u116286536/domains/hunter-evolution-game.com/public_html/game-dev"

cp -vr ./data/*    "$DEST/data/"
cp -vr ./fonts/*   "$DEST/fonts/"
cp -vr ./icon/*    "$DEST/icon/"
cp -vr ./img/*     "$DEST/img/"
cp -vr ./audio/*   "$DEST/audio/"
cp -vr ./movies/*  "$DEST/movies/"
cp -vr ./js/*      "$DEST/js/"

cd ..

echo "🧹 Suppression de $TMP_DIR..."
rm -rf "$TMP_DIR"

echo "✅ Déploiement du commit sur la branche main terminé avec succès."