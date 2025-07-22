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

        $folder = __DIR__ . '/bug-reports/';
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
$title = t('Soumettre un rapport de bug','Submit a bug report');
$base = '';
include 'header.php';
?>
<?php if (!empty($success)): ?>
  <div class="msg success">✅ <?= t('Rapport sauvegardé avec succès !','Report saved successfully!') ?></div>
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

    <label><?= t('Description :','Description:') ?></label>
    <textarea name="description" rows="6" required></textarea>

    <label><?= t('Pièces jointes (PNG ou JPEG) :','Attachments (PNG or JPEG):') ?></label>
    <input type="file" name="attachments[]" accept="image/png,image/jpeg" multiple>

    <button type="submit" class="btn"><?= t('Envoyer le rapport','Submit report') ?></button>
  </form>
</div>
</body>
</html>
