<?php include 'lang.php'; ?>
<?php
$title = t('Hunter x Hunter Evolution','Hunter x Hunter Evolution');
$base = '';
include 'header.php';
?>
  <div class="page">
    <p class="intro"><?= t("Hunter x Hunter Evolution est un projet de fans, réalisé par passion et sans but lucratif.", "Hunter x Hunter Evolution is a fan-made project, created out of passion and with no commercial purpose.") ?></p>
    <p class="intro"><?= t("Il s’agit d’un hommage à l’univers créé par Yoshihiro Togashi, avec pour objectif de proposer une expérience de jeu inspirée de l’anime de 2011.", "It is a tribute to the universe created by Yoshihiro Togashi, aiming to provide a gameplay experience inspired by the 2011 anime.") ?></p>
    <br>
    <p class="intro"><?= t("Ce projet est développé de manière indépendante et gratuite, uniquement pour la communauté de fans.", "This project is developed independently and distributed for free, solely for the fan community.") ?></p>
    <p class="info">
      <?= t(
        "Vous pouvez jouer en plein écran sur la version web en appuyant sur F11 pour mettre le navigateur en mode plein écran. Cette option fonctionne depuis le site UNIQUEMENT et ne fonctionne pas une fois en jeu (Si vous etes en jeu et qu'il y'a un bug graphique faite F5 pour redémarrer le jeu alors que vous etes en plein écran).",
        "You can play in fullscreen on the web version by pressing F11 to put the browser in fullscreen mode. This works from the site ONLY and does not work once in-game (If you are in-game and there is a graphical bug, press F5 to restart the game while you are in fullscreen)."
      ) ?>
    </p>
    <a href="/desktop/?lang=<?= $lang ?>" class="btn">🖥️ <?= t('Télécharger la version Desktop','Download Desktop version') ?></a>
    <!-- <a href="/android/?lang=<?= $lang ?>" class="btn">📱 <?= t('Télécharger la version Android','Download Android version') ?> -->
    <a href="/game/?lang=<?= $lang ?>" class="btn">🌐 <?= t('Jouer en ligne','Play online') ?></a>
    <a href="/release-note.php?lang=<?= $lang ?>" class="btn">📝 <?= t('Notes de version','Release Notes') ?></a>
    <a href="/bug-reports.php?lang=<?= $lang ?>" class="btn">🐞 <?= t('Signaler un bug','Report a bug') ?></a>
    <a href="/feedback.php?lang=<?= $lang ?>" class="btn">💬 <?= t('Donner un avis/Suggestions','Give feedback/Suggestions') ?></a>
    <a href="/contact.php?lang=<?= $lang ?>" class="btn">📧 <?= t('Contact','Contact') ?></a>
  </div>
  <?php include 'disclaimer.php'; ?>
</body>
</html>
