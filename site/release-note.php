<?php include 'lang.php'; ?>
<!DOCTYPE html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8">
  <title><?= t('Notes de version','Release notes') ?></title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="icon.png" type="image/png">
</head>
<body>
  <div class="lang-switch">
    <a href="?lang=fr">FR</a> | <a href="?lang=en">EN</a>
  </div>
  <h1><?= t('Notes de version','Release notes') ?></h1>
  <div class="container">
    <section class="release">
      <h2>Version 0.3.4 : Fix resize view</h2>
      <ul>
        <li><?= t('Release technique faite avec des pipelines','Technical release done with pipelines') ?></li>
        <li><?= t('Quelque bug fix mineur','Some minor bug fixes') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.3 : Fix resize view</h2>
      <ul>
        <li><?= t("Ajustements d’écran pour l'adaptation à l'écran et divers fix graphique.","Screen adjustments for display adaptation and various graphic fixes.") ?></li>
        <li><?= t('Systeme de sauvegarde terminer.','Save system completed.') ?></li>
        <li>Refactor QTE Lake</li>
        <li><?= t("Masquage du Nen et de toute mention a celui-ci tant qu'il n'est pas debloquer","Hide Nen and any mention of it until it is unlocked") ?></li>
        <li><?= t('Refactor du niveau de difficulté du QTE du lac','Refactor the difficulty level of the lake QTE') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.2 : Fix des premier feedbacks</h2>
      <ul>
        <li><?= t("Ajout d'un system de sauvegarde avec fichier locaux au lieu du cache browser pour la version WEB (Attention ne marche pas encore avec les autosave)","Added a save system with local files instead of browser cache for the WEB version (Does not yet work with autosave)") ?></li>
        <li><?= t('Modification des tile dans la forêt côtiere pour trouver le chemin plus facilement','Changed tiles in the Coastal Forest to more easily find the path') ?></li>
        <li><?= t("Ajout d'un PNJ et d'une carte pour la fôret du grand cedre","Added an NPC and a map for the Great Cedar forest") ?></li>
        <li><?= t("Masquage du Nen et de toute mention a celui-ci tant qu'il n'est pas debloquer","Hide Nen and any mention of it until it is unlocked") ?></li>
        <li><?= t('Refactor du niveau de difficulté du QTE du lac','Refactor the difficulty level of the lake QTE') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.1 : Working on Touch</h2>
      <ul>
        <li><?= t("Début de l'implémentation Touch (Andoid)","Beginning of Touch implementation (Android)") ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3 : Milestone 3</h2>
      <ul>
        <li><?= t('Arc Examen Hunter - Dole','Hunter Exam Arc - Dole') ?></li>
        <li><?= t('Chemin vers Zaban','Path to Zaban') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.2 : Milestone 2</h2>
      <ul>
        <li><?= t('Arc Examen Hunter - Traversé mer','Hunter Exam Arc - Sea crossing') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.1 : Milestone 1</h2>
      <ul>
        <li><?= t('Arc Examen Hunter - Ile de la baleine','Hunter Exam Arc - Whale Island') ?></li>
      </ul>
    </section>
  </div>
</body>
</html>
