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
  <div class="disclaimer">
  <h2><?= t('Mention légale', 'Legal Notice') ?></h2>
    <p>
      <?= t(
        "Ce site et ce jeu sont des projets de fans sans but lucratif. Aucun contenu n'est utilisé à des fins commerciales. Hunter x Hunter Evolution n'est pas affilié à Yoshihiro Togashi, Shueisha, Madhouse, ou toute autre entité officielle liée à Hunter x Hunter. Sur simple demande des ayants droit, tout contenu sera retiré immédiatement.",
        "This site and game are non-commercial fan projects. No content is used for profit. Hunter x Hunter Evolution is not affiliated with Yoshihiro Togashi, Shueisha, Madhouse, or any official Hunter x Hunter entity. Upon request from rights holders, any content will be removed immediately."
      ) ?>
    </p>
  </div>
</body>
</html>
