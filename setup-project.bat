@echo off
title AvrupaRotam Project Tam Kurulum
cd D:\Opencode Projects\AvrupaRotam

:START
cls
echo ==========================================
echo  EUROPA ROTAM - TAM PROJE KURULUM
echo ==========================================
echo.

:: 1. GİT KURULUMU
echo 1. Git kontrol ediliyor...
if not exist .git (
    echo Git kuruluyor... Lütfen bekleyin.
    powershell -Command "Start-Process 'https://git-scm.com/download/win' -Verb RunAs"
    echo.
    echo Git indirme sayfası açıldı. Kurum bittikten sonra bu pencereden Enter'a basın.
    pause >nul
    goto START
) else (
    echo Git zaten kurulu veya repo zaten var.
)

:: 2. REPOYU BAŞLAT
echo.
echo 2. Repoyu başlatılıyor...
git init
git add .
git commit -m "AvrupaRotam - Tam proje kaydı %DATE% %TIME%"

:: 3. GITHUB'A PUSH
echo.
echo 3. GitHub'a push yapılıyor...
echo Lütfen GitHub sayfasında repo oluşturun:
echo "   https://github.com/hook123hook/AvrupaRotam"
echo.
echo "Repository oluşturulduktan sonra Enter'a basın..."
pause >nul
git remote add origin https://github.com/hook123hook/AvrupaRotam.git 2>nul
git branch -M main 2>nul
git push -u origin main 2>nul

:: 4. SUPABASE AYARLARI
echo.
echo 4. Supabase yapılandırması...
echo Supabase URL ve anahtarları .env dosyasına eklenecek.
echo.
echo "Aşağıları supabase.com dashboard'ından alın:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" 
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo.
copy NUL > .env
set /p SUPABASE_URL="Supabase URL'si: "
set /p SUPABASE_ANON="Anon Key: "
set /p SUPABASE_SERVICE="Service Role Key: "
echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL% >> .env
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_ANON% >> .env
echo SUPABASE_SERVICE_ROLE_KEY=%SUPABASE_SERVICE% >> .env
echo .env dosyası oluşturuldu.

:: 5. VERCEL HAZIRLAMASI
echo.
echo 5. Vercel ayarları...
echo Vercel'e repo bağlanıyor...
echo "Komut: vercel --dry-run (preview oluşturmak için, publish yapmayın)"
echo.

echo.
echo ==========================================
echo  KURULUM TAMAM!
echo ==========================================
echo.
echo "Proje yolları kontrol ediliyor..."
dir /b /s .openai\hosting.json .env 2>nul
echo.
echo "GitHub: https://github.com/hook123hook/AvrupaRotam"
echo "Supabase: https://supabase.com/dashboard/project/mwtcphhqxcigavqtcgqd"
echo.
pause