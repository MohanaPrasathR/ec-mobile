$days = 90
$currentDate = Get-Date
Write-Host "Starting to generate backdated commits for the last $days days..."

for ($i = $days; $i -ge 1; $i--) {
    $commitDate = $currentDate.AddDays(-$i).ToString("yyyy-MM-ddTHH:mm:ss")
    
    # Set the environment variables for Git dates
    $env:GIT_AUTHOR_DATE = $commitDate
    $env:GIT_COMMITTER_DATE = $commitDate
    
    # Add a line to the contributions file
    Add-Content -Path "contributions.md" -Value "Backdated contribution for $commitDate"
    
    # Git commands
    git add contributions.md
    git commit -m "Add contribution for $commitDate"
}

# Clean up environment variables
Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

Write-Host "Finished generating commits. Pushing to GitHub..."
git push origin master
Write-Host "Done! Enjoy your green squares!"
