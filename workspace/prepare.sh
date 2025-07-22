#!/bin/bash

set -e  # Stop on error

TAG_NAME="$1"

if [ -z "$TAG_NAME" ]; then
  echo "❌ Aucun tag fourni. Abandon."
  exit 1
fi

echo "🏷 Clonage du tag $TAG_NAME..."

# Nettoyage du dossier temporaire
echo "🧹 Suppression de ./tmpRelease..."
rm -rf ./tmpRelease

echo "📁 Création de ./tmpRelease..."
mkdir ./tmpRelease
cd ./tmpRelease

echo "📥 Clonage du dépôt à partir du tag $TAG_NAME..."
git clone --branch "$TAG_NAME" --depth 1 https://github.com/franck-audiger/HunterEvolutionJS.git .

# Vérification des répertoires sources
echo "📁 Vérification des dossiers..."
REQUIRED_DIRS=("data" "fonts" "js" "icon" "img" "audio" "movies" "workspace")

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "./$dir" ]; then
    echo "❌ Dossier manquant : $dir"
    exit 1
  fi
done

# Copie vers le dossier de destination
cp -vr ./tmpRelease/workspace/* "./workspace/"

echo "✅ Préparation du tag $TAG_NAME terminée avec succès."