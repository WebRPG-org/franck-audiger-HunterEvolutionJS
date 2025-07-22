<?php
include '../lang.php';
$files = glob('*.apk');
?>
<?php
$title = t('Version Android','Android version');
$base = '../';
include '../header.php';
?>
  <h1><?= $title ?></h1>
  <div class="intro">
    <p><?= t("Téléchargez l'APK ci-dessous, puis transférez-le sur votre appareil Android. Ouvrez-le pour installer le jeu. Vous devrez peut-être autoriser l'installation de sources inconnues dans les paramètres de sécurité de votre téléphone.",
            'Download the APK below and transfer it to your Android device. Open it to install the game. You may need to allow unknown sources in your phone settings.') ?></p>
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