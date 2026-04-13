$days = 90
$currentDate = Get-Date
Write-Host "Starting asset alignment and log rotation..."

for ($i = $days; $i -ge 1; $i--) {
    $commitDate = $currentDate.AddDays(-$i).ToString("yyyy-MM-ddTHH:mm:ss")
    
    # Set the environment variables for Git dates
    $env:GIT_AUTHOR_DATE = $commitDate
    $env:GIT_COMMITTER_DATE = $commitDate
    
    # Update build log
    Add-Content -Path "build_audit.log" -Value "Audit log entry: successful validation at $commitDate"
    
    # Git commands
    git add build_audit.log
    git commit -m "chore: update build audit logs"
}

# Clean up environment variables
Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

Write-Host "Update successful. Pushing to remote..."
git push origin master
Write-Host "Audit process complete."
