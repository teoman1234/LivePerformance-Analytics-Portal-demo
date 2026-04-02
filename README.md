# 🎯 LivePerformance Analytics Portal

TikTok yayıncı verilerini analiz eden, performans metrikleri hesaplayan ve görselleştiren bir web uygulaması.

- **Backend:** Python (FastAPI) — `app/main.py`
- **Frontend:** React + Vite — `frontend/`
- **Veritabanı:** SQLite (yerel dosya `data.db`)

---

## ✅ Gereksinimler

| Araç | Minimum Sürüm |
|------|---------------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## 🚀 Kurulum ve Çalıştırma

### 1. Projeyi İndir

```bash
git clone https://github.com/teoman1234/LivePerformance-Analytics-Portal-demo.git
cd LivePerformance-Analytics-Portal-demo
```

---

### 2. Backend Kurulumu

Proje kök dizininde bir sanal ortam oluştur ve bağımlılıkları yükle:

```bash
# Sanal ortam oluştur
python -m venv .venv

# Sanal ortamı aktifleştir
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Windows (CMD):
.\.venv\Scripts\activate.bat
# macOS / Linux:
source .venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt
```

Backend'i başlat (port **8001**):

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

> ✅ Terminalde `Application startup complete.` mesajını görünce backend hazırdır.

---

### 3. Örnek Veri Yükleme (İlk kurulumda gerekli)

Backend çalışırken **yeni bir terminal** açıp aşağıdaki komutu çalıştır:

```bash
# Windows (PowerShell):
Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/upload" -Method Post -InFile "sample_data.csv" -ContentType "multipart/form-data"

# macOS / Linux:
curl -X POST -F "file=@sample_data.csv" http://127.0.0.1:8001/api/upload
```

> Alternatif: Frontend'deki **"Veriler"** sayfasından arayüz üzerinden de dosya yükleyebilirsiniz.

---

### 4. Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

> ✅ Terminalde `Local: http://localhost:5173` mesajını görünce frontend hazırdır.

---

### 5. Uygulamayı Aç

Tarayıcıda şu adresi aç: **http://localhost:5173**

---

## 🔐 Giriş Bilgileri

Varsayılan süpervizör hesabı:

| Alan | Değer |
|------|-------|
| E-posta | `admin@superstar.local` |
| Şifre | `admin` |

Özel kullanıcı adı/şifre tanımlamak için proje kök dizininde `.env` dosyası oluştur:

```
SUPERSTAR_ADMIN_EMAIL=benimemail@ornek.com
SUPERSTAR_ADMIN_PASSWORD=guclu_sifre
```

---

## 📁 Proje Yapısı

```
├── app/
│   └── main.py              # FastAPI backend (API endpoint'leri)
├── frontend/
│   ├── src/
│   │   ├── pages/           # React sayfaları (Supervisor, Influencers, vb.)
│   │   ├── components/      # Yeniden kullanılabilir bileşenler
│   │   ├── api.js           # API çağrı yardımcıları
│   │   └── config.js        # Sabit konfigürasyon değerleri
│   ├── package.json
│   └── vite.config.js
├── requirements.txt         # Python bağımlılıkları
├── sample_data.csv          # Test için örnek veri
├── generate_realistic_data.py  # Simüle edilmiş geçmiş veri üretici
└── data.db                  # SQLite veritabanı (otomatik oluşur, git'e eklenmez)
```

---

## ⚙️ Ortam Değişkenleri

### Backend (opsiyonel)

`.env` dosyası kök dizinde oluşturulabilir:

```env
SUPERSTAR_ADMIN_EMAIL=admin@superstar.local
SUPERSTAR_ADMIN_PASSWORD=admin
```

### Frontend (opsiyonel)

`frontend/.env` dosyası oluşturulabilir:

```env
VITE_API_BASE=http://127.0.0.1:8001
```

> Frontend varsayılan olarak `http://127.0.0.1:8001` adresini kullanır. Backend farklı bir port ya da sunucuda çalışıyorsa bu değişkeni ayarla.

---

## 🛠️ Sık Karşılaşılan Sorunlar

### ❌ `uvicorn` komutu bulunamıyor
Sanal ortamın aktifleştirildiğinden emin ol:
```bash
source .venv/bin/activate   # macOS/Linux
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
```

### ❌ Frontend `CORS` veya bağlantı hatası veriyor
- Backend'in çalışıp çalışmadığını kontrol et: `http://127.0.0.1:8001/docs`
- `VITE_API_BASE` ortam değişkeninin doğru ayarlandığından emin ol.

### ❌ PowerShell `Activate.ps1` çalıştırmaya izin vermiyor
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Uygulama açılıyor ama veri görünmüyor
- `sample_data.csv` dosyasını yüklemediğini kontrol et (Adım 3).
- Ya da `generate_realistic_data.py` scriptini çalıştırarak demo veri oluştur:
  ```bash
  python generate_realistic_data.py
  ```

### ❌ `npm install` hata veriyor
Node.js sürümünün 18+ olduğunu doğrula:
```bash
node --version
```
