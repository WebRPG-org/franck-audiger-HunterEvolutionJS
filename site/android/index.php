<?php
include '../lang.php';
$files = glob('*.apk');
?>
<?php
$title = t('Version Android','Android version');
$base = '../';
include '../header.php';
?>
  <h1><?= t('Version Android','Android version') ?></h1>
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
</body>
</html>