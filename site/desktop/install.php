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
  <div class="container">
    <h2><?= t("Procédure d'installation", "Installation procedure") ?></h2>
     <ol>
    <li>
      <?= t(
        "Téléchargez la dernière version de l’installateur ci-dessous et lancez le fichier .exe.",
        "Download the latest installer below and run the .exe file."
      ) ?>
    </li>
    <p>
      <a href="index.php" class="title-link">
        <?= t("Installeur", "Installer")?>
      </a>
    </p>
    <li>
      <?= t(
        "Windows peut afficher un avertissement SmartScreen. Cliquez sur « Informations complémentaires » puis « Exécuter quand même ».",
        "Windows may show a SmartScreen warning. Click “More info” then “Run anyway”."
      ) ?>
      <div class="screenshot">
        <img src="img/SmartScreen1.png" alt="SmartScreen Admin" />
        <img src="img/SmartScreen2.png" alt="SmartScreen Admin" />
      </div>
    </li>
    <li>
      <?= t(
        "Autorisez l’application à apporter des modifications (UAC).",
        "Allow the application to make changes (UAC)."
      ) ?>
      <div class="screenshot">
        <img src="img/UAC.png" alt="UAC Prompt" />
      </div>
    </li>
    <li>
      <?= t(
        "L’installeur s’ouvre : cliquer sur Suivant et choisissez le dossier d’installation.",
        "The installer opens: click Next and choose the installation folder."
      ) ?>
      <div class="screenshot">
        <img src="img/Installer1.png" alt="Installer - Start" />
        <img src="img/Installer2.png" alt="Installer - Choose folder" />
      </div>
    </li>
    <li>
      <?= t(
        "Si une installation précédente est détectée, l’installeur vous propose de conserver vos sauvegardes.",
        "If a previous installation is detected, the installer asks if you want to keep your save files."
      ) ?>
      <div class="screenshot">
        <img src="img/Installer3.png" alt="Installer - Keep saves" />
      </div>
    </li>
    <li>
      <?= t(
        "Cliquez sur « Installer » pour lancer la copie des fichiers.",
        "Click “Install” to start copying files."
      ) ?>
      <div class="screenshot">
        <img src="img/Installer4.png" alt="Installer - Progress" />
      </div>
    </li>
    <li>
      <?= t(
        "Cliquez sur Terminé, un raccourci est créé sur le bureau et dans le menu Démarrer.",
        "Click on Finished, a shortcut is created on the desktop and in the Start Menu."
      ) ?>
      <div class="screenshot">
        <img src="img/Installer5.png" alt="Installer - Progress" />
      </div>
    </li>
  </ol>
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
