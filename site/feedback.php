<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contact = trim($_POST['contact'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
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

        $sanitizedTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $title);
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
        $error = "Tous les champs sont requis.";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Feedback sur le jeu</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<?php if (!empty($success)): ?>
  <div class="msg success">✅ Feedback enregistré avec succès !</div>
<?php elseif (!empty($error)): ?>
  <div class="msg error">❌ <?= htmlspecialchars($error) ?></div>
<?php endif; ?>
<div class="container">
  <h2>Envoyer un feedback sur le jeu</h2>
  <form method="post" enctype="multipart/form-data">
    <label>Contact :</label>
    <input type="text" name="contact" required>

    <label>Titre :</label>
    <input type="text" name="title" required>

    <label>Message :</label>
    <textarea name="description" rows="6" required></textarea>

    <label>Pièces jointes (PNG ou JPEG) :</label>
    <input type="file" name="attachments[]" accept="image/png,image/jpeg" multiple>

    <button type="submit" class="btn btn-green">Envoyer le feedback</button>
  </form>
</div>
</body>
</html>
