#!/bin/bash

# === CONFIGURATION ===
ACCESS_TOKEN="ya29.a0AS3H6NyCY3uEAEbOWu70OE79dyJhMZIVYu3Ta1H8XeCLinWypV7gF6fOrKhBx_kuiGZxiaeY8fHwMjLmmRl4mq9DPT3uHXqHUDCF5iPIDdJQIJWr695nVdGgoohEn5gHfi9TKUDaV7PyrZO2u-_T5KCAO1ROAIN5-b3loQhpaCgYKAUQSARESFQHGX2MiBd7pMUWjiT7JfJBztaM_Ig0175"
ZIP_FILE_PATH="HunterV0.4.1.zip"
ZIP_FILE_NAME="$(basename "$ZIP_FILE_PATH")"
MIME_TYPE="application/zip"

# === UPLOAD ===
echo "⬆️ Uploading $ZIP_FILE_PATH to Google Drive..."

response=$(curl -s -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "metadata={name :'$ZIP_FILE_NAME'};type=application/json;charset=UTF-8" \
  -F "file=@$ZIP_FILE_PATH;type=$MIME_TYPE" \
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart")

echo "🧾 Réponse de l'API :"
echo "$response"

# === PARSE FILE ID ===
file_id=$(echo "$response" | grep -o '"id": *"[^"]*"' | sed 's/"id": *"//;s/"//')

if [[ -n "$file_id" && "$file_id" != "null" ]]; then
  echo "✅ Fichier uploadé avec succès ! ID : $file_id"
  echo "🔗 Lien : https://drive.google.com/file/d/$file_id/view"
else
  echo "❌ Erreur lors de l'upload ou du parsing JSON :"
  echo "$response"
fi