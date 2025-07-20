<?php
include '../lang.php';
$files = array_merge(glob('*.7z'), glob('*.zip'));

// Tri décroissant par date de modification
usort($files, function($a, $b) {
    return filemtime($b) - filemtime($a);
});
?>
<!DOCTYPE html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8">
  <title><?= t('Version Desktop','Desktop version') ?></title>
  <link rel="icon" href="../icon.png" type="image/png">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="lang-switch">
    <a href="?lang=fr">FR</a> | <a href="?lang=en">EN</a>
  </div>
  <h1><?= t('Version Desktop','Desktop version') ?></h1>
  <div class="intro">
    <p><?= t("Dézippez l'archive téléchargée puis ouvrez le dossier extrait. Double-cliquez sur l'application <strong>Game</strong> pour lancer le jeu. Les sauvegardes se trouvent dans le dossier <strong>save</strong> et peuvent être copiées pour être réutilisées dans une nouvelle version.",
            "Unzip the downloaded archive and open the extracted folder. Double-click the <strong>Game</strong> application to start. Saves are in the <strong>save</strong> folder and can be copied to use in a new version.") ?></p>
  </div>
  <div class="container">
    <h2><?= t('Fichiers disponibles','Available files') ?></h2>
    <ul>
      <?php foreach ($files as $file): ?>
        <li><a href="<?= htmlspecialchars($file) ?>" download><?= htmlspecialchars($file) ?></a></li>
      <?php endforeach; ?>
    </ul>
  </div>
</body>
</html>
