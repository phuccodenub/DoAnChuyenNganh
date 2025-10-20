# Fix all model files
$modelFiles = Get-ChildItem -Path "src/models" -Filter "*.model.ts"

foreach ($file in $modelFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove generic typing from sequelize.define
    $content = $content -replace 'sequelize\.define<[^>]*>\(', 'sequelize.define('
    
    # Simplify export statements
    $content = $content -replace 'export default .* as typeof Model & \{[^}]*\};', 'export default $1 as any;'
    
    Set-Content $file.FullName -Value $content
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "All model files have been fixed!"

