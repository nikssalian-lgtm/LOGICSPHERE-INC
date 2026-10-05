<?php

// Shut down only the project-local database using its generated local credentials.
$root = dirname(__DIR__);
$credentials = json_decode(file_get_contents($root.'/.local/database.json'), true, flags: JSON_THROW_ON_ERROR);
$pdo = new PDO('mysql:host=127.0.0.1;port=3307', 'root', $credentials['root'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$pdo->exec('SHUTDOWN');
echo "Project-local MySQL shut down cleanly.\n";
