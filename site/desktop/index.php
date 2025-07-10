<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Liste des fichiers</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { margin: 5px 0; }
    a { color: #007BFF; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Fichiers disponibles</h1>
  <ul>
    <?php
      $files = scandir(__DIR__);
      foreach ($files as $file) {
        if (is_file($file) && $file !== basename(__FILE__)) {
          echo "<li><a href=\"$file\" download>$file</a></li>";
        }
      }
    ?>
  </ul>
</body>
</html>