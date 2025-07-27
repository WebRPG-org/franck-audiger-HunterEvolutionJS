<?php include 'lang.php'; ?>
<?php
$title = t('Hunter x Hunter Evolution','Hunter x Hunter Evolution');
$base = '';
include 'header.php';
?>
  <div class="page">
    <p class="intro"><?= t("Hunter x Hunter Evolution est un projet de fan élaboré par un passionné du manga et de technique. L'objectif est de proposer une version du jeu qui retrace fidèlement l'histoire de l'anime de 2011.", "Hunter x Hunter Evolution is a fan project developed by a manga and technology enthusiast. The goal is to offer a version of the game that faithfully follows the story of the 2011 anime.") ?></p>
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
