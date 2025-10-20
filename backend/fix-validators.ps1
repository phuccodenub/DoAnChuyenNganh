# Fix all validation files
$validationFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.validate.ts"

foreach ($file in $validationFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix express-validator imports
    $content = $content -replace "import \{ ([^}]+) \} from 'express-validator';", "import { `$1 } from 'express-validator';"
    $content = $content -replace "import \{ ([^}]+) \} from ""express-validator"";", "import { `$1 } from 'express-validator';"
    
    # Add proper import for express-validator
    if ($content -match "from 'express-validator'") {
        $content = $content -replace "import \{ ([^}]+) \} from 'express-validator';", "import * as validator from 'express-validator';`nconst { `$1 } = validator;"
    }
    
    Set-Content $file.FullName -Value $content
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "All validation files have been fixed!"

