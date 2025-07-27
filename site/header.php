<?php if (!isset($base)) $base = ''; ?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang ?? 'fr') ?>">
<head>
  <meta charset="UTF-8">
  <title><?= htmlspecialchars($title ?? '') ?></title>
  <link rel="stylesheet" href="<?= $base ?>style.css">
  <link rel="icon" href="<?= $base ?>icon.png" type="image/png">
</head>
<body>
  <div class="lang-switch">
    <a href="?lang=fr">
        <img src="<?= $base ?>fr.png" alt="Français"
            class="<?= ($_GET['lang'] ?? 'fr') === 'fr' ? 'selected' : '' ?>">
    </a>
    <a href="?lang=en">
        <img src="<?= $base ?>en.png" alt="English"
            class="<?= ($_GET['lang'] ?? 'fr') === 'en' ? 'selected' : '' ?>">
    </a>
    </div>
    <h1 id="main-title">
      <?php 
        if($_GET['lang']){
          $linkUrl = '?lang=' . htmlspecialchars($_GET['lang']);
        } else {
          $linkUrl = '';
        }
      ?>
      <a href="/<?= $linkUrl ?>" class="title-link">
        Hunter x Hunter Evolution
      </a>
    </h1>
