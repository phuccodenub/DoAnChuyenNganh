# Fix error handling in all TypeScript files
$tsFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.ts"

foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix 'error' is of type 'unknown' issues
    $content = $content -replace '\berror\b(?=\s*\.\s*message)', '(error as Error)'
    $content = $content -replace '\berror\b(?=\s*\.\s*stack)', '(error as Error)'
    $content = $content -replace '\berror\b(?=\s*\.\s*name)', '(error as Error)'
    $content = $content -replace '\berror\b(?=\s*\.\s*code)', '(error as any)'
    $content = $content -replace '\berror\b(?=\s*\.\s*status)', '(error as any)'
    
    # Fix catch blocks with unknown error
    $content = $content -replace 'catch \(error\) \{', 'catch (error: unknown) {'
    $content = $content -replace 'catch\(error\)\{', 'catch(error: unknown){'
    
    Set-Content $file.FullName -Value $content
    Write-Host "Fixed error handling in: $($file.Name)"
}

Write-Host "All error handling issues have been fixed!"

