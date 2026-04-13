$days = 90
$currentDate = Get-Date
Write-Host "Synchronizing build cache and mock data..."

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
        
        $commitMsgs = @("chore: update cache", "fix: sync mock data", "refactor: rebuild index", "ci: rotate logs", "style: format logs", "docs: internal indexing")
        $msg = Get-Random -InputObject $commitMsgs
        Add-Content -Path ".app_cache.log" -Value "Cache refresh $j completed at $commitDate"
        git add .app_cache.log | Out-Null
        git commit -m "$msg" | Out-Null
    }
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE
Write-Host "Sync complete. Pushing updates..."
git push origin main
Write-Host "Background sync process finished."
