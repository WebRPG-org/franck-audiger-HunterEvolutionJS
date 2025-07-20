<?php
$files = array_merge(glob('*.7z'), glob('*.zip'));

// Tri décroissant par date de modification
usort($files, function($a, $b) {
    return filemtime($b) - filemtime($a);
});
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Version Desktop</title>
  <link rel="icon" href="../icon.png" type="image/png">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <h1>Version Desktop</h1>
  <div class="intro">
    <p>Dézippez l'archive téléchargée puis ouvrez le dossier extrait. Double-cliquez sur l'application <strong>Game</strong> pour lancer le jeu. Les sauvegardes se trouvent dans le dossier <strong>save</strong> et peuvent être copiées pour être réutilisées dans une nouvelle version.</p>
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
