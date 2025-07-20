#!/bin/bash

set -e  # Stop on error

TAG_NAME="$1"

if [ -z "$TAG_NAME" ]; then
  echo "❌ Aucun tag fourni. Abandon."
  exit 1
fi

# --- Vérification de tmpRelease ---
TMP_DIR="./tmpRelease"
if [ ! -d "$TMP_DIR" ]; then
  echo "❌ Dossier $TMP_DIR introuvable. Veuillez uploader les fichiers avant de lancer ce script."
  exit 1
fi

echo "📁 Accès à $TMP_DIR"
cd "$TMP_DIR"

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
if [ ! -d "./workspace" ] || [ ! -d "./site/bug-reports" ] || [ ! -d "./site/desktop" ] || [ ! -d "./site/feedback" ]; then
  echo "❌ Dossiers sources manquants dans le dépôt cloné. Abandon."
  exit 1
fi


cp -vr ./workspace/*         "$DEST_WEB/workspace/"
cp -vr ./site/bug-reports/*  "$DEST_WEB/bug-reports/"
cp -vr ./site/desktop/*      "$DEST_WEB/desktop/"
cp -vr ./site/feedback/*     "$DEST_WEB/feedback/"
cp -v ./*                    "$DEST_WEB/"

cd ..

echo "🧹 Suppression de $TMP_DIR..."
rm -rf "$TMP_DIR"

# --- Création de l'archive ZIP ---
echo "📦 Création de l'archive ZIP..."
cd "$DEST_WEB/workspace/buildWeb"
ZIP_NAME="Hunter$TAG_NAME.zip"
zip -r "$ZIP_NAME" Hunter

# --- Déplacement final ---
mv "$ZIP_NAME" "$DEST_WEB/desktop/$ZIP_NAME"

echo "✅ Déploiement et archivage du tag $TAG_NAME terminé avec succès."