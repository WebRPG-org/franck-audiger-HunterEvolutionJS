<?php
// index.php placé dans /desktop-assets/<tag>/
// Sert (download) les ZIP (et Game.exe) et/ou liste en JSON ce qui est disponible.
// Sécurisé : pas de traversal, limite au dossier courant et sous-dossiers.

declare(strict_types=1);

// ---------- Config ----------
$BASE_DIR = realpath(__DIR__);       // dossier du tag courant
$ALLOWED_EXT = ['zip', 'exe'];       // on sert .zip et Game.exe
$ALLOW_RECURSIVE_LIST = true;        // true = lister aussi les sous-dossiers

// ---------- Helpers ----------
function safe_path(string $base, string $rel): ?string {
    $rel = ltrim($rel, "/\\");                  // pas de chemin absolu
    $path = realpath($base . DIRECTORY_SEPARATOR . $rel);
    if ($path === false) return null;
    // doit rester sous $base
    if (strpos($path, $base) !== 0) return null;
    return $path;
}

function ext_of(string $filename): string {
    $p = strrpos($filename, '.');
    return $p === false ? '' : strtolower(substr($filename, $p + 1));
}

function list_files(string $base, array $allowedExt, bool $recursive = true): array {
    $files = [];
    $iter = $recursive
        ? new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS))
        : new IteratorIterator(new DirectoryIterator($base));

    foreach ($iter as $fileinfo) {
        /** @var SplFileInfo $fileinfo */
        if (!$fileinfo->isFile()) continue;
        $ext = ext_of($fileinfo->getFilename());
        if (!in_array($ext, $allowedExt, true)) continue;

        $full = $fileinfo->getPathname();
        $rel  = ltrim(substr($full, strlen($base)), DIRECTORY_SEPARATOR);
        $files[] = [
            'name' => $fileinfo->getFilename(),
            'path' => str_replace(DIRECTORY_SEPARATOR, '/', $rel),
            'size' => $fileinfo->getSize(),
            'mtime'=> $fileinfo->getMTime(),
            'ext'  => $ext,
            'url'  => basename($_SERVER['PHP_SELF']).'?f='.rawurlencode($rel),
            'sha256_url' => basename($_SERVER['PHP_SELF']).'?sha256='.rawurlencode($rel),
        ];
    }
    // tri par nom
    usort($files, fn($a,$b)=> strcmp($a['path'],$b['path']));
    return $files;
}

function send_json($data, int $status=200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    // CORS simple (utile pour outils CI/NSIS si besoin)
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
    exit;
}

function send_file(string $base, string $rel): void {
    global $ALLOWED_EXT;
    $full = safe_path($base, $rel);
    if ($full === null || !is_file($full)) {
        http_response_code(404);
        echo "Not found";
        exit;
    }
    $ext = ext_of($full);
    if (!in_array($ext, $ALLOWED_EXT, true)) {
        http_response_code(403);
        echo "Forbidden";
        exit;
    }

    $filename = basename($full);
    $size = filesize($full);

    // Type MIME simple
    $mime = $ext === 'zip' ? 'application/zip' : 'application/octet-stream';

    header('Content-Type: '.$mime);
    header('Content-Length: '.$size);
    header('Content-Disposition: attachment; filename="'.$filename.'"');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: public, max-age=31536000, immutable');
    // Optionnel : prise en charge de Range (non indispensable)
    readfile($full);
    exit;
}

// ---------- Routes ----------
// 1) ?f=relative/path.ext  => sert le fichier
if (isset($_GET['f'])) {
    send_file($BASE_DIR, (string)$_GET['f']);
}

// 2) ?sha256=relative/path.ext => retourne le SHA-256 en JSON
if (isset($_GET['sha256'])) {
    $rel = (string)$_GET['sha256'];
    $full = safe_path($BASE_DIR, $rel);
    if ($full === null || !is_file($full)) {
        send_json(['error'=>'Not found'], 404);
    }
    $ext = ext_of($full);
    if (!in_array($ext, $ALLOWED_EXT, true)) {
        send_json(['error'=>'Forbidden'], 403);
    }
    $hash = hash_file('sha256', $full);
    send_json(['path'=>$rel, 'sha256'=>$hash]);
}

// 3) Sans paramètre => liste JSON de tous les .zip (+ exe) disponibles
$files = list_files($BASE_DIR, $ALLOWED_EXT, $ALLOW_RECURSIVE_LIST);
send_json([
    'tag' => basename($BASE_DIR),
    'base_url' => (isset($_SERVER['HTTPS'])?'https':'http').'://'.$_SERVER['HTTP_HOST'].rtrim(dirname($_SERVER['REQUEST_URI']),'/').'/',
    'count' => count($files),
    'files' => $files,
]);