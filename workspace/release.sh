#!/bin/bash

set -e  # Stop on error

TAG_NAME="$1"
if [ -z "$TAG_NAME" ]; then
  echo "❌ Aucun tag fourni. Abandon."
  exit 1
fi

echo "🚀 Déploiement du tag $TAG_NAME..."

# --- Chemins ---
DEST_WEB="/home/u116286536/domains/hunter-evolution-game.com/public_html"
DEST_GAME="$DEST_WEB/game"
DEST_BUILD="$DEST_WEB/workspace/buildWeb/Hunter/www"
ZIP_OUTPUT="$DEST_WEB/desktop/Hunter$TAG_NAME.zip"

# --- Dossiers à vérifier/copy ---
REQUIRED_DIRS=("data" "fonts" "js" "icon" "img" "audio" "movies" "workspace" "site")
RESOURCE_FOLDERS=("data" "fonts" "icon" "img" "audio" "movies" "js")

echo "📁 Vérification des dossiers requis..."
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "./$dir" ]; then
    echo "❌ Dossier manquant : $dir"
    exit 1
  fi
done

# --- Copie vers le jeu web ---
echo "📁 Copie des fichiers vers le dossier du jeu web ($DEST_GAME)..."
for folder in "${RESOURCE_FOLDERS[@]}"; do
  mkdir -p "$DEST_GAME/$folder"
  cp -vr "./$folder/"* "$DEST_GAME/$folder/"
done

# --- Copie vers le build Windows ---
echo "📁 Copie des fichiers vers le build Windows ($DEST_BUILD)..."
for folder in "${RESOURCE_FOLDERS[@]}"; do
  mkdir -p "$DEST_BUILD/$folder"
  cp -vr "./$folder/"* "$DEST_BUILD/$folder/"
done

# --- Copie des fichiers du site ---
echo "📁 Copie des fichiers du site web..."
SITE_FILES=(
  "desktop/index.php"
  "bug-reports.php"
  "favicon.ico"
  "feedback.php"
  "contact.php"
  "icon.png"
  "icon-36.png"
  "icon-48.png"
  "icon-72.png"
  "icon-96.png"
  "icon-144.png"
  "icon-192.png"
  "index.php"
  "lang.php"
  "en.png"
  "fr.png"
  "header.php"
  "release-note.php"
  "style.css"
)

for file in "${SITE_FILES[@]}"; do
  src="./site/$file"
  dest="$DEST_WEB/${file##*/}"
  if [ -f "$src" ]; then
    cp -v "$src" "$dest"
  else
    echo "⚠️ Fichier manquant (ignoré) : $src"
  fi
done

# --- Nettoyage temporaire ---
echo "🧹 Nettoyage des fichiers temporaires..."
cd ..
rm -rf ./tmpRelease

# --- Création de l’archive ZIP ---
echo "📦 Création de l’archive ZIP Hunter$TAG_NAME.zip..."
cd "$DEST_WEB/workspace/buildWeb"
zip -r "Hunter$TAG_NAME.zip" Hunter
mv "Hunter$TAG_NAME.zip" "$ZIP_OUTPUT"

echo "✅ Déploiement et archivage du tag $TAG_NAME terminé avec succès."