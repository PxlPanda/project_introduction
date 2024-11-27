$downloadUrl = "https://github.com/microsoftarchive/redis/releases/download/win-3.0.504/Redis-x64-3.0.504.msi"
$outputPath = "Redis-x64-3.0.504.msi"

# Download Redis MSI
Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath

# Install Redis
Start-Process msiexec.exe -Wait -ArgumentList "/i $outputPath /quiet"

# Clean up
Remove-Item $outputPath
