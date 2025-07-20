<?php
$lang = $_GET['lang'] ?? 'fr';
$lang = strtolower($lang);
if (!in_array($lang, ['fr','en'])) {
    $lang = 'fr';
}
function t($fr, $en) {
    global $lang;
    return $lang === 'en' ? $en : $fr;
}
?>
