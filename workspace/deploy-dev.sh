#!/bin/bash

set -e  # Arrêter à la moindre erreur

echo "🧹 Suppression de ./tmp..."
rm -rf ./tmp

echo "📁 Création de ./tmp..."
mkdir ./tmp
cd ./tmp

echo "📥 Clonage de la branche main du repo HunterEvolutionJS..."
git clone --branch main --depth 1 https://github.com/franck-audiger/HunterEvolutionJS.git .

# Chemin de destination
DEST="/home/u116286536/domains/hunter-evolution-game.com/public_html/game-dev"

# Dossiers à copier
RESOURCE_DIRS=("data" "fonts" "js" "icon" "img" "audio" "movies")

echo "📁 Vérification des dossiers sources..."
for dir in "${RESOURCE_DIRS[@]}"; do
  if [ ! -d "./$dir" ]; then
    echo "❌ Dossier manquant : $dir"
    exit 1
  fi
done

echo "📁 Copie des fichiers vers le dossier game-dev..."

for dir in "${RESOURCE_DIRS[@]}"; do
  mkdir -p "$DEST/$dir"
  cp -vr "./$dir/"* "$DEST/$dir/"
done

cd ..
rm -rf ./tmp

echo "✅ Déploiement de la branche main terminé avec succès."