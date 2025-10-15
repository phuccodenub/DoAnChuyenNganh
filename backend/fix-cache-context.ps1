# Fix cache middleware context issues
$file = "src/cache/cache.middleware.ts"

if (Test-Path $file) {
    $content = Get-Content $file -Raw
    
    # Fix remaining this.cacheManager references in arrow functions
    $content = $content -replace 'this\.cacheManager\.set\(', 'cacheManager.set('
    $content = $content -replace 'this\.cacheManager\.get\(', 'cacheManager.get('
    
    # Add cacheManager variable capture in other methods
    $content = $content -replace '(\s+)const originalJson = res\.json;', '$1const originalJson = res.json;$1const cacheManager = this.cacheManager;'
    
    Set-Content $file -Value $content
    Write-Host "Fixed cache middleware context issues"
}

Write-Host "Cache context fixes completed!"

