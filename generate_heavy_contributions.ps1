$days = 90
$currentDate = Get-Date
Write-Host "Generating heavy backdated commits (4-7 random, occasionally 10)..."

for ($i = $days; $i -ge 1; $i--) {
    $randomCommits = Get-Random -Minimum 4 -Maximum 8 # This generates 4, 5, 6, or 7
    $chance = Get-Random -Minimum 1 -Maximum 10
    if ($chance -eq 1) {
        $randomCommits = 10 # 10% chance to be 10 commits today
    }

    $baseDate = $currentDate.AddDays(-$i)
    
    for ($j = 1; $j -le $randomCommits; $j++) {
        # stagger the times slightly so they aren't all at the exact same second
        $commitDate = $baseDate.AddHours($j).ToString("yyyy-MM-ddTHH:mm:ss")
        $env:GIT_AUTHOR_DATE = $commitDate
        $env:GIT_COMMITTER_DATE = $commitDate
        
        Add-Content -Path "contributions.md" -Value "Heavy $j for $commitDate"
        git add contributions.md | Out-Null
        git commit -m "Heavy contribution $commitDate" | Out-Null
    }
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE
Write-Host "Finished generating commits. Pushing to GitHub..."
git push origin main
Write-Host "Done! Enjoy your dark green squares!"
