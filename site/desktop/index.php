<?php
include '../lang.php';
$files = array_merge(glob('*.exe'), array_merge(glob('*.7z'), glob('*.zip')));

// Tri décroissant par date de modification
usort($files, function($a, $b) {
    return filemtime($b) - filemtime($a);
});
?>
<?php
$title = t('Version Desktop','Desktop version');
$base = '../';
include '../header.php';
?>
  <h1><?= $title ?></h1>
  <div class="intro">
    <p><?= t("Double-cliquez sur l'installateur <strong>HunterEvolution</strong> pour lancer l'installation'. Si vous avez déjà installé une version précédente, l'installateur vous proposera de conserver vos sauvegardes.",
            "Double clic on the <strong>HunterEvolution</strong> installer to start the installation. If you have already installed a previous version, the installer will offer to keep your saves.") ?></p>
    <p><strong><?= t("Vous devrez potentiellement contourner SmartScreen pour l'installation.", "You may need to bypass SmartScreen for the installation.") ?></strong></p>
    <p><?= t("Une fois l'installation terminée, vous pouvez lancer le jeu depuis le menu Démarrer ou le bureau.", "Once the installation is complete, you can launch the game from the Start menu or the desktop.") ?></p>
  </div>
  <a href="install.php" class="title-link">
    <?= t("Procédure d'installation", "Installation procedure")?>
  </a>
  <div class="container">
    <h2><?= t('Fichiers disponibles','Available files') ?></h2>
    <ul>
      <?php foreach ($files as $file): ?>
        <li><a href="<?= htmlspecialchars($file) ?>" download><?= htmlspecialchars($file) ?></a></li>
      <?php endforeach; ?>
    </ul>
  </div>
  <?php include '../disclaimer.php'; ?>
</body>
</html>
