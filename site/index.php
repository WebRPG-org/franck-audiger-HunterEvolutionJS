<?php include 'lang.php'; ?>
<!DOCTYPE html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8">
  <title>Hunter x Hunter Evolution</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="icon.png" type="image/png">
</head>
<body>
  <div class="lang-switch">
    <a href="?lang=fr">FR</a> |
    <a href="?lang=en">EN</a>
  </div>
  <h1>Hunter x Hunter Evolution</h1>
  <p class="intro"><?= t("Hunter x Hunter Evolution est un projet de fan élaboré par un passionné du manga et de technique. L'objectif est de proposer une version du jeu qui retrace fidèlement l'histoire de l'anime de 2011.", "Hunter x Hunter Evolution is a fan project developed by a manga and technology enthusiast. The goal is to offer a version of the game that faithfully follows the story of the 2011 anime.") ?></p>
  <a href="/desktop/?lang=<?= $lang ?>" class="btn">🖥️ <?= t('Télécharger la version Desktop','Download Desktop version') ?></a>
  <!-- <a href="/android/?lang=<?= $lang ?>" class="btn">📱 <?= t('Télécharger la version Android','Download Android version') ?> -->
  <a href="/game/?lang=<?= $lang ?>" class="btn">🌐 <?= t('Jouer en ligne','Play online') ?></a>
  <a href="/release-note.php?lang=<?= $lang ?>" class="btn">📝 <?= t('Notes de version','Release Notes') ?></a>
  <a href="/bug-reports.php?lang=<?= $lang ?>" class="btn">🐞 <?= t('Signaler un bug','Report a bug') ?></a>
  <a href="/feedback.php?lang=<?= $lang ?>" class="btn">💬 <?= t('Donner un avis/Suggestions','Give feedback/Suggestions') ?></a>
</body>
</html>
