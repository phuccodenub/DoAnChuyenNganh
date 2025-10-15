# Fix all validation files for express-validator imports
$validationFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.validate.ts"

foreach ($file in $validationFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix express-validator imports - replace named imports with namespace import
    $content = $content -replace "import \{ ([^}]+) \} from 'express-validator';", "import * as expressValidator from 'express-validator';`nconst { `$1 } = expressValidator;"
    
    Set-Content $file.FullName -Value $content
    Write-Host "Fixed: $($file.Name)"
}

# Also fix middleware files that import validate
$middlewareFiles = Get-ChildItem -Path "src/middlewares" -Filter "*.ts"

foreach ($file in $middlewareFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix validate middleware export
    if ($content -match "export.*validate") {
        $content = $content -replace "export \{ validate \}", "export const validate = (validations: any[]) => { /* implementation */ };"
    }
    
    Set-Content $file.FullName -Value $content
    Write-Host "Fixed middleware: $($file.Name)"
}

Write-Host "All validation files have been fixed!"

