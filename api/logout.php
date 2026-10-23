<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

unset($_SESSION['admin_user']);
session_destroy();

jsonResponse([
    'success' => true,
    'message' => 'Signed out successfully.',
]);
