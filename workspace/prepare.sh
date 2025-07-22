#!/bin/bash

set -e  # Stop on error

DEST_WEB="/home/u116286536/domains/hunter-evolution-game.com/public_html"
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

# --- Copie des éléments du site ---
echo "📁 Copie des fichiers du workspace..."

# --- Vérification de l'existence des fichiers attendus ---
if [ ! -d "./workspace" ]; then
  echo "❌ Dossiers sources manquants dans le dépôt cloné. Abandon."
  exit 1
fi


cp -vr ./workspace/*                    "$DEST_WEB/workspace/"

cd ..
