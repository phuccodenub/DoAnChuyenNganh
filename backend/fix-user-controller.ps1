# Fix user controller service calls
$file = "src/controllers/user.controller.ts"

if (Test-Path $file) {
    $content = Get-Content $file -Raw
    
    # Replace function calls with service calls
    $content = $content -replace 'getUserByEmail\(', 'userService.getUserByEmail('
    $content = $content -replace 'addUser\(', 'userService.addUser('
    $content = $content -replace 'updateUserInfo\(', 'userService.updateUserInfo('
    $content = $content -replace 'removeUser\(', 'userService.removeUser('
    $content = $content -replace 'getAllUsers\(', 'userService.getAllUsers('
    $content = $content -replace 'getUsersByRole\(', 'userService.getUsersByRole('
    $content = $content -replace 'getUserStatistics\(', 'userService.getUserStatistics('
    $content = $content -replace 'changeUserStatus\(', 'userService.changeUserStatus('
    
    Set-Content $file -Value $content
    Write-Host "Fixed user controller service calls"
}

Write-Host "User controller fixes completed!"

