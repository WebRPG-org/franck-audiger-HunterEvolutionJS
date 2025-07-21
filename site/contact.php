<?php
include 'lang.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $timestamp = time();

    if ($email && $title && $message) {
        $data = [
            'timestamp' => $timestamp,
            'date' => date('Y-m-d H:i:s'),
            'email' => $email,
            'title' => $title,
            'message' => $message
        ];

        $folder = __DIR__ . '/contacts/';
        if (!file_exists($folder)) {
            mkdir($folder, 0755, true);
        }

        $sanitizedTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $title);
        $filename = $folder . $timestamp . '-' . $sanitizedTitle . '.json';
        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $success = true;
    } else {
        $error = t('Tous les champs sont requis.', 'All fields are required.');
    }
}
?>
<!DOCTYPE html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= t('Nous contacter','Contact us') ?></title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="icon.png" type="image/png">
</head>
<body>
  <div class="lang-switch">
    <a href="?lang=fr">🇫🇷</a>
    <a href="?lang=en">🇬🇧</a>
  </div>
<?php if (!empty($success)): ?>
  <div class="msg success">✅ <?= t('Message envoyé avec succès !','Message sent successfully!') ?></div>
<?php elseif (!empty($error)): ?>
  <div class="msg error">❌ <?= htmlspecialchars($error) ?></div>
<?php endif; ?>
<div class="container">
  <h2><?= t('Formulaire de contact','Contact form') ?></h2>
  <form method="post">
    <label><?= t('Adresse email :','Email address:') ?></label>
    <input type="email" name="email" required>

    <label><?= t('Sujet :','Subject:') ?></label>
    <input type="text" name="title" required>

    <label><?= t('Message :','Message:') ?></label>
    <textarea name="message" rows="6" required></textarea>

    <button type="submit" class="btn btn-green"><?= t('Envoyer','Send') ?></button>
  </form>
</div>
</body>
</html>
