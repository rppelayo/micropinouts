<?php
echo "<h1>URL Debug Information</h1>\n";

echo "<h2>Server Variables</h2>\n";
echo "<strong>REQUEST_URI:</strong> " . ($_SERVER['REQUEST_URI'] ?? 'Not set') . "<br>\n";
echo "<strong>REQUEST_METHOD:</strong> " . ($_SERVER['REQUEST_METHOD'] ?? 'Not set') . "<br>\n";
echo "<strong>SCRIPT_NAME:</strong> " . ($_SERVER['SCRIPT_NAME'] ?? 'Not set') . "<br>\n";
echo "<strong>PATH_INFO:</strong> " . ($_SERVER['PATH_INFO'] ?? 'Not set') . "<br>\n";
echo "<strong>QUERY_STRING:</strong> " . ($_SERVER['QUERY_STRING'] ?? 'Not set') . "<br>\n";

echo "<h2>Path Analysis</h2>\n";
$path = $_SERVER['REQUEST_URI'] ?? '';
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));

echo "<strong>Full path:</strong> " . $path . "<br>\n";
echo "<strong>Path parts:</strong> " . print_r($pathParts, true) . "<br>\n";

// Remove 'micropinouts' and 'api-php' from path if present
$filteredParts = array_filter($pathParts, function($part) {
    return $part !== 'micropinouts' && $part !== 'api-php';
});
$filteredParts = array_values($filteredParts);

echo "<strong>Filtered path parts:</strong> " . print_r($filteredParts, true) . "<br>\n";

echo "<h2>Test URLs</h2>\n";
$baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);

echo "<a href='" . $baseUrl . "/'>Root endpoint</a><br>\n";
echo "<a href='" . $baseUrl . "/boards'>Boards endpoint</a><br>\n";
echo "<a href='" . $baseUrl . "/pin-groups'>Pin groups endpoint</a><br>\n";
echo "<a href='" . $baseUrl . "/admin/login'>Admin login endpoint</a><br>\n";

echo "<h2>Direct File Access</h2>\n";
echo "<a href='index.php'>index.php</a><br>\n";
echo "<a href='boards.php'>boards.php</a><br>\n";
echo "<a href='pin-groups.php'>pin-groups.php</a><br>\n";
echo "<a href='admin.php'>admin.php</a><br>\n";
?>