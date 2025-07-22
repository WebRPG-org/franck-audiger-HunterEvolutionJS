<?php
include 'lang.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contact = htmlspecialchars(trim($_POST['contact'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $rawTitle = trim($_POST['title'] ?? '');
    $title = htmlspecialchars($rawTitle, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $description = htmlspecialchars(trim($_POST['description'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $timestamp = time();

    if ($contact && $title && $description) {
        $data = [
            'timestamp' => $timestamp,
            'date' => date('Y-m-d H:i:s'),
            'contact' => $contact,
            'title' => $title,
            'description' => $description
        ];

        $folder = __DIR__ . '/feedbacks/';
        if (!file_exists($folder)) {
            mkdir($folder, 0755, true);
        }

        $sanitizedTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $rawTitle);
        $filename = $folder . $timestamp . '-' . $sanitizedTitle . '.json';
        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Gérer les pièces jointes
        if (!empty($_FILES['attachments']['name'][0])) {
            foreach ($_FILES['attachments']['tmp_name'] as $index => $tmpName) {
                $name = $_FILES['attachments']['name'][$index];
                $type = mime_content_type($tmpName);

                if (in_array($type, ['image/jpeg', 'image/png'])) {
                    $ext = pathinfo($name, PATHINFO_EXTENSION);
                    $destName = $folder . $timestamp . '-attachment' . ($index + 1) . '.' . $ext;
                    move_uploaded_file($tmpName, $destName);
                }
            }
        }

        $success = true;
    } else {
        $error = t('Tous les champs sont requis.', 'All fields are required.');
    }
}
?>

<?php
$title = t('Envoyer un feedback sur le jeu','Send feedback about the game');
$base = '';
include 'header.php';
?>
<?php if (!empty($success)): ?>
  <div class="msg success">✅ <?= t('Feedback enregistré avec succès !','Feedback saved successfully!') ?></div>
<?php elseif (!empty($error)): ?>
  <div class="msg error">❌ <?= htmlspecialchars($error) ?></div>
<?php endif; ?>
<div class="container">
  <h2><?= $title ?></h2>
  <form method="post" enctype="multipart/form-data">
    <label><?= t('Contact :','Contact:') ?></label>
    <input type="text" name="contact" required>

    <label><?= t('Titre :','Title:') ?></label>
    <input type="text" name="title" required>

    <label><?= t('Message :','Message:') ?></label>
    <textarea name="description" rows="6" required></textarea>

    <label><?= t('Pièces jointes (PNG ou JPEG) :','Attachments (PNG or JPEG):') ?></label>
    <input type="file" name="attachments[]" accept="image/png,image/jpeg" multiple>

    <button type="submit" class="btn btn-green"><?= t('Envoyer le feedback','Send feedback') ?></button>
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
