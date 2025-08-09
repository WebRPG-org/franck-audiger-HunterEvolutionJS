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
