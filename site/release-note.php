<?php include 'lang.php'; ?>
<?php
$title = t('Notes de version','Release notes');
$base = '';
include 'header.php';
?>
  <h1><?= $title ?></h1>
  <div class="container">
    <section class="release">
      <h2>Version 0.5.1.0 : <?= t("Phase 1 Exam Hunter", "Phase 1 Exam Hunter") ?></h2>
      <ul>
        <li><?= t("Phase 1 Exam Hunter fini.", "Phase 1 Exam Hunter finished.") ?></li>
        <li><?= t("Mini-jeu Marécage, avec popup Fraisosaure", "Mini-game Swamp, with Strawsaurus popup") ?></li>
        <li><?= t("Mini-jeu poursuite Satotsu", "Mini-game Pursuit Satotsu") ?></li>
        <li><?= t("Scene combat Hisoka et Cherry (Avec combat bonus si poursuite Satotsu ok)", "Scene combat Hisoka et Cherry (With bonus fight if Satotsu pursuit ok)") ?></li>
        <li><?= t("Scene combat Hisoka et Gon Leolio", "Scene combat Hisoka et Gon Leolio") ?></li>
        <li><?= t("Refactor du dash, fix bug pendant scene cinématique", "Refactor dash, fix bug during cinematic scene") ?></li>
        <li><?= t("Performance and refactor of fogs", "Performance and refactor of fogs") ?></li>
        <li><?= t("Retour au sauvegarde classique", "Return to classic save") ?></li>
        <li><?= t("Installeur propose conservation des sauvegardes", "Installer offers save preservation") ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.5.0.0 : <?= t("Debut Phase 1 Exam Hunter", "Starting Phase 1 Exam Hunter") ?></h2>
      <ul>
        <li><?= t("Ajout des scenes d'introduction : Tompa, Hisoka, Killua, Phase 1", "Adding introduction scenes: Tompa, Hisoka, Killua, Phase 1") ?></li>
        <li><?= t("Mini-jeu course phase1", "Mini-game race phase 1") ?></li>
        <li><?= t("Installeur pour le build desktop", "Installer for desktop build") ?></li>
      </ul>
    </section>
    <section class="release">
      <h2>Version 0.4.1 : <?= t("Corrections diverses et améliorations", "Misc fixes and improvements") ?></h2>
      <ul>
        <li><?= t("Début du support pour les petits écrans", "Start support for small screens") ?></li>
        <li><?= t("Ajout du support du redimensionnement d'écran", "Adding support for screen resizing") ?></li>
        <li><?= t("Support du mode plein écran/fenêtré sur ordinateur (et le redimensionnement fonctionne sur la version web)", "Fullscreen/Windowed mode support on desktop (and resize works for web version)") ?></li>
        <li><?= t("Correction d’un bug sur le bouton 'Continuer' du menu Titre", "Fixing bug on the Title menu 'Continue' button") ?></li>
        <li><?= t("Ajout d’un message indiquant au joueur qu’il peut se défendre en combat", "Add message informing the player they can use defense in battles") ?></li>
        <li><?= t("Ajout d’un avertissement légal sur le site web", "Add legal disclaimer on website") ?></li>
        <li><?= t("Ajout d’un formulaire de contact sur le site web", "Add contact form on website") ?></li>
        <li><?= t("Refonte graphique du site web", "Graphics refactor of website") ?></li>
      </ul>
    </section>
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
