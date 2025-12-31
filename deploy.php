<?php
/**
 * Format Disc Website Deployment Script
 * This script handles the automatic deployment of the Format Disc website to cPanel
 */

// Set headers for JSON response
header('Content-Type: application/json');

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get JSON data from request
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input data
if (!isset($data['host']) || !isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

// Configuration
$ftpHost = $data['host'];
$ftpUser = $data['username'];
$ftpPass = $data['password'];
$remoteDir = '/public_html';

// Create temporary directory
$tempDir = sys_get_temp_dir() . '/formatdisc_' . uniqid();
mkdir($tempDir);

// Log progress
$log = [];
$log[] = 'Created temporary directory: ' . $tempDir;

try {
    // Download the deployment package
    $log[] = 'Downloading deployment package...';
    $deploymentPackageUrl = 'https://example.com/formatdisc_deployment.zip';
    $zipFile = $tempDir . '/formatdisc_deployment.zip';
    
    $ch = curl_init($deploymentPackageUrl);
    $fp = fopen($zipFile, 'w+');
    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 minutes timeout
    
    if (curl_exec($ch) === false) {
        throw new Exception('Failed to download deployment package: ' . curl_error($ch));
    }
    
    curl_close($ch);
    fclose($fp);
    
    $log[] = 'Successfully downloaded deployment package';
    
    // Extract the deployment package
    $log[] = 'Extracting deployment package...';
    $zip = new ZipArchive();
    
    if ($zip->open($zipFile) !== true) {
        throw new Exception('Failed to open deployment package');
    }
    
    $zip->extractTo($tempDir);
    $zip->close();
    
    $log[] = 'Successfully extracted deployment package';
    
    // Connect to FTP server
    $log[] = 'Connecting to FTP server...';
    $conn = ftp_connect($ftpHost);
    
    if (!$conn) {
        throw new Exception('Failed to connect to FTP server');
    }
    
    // Login to FTP server
    $login = ftp_login($conn, $ftpUser, $ftpPass);
    
    if (!$login) {
        throw new Exception('Failed to login to FTP server');
    }
    
    $log[] = 'Successfully connected to FTP server';
    
    // Enable passive mode
    ftp_pasv($conn, true);
    
    // Create backup of existing files (optional)
    $log[] = 'Creating backup of existing files...';
    
    // Check if backup directory exists, create if not
    if (!@ftp_chdir($conn, $remoteDir . '/backup')) {
        ftp_mkdir($conn, $remoteDir . '/backup');
    } else {
        ftp_chdir($conn, $remoteDir);
    }
    
    // Get list of files in public_html
    $files = ftp_nlist($conn, $remoteDir);
    
    // Move files to backup directory (except backup directory itself)
    foreach ($files as $file) {
        $filename = basename($file);
        if ($filename != 'backup' && $filename != '.' && $filename != '..') {
            ftp_rename($conn, $remoteDir . '/' . $filename, $remoteDir . '/backup/' . $filename);
        }
    }
    
    $log[] = 'Successfully created backup of existing files';
    
    // Upload formatdisc files
    $log[] = 'Uploading website files...';
    
    // Function to recursively upload directory
    function uploadDirectory($conn, $localDir, $remoteDir) {
        global $log;
        
        // Create remote directory if it doesn't exist
        if (!@ftp_chdir($conn, $remoteDir)) {
            ftp_mkdir($conn, $remoteDir);
        }
        
        // Open local directory
        $dir = opendir($localDir);
        
        // Loop through files
        while ($file = readdir($dir)) {
            if ($file != '.' && $file != '..') {
                $localFile = $localDir . '/' . $file;
                $remoteFile = $remoteDir . '/' . $file;
                
                if (is_dir($localFile)) {
                    // Recursively upload subdirectory
                    uploadDirectory($conn, $localFile, $remoteFile);
                } else {
                    // Upload file
                    if (ftp_put($conn, $remoteFile, $localFile, FTP_BINARY)) {
                        $log[] = 'Uploaded: ' . $remoteFile;
                    } else {
                        $log[] = 'Failed to upload: ' . $remoteFile;
                    }
                }
            }
        }
        
        closedir($dir);
    }
    
    // Upload formatdisc directory
    uploadDirectory($conn, $tempDir . '/formatdisc', $remoteDir);
    
    // Upload contact.php
    if (ftp_put($conn, $remoteDir . '/contact.php', $tempDir . '/contact.php', FTP_ASCII)) {
        $log[] = 'Uploaded: contact.php';
    } else {
        $log[] = 'Failed to upload: contact.php';
    }
    
    $log[] = 'Successfully uploaded website files';
    
    // Set file permissions
    $log[] = 'Setting file permissions...';
    
    // Set directory permissions to 755
    function setDirectoryPermissions($conn, $directory) {
        global $log;
        
        // Change to directory
        ftp_chdir($conn, $directory);
        
        // Set directory permission
        ftp_chmod($conn, 0755, $directory);
        
        // Get list of files and directories
        $files = ftp_nlist($conn, '.');
        
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                $path = $directory . '/' . $file;
                
                // Check if it's a directory
                ftp_chdir($conn, $directory);
                if (@ftp_chdir($conn, $file)) {
                    // It's a directory, set permissions recursively
                    ftp_chdir($conn, '..');
                    setDirectoryPermissions($conn, $path);
                } else {
                    // It's a file, set permission to 644
                    ftp_chmod($conn, 0644, $path);
                }
            }
        }
    }
    
    // Set permissions for all directories and files
    setDirectoryPermissions($conn, $remoteDir);
    
    // Set specific permission for contact.php
    ftp_chmod($conn, 0644, $remoteDir . '/contact.php');
    
    $log[] = 'Successfully set file permissions';
    
    // Close FTP connection
    ftp_close($conn);
    
    // Clean up temporary files
    $log[] = 'Cleaning up temporary files...';
    
    // Function to recursively delete directory
    function deleteDirectory($dir) {
        if (!is_dir($dir)) {
            return;
        }
        
        $files = array_diff(scandir($dir), ['.', '..']);
        
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            
            if (is_dir($path)) {
                deleteDirectory($path);
            } else {
                unlink($path);
            }
        }
        
        rmdir($dir);
    }
    
    deleteDirectory($tempDir);
    
    $log[] = 'Successfully cleaned up temporary files';
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Website successfully deployed',
        'log' => $log
    ]);
    
} catch (Exception $e) {
    // Clean up temporary files
    if (file_exists($tempDir)) {
        deleteDirectory($tempDir);
    }
    
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'log' => $log
    ]);
}
?>