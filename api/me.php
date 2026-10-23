<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if (isset($_SESSION['admin_user'])) {
    jsonResponse([
        'authenticated' => true,
        'user' => $_SESSION['admin_user'],
    ]);
} else {
    jsonResponse([
        'authenticated' => false,
        'user' => null,
    ]);
}
