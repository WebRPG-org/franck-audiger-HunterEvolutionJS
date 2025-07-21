<?php include 'lang.php'; ?>
<!DOCTYPE html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= t('Notes de version','Release notes') ?></title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="icon.png" type="image/png">
</head>
<body>
  <div class="lang-switch">
    <a href="?lang=fr">🇫🇷</a>
    <a href="?lang=en">🇬🇧</a>
  </div>
  <h1><?= t('Notes de version','Release notes') ?></h1>
  <div class="container">
    <section class="release">
      <h2>Version 0.4.0 : <?= t("Fin de Milestone 3","End of Milestone 3") ?></h2>
      <ul>
        <li><?= t("Finalisation de la première version des traductions anglais","Finalization of the first version of English translations") ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.5 : <?= t("Overlay nuit & Traduction site & Tri fichiers","Night Overlay fixes & Site traduction & sorting") ?></h2>
      <ul>
        <li><?= t("Amélioration de l'overlay nuit et correctifs pour la version web","Improved night overlay and fixes for the web version") ?></li>
        <li><?= t('Tri des fichiers desktop par date de modification','Sort desktop files by modification date') ?></li>
        <li><?= t('Traduction sur le site','Website traduction') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.4 : <?= t("Mineur bugs fixe & pipelines deploiements","Minor bug fixes & deployment pipelines") ?></h2>
      <ul>
        <li><?= t('Release technique faite avec des pipelines','Technical release done with pipelines') ?></li>
        <li><?= t('Quelque bug fix mineur','Some minor bug fixes') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.3 : <?= t("Ajustements d’écran & Système de sauvegarde & Autres fix de retours","Screen adjustments & Save system & other feedback fixes") ?></h2>
      <ul>
        <li><?= t("Ajustements d’écran pour l'adaptation à l'écran et divers fix graphique.","Screen adjustments for display adaptation and various graphic fixes.") ?></li>
        <li><?= t('Systeme de sauvegarde terminer.','Save system completed.') ?></li>
        <li><?= t('Refonte QTE Lac','Refactor Lake QTE') ?></li>
        <li><?= t("Masquage du Nen et de toute mention a celui-ci tant qu'il n'est pas debloquer","Hide Nen and any mention of it until it is unlocked") ?></li>
        <li><?= t('Refactor du niveau de difficulté du QTE du lac','Refactor the difficulty level of the lake QTE') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.2 : <?= t("Fix des premier feedbacks","Fix of the first feedbacks") ?></h2>
      <ul>
        <li><?= t("Ajout d'un system de sauvegarde avec fichier locaux au lieu du cache browser pour la version WEB (Attention ne marche pas encore avec les autosave)","Added a save system with local files instead of browser cache for the WEB version (Does not yet work with autosave)") ?></li>
        <li><?= t('Modification des tile dans la forêt côtiere pour trouver le chemin plus facilement','Changed tiles in the Coastal Forest to more easily find the path') ?></li>
        <li><?= t("Ajout d'un PNJ et d'une carte pour la fôret du grand cedre","Added an NPC and a map for the Great Cedar forest") ?></li>
        <li><?= t("Masquage du Nen et de toute mention a celui-ci tant qu'il n'est pas debloquer","Hide Nen and any mention of it until it is unlocked") ?></li>
        <li><?= t('Refactor du niveau de difficulté du QTE du lac','Refactor the difficulty level of the lake QTE') ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.3.1 : <?= t("Travail sur control clic","Working on Touch control") ?></h2>
      <ul>
        <li><?= t("Début de l'implémentation Touch (Andoid & souris)","Beginning of Touch implementation (Android & mouse)") ?></li>
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
