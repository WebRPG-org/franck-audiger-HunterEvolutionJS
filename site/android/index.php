<?php
$files = glob('*.apk');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Version Android</title>
  <link rel="icon" href="../icon.png" type="image/png">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <h1>Version Android</h1>
  <div class="intro">
    <p>Téléchargez l'APK ci-dessous, puis transférez-le sur votre appareil Android. Ouvrez-le pour installer le jeu. Vous devrez peut-être autoriser l'installation de sources inconnues dans les paramètres de sécurité de votre téléphone.</p>
  </div>
  <div class="container">
    <h2>Fichiers disponibles</h2>
    <ul>
      <?php foreach ($files as $file): ?>
        <li><a href="<?= htmlspecialchars($file) ?>" download><?= htmlspecialchars($file) ?></a></li>
      <?php endforeach; ?>
    </ul>
  </div>
</body>
</html>