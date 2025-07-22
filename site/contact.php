<?php
include 'lang.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = htmlspecialchars(trim($_POST['email'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $rawTitle = trim($_POST['title'] ?? '');
    $title = htmlspecialchars($rawTitle, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $message = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
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

        $sanitizedTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $rawTitle);
        $filename = $folder . $timestamp . '-' . $sanitizedTitle . '.json';
        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $success = true;
    } else {
        $error = t('Tous les champs sont requis.', 'All fields are required.');
    }
}
?>
<?php
$title = t('Formulaire de contact','Contact form');
$base = '';
include 'header.php';
?>
<?php if (!empty($success)): ?>
  <div class="msg success">✅ <?= t('Message envoyé avec succès !','Message sent successfully!') ?></div>
<?php elseif (!empty($error)): ?>
  <div class="msg error">❌ <?= htmlspecialchars($error) ?></div>
<?php endif; ?>
<div class="container">
  <h2><?= $title ?></h2>
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
