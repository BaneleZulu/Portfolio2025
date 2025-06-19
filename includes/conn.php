<?php
require 'vendor/autoload.php';

use Dotenv\Dotenv;

// Load environment variables from .env file
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Database connection using environment variables
$servername = $_ENV['DB_HOST'];
$username = $_ENV['DB_USER'];
$password = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

function initializeDatabase()
{
    $host = $_ENV['DB_HOST'];
    $db = $_ENV['DB_NAME'];
    $user = $_ENV['DB_USER'];
    $pass = $_ENV['DB_PASS'];
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Ensure exceptions are thrown
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);

        // Log autocommit setting
        $autocommit = $pdo->query('SELECT @@autocommit')->fetchColumn();
        logResults("Autocommit is " . ($autocommit ? "enabled" : "disabled") . ".");

        // Log current database
        $currentDb = $pdo->query('SELECT DATABASE()')->fetchColumn();
        logResults("Connected to database: $currentDb");

        return $pdo;
    } catch (PDOException $e) {
        logResults("Database Connection Failed: " . $e->getMessage());
        respondWithJSON(false, "Database Connection Failed" . $e->getMessage());
        exit;
    }
}

function respondWithJSON($status, $message)
{
    echo json_encode(['success' => $status, 'message' => $message]);
    exit;
}

function logResults($message)
{
    $timestamp = set_precise_time();
    $logMessage = "$timestamp - $message\n";
    file_put_contents('../log.csv', $logMessage, FILE_APPEND);
}


function set_precise_time()
{
    date_default_timezone_set('Africa/Johannesburg');
    $hr = date('H');
    $mn = date('i');
    $sc = date('s');

    $date = strtotime('today');
    $today = date('Y-m-d', $date);
    $time = "{$hr}:{$mn}:{$sc}";

    $datetime = "{$today}, {$time}";
    return $datetime;
}



$pdo = initializeDatabase();
