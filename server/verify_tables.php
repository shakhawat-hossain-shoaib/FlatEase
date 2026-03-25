<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$db = $app->make('db');

echo "\n=== COMPLAINTS TABLE ===\n";
$columns = $db->select('SHOW COLUMNS FROM complaints');
foreach($columns as $col) {
    echo "{$col->Field} ({$col->Type})\n";
}

echo "\n=== COMPLAINT_STATUS_HISTORIES TABLE ===\n";
$cols2 = $db->select('SHOW COLUMNS FROM complaint_status_histories');
foreach($cols2 as $col) {
    echo "{$col->Field} ({$col->Type})\n";
}

echo "\n=== COMPLAINT_COMMENTS TABLE ===\n";
$cols3 = $db->select('SHOW COLUMNS FROM complaint_comments');
foreach($cols3 as $col) {
    echo "{$col->Field} ({$col->Type})\n";
}
