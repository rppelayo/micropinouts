<?php
echo "ZIP extension available: " . (class_exists('ZipArchive') ? 'YES' : 'NO') . "\n";
echo "PHP version: " . PHP_VERSION . "\n";
phpinfo();
?>