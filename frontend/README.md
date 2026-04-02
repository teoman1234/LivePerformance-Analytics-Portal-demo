# ABPS Demo Frontend

React + Vite tabanlı basit 3 sayfa:

1. Supervisor Dashboard (`/`) – Mentör ortalama ABPS bar chart + en iyi / en kötü listeler.
2. Influencer List (`/influencers`) – Sıralanabilir/tab filtrelenebilir tablo + detay linkleri.
3. Influencer Detail (`/influencer/:username`) – Tek yayıncı için metrikler ve ABPS.

## Çalıştırma Sırası

```powershell
# Backend (ayrı bir terminal)
Set-Location c:\Users\ASUS\abps-demo\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Veri yükleme (ayrı veya aynı terminal)
curl -X POST -F "file=@sample_data.csv" http://127.0.0.1:8000/api/upload

# Frontend kurulumu
Set-Location c:\Users\ASUS\abps-demo\backend\frontend
npm install
npm run dev
```

Ardından tarayıcıdan: http://127.0.0.1:5173

## Notlar
- CORS açık (backend tüm originlere izin veriyor).
- Production gerekmediğinden güvenlik ve caching en aza indirildi.
- Gerekirse `.vscode/launch.json` ile backend debug edilebilir (hot reload yerine VSCode debugger kullanımı).
