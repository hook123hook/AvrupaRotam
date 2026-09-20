# Git Setup Script for AvrupaRotam Project
# Run this as Administrator in PowerShell

Write-Host "=== AvrupaRotam Git Setup Başlıyor ===" -ForegroundColor Cyan

# 1. Git'in yolunu ekle
$gitPath = "C:\Program Files\Git\cmd"
if (-not [System.Environment]::GetEnvironmentVariable("PATH", "Machine").Contains($gitPath)) {
    [System.Environment]::SetEnvironmentVariable("PATH", [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + $gitPath, "Machine")
    Write-Host "Git yolu eklendi" -ForegroundColor Green
}

# 2. Repositoryyi başlat
Write-Host "1. Repository başlatılıyor..." -ForegroundColor Yellow
Set-Location "D:\Opencode Projects\AvrupaRotam"
& git init

# 3. Dosyaları ekle
Write-Host "2. Dosyalar ekleniyor..." -ForegroundColor Yellow
& git add .

# 4. Commit yap
Write-Host "3. Commit yapılıyor..." -ForegroundColor Yellow
& git commit -m "AvrupaRotam - Tam proje kaydı $(Get-Date -Format 'yyyy-MM-dd')"

# 5. GitHub'a bağlan
Write-Host "3. GitHub remote ekleniyor..." -ForegroundColor Yellow
& git remote add origin https://github.com/hook123hook/AvrupaRotam.git

# 6. Branch ayarla
Write-Host "4. Branch ayarlanıyor..." -ForegroundColor Yellow
& git branch -M main

# 7. Push yap
Write-Host "5. GitHub'a push yapılıyor..." -ForegroundColor Yellow
& git push -u origin main

Write-Host "=== Git Hub'a başarılı bir şekilde push edildi ===" -ForegroundColor Green
Write-Host "GitHub sayfası: https://github.com/hook123hook/AvrupaRotam" -ForegroundColor Cyan
Write-Host "Artık Supabase ve Vercel ayarlarını yapabilirsiniz." -ForegroundColor Cyan