# 🎯 LivePerformance Analytics Portal

TikTok yayıncılarının performansını takip eden bir web uygulaması.

---

## 📦 Önce Bunları Yükle

Uygulamayı çalıştırabilmek için bilgisayarında iki program olması gerekiyor:

1. **Python** → https://www.python.org/downloads/ *(en üstteki sarı butona tıkla, indir ve kur)*
   - Kurulum sırasında **"Add Python to PATH"** kutucuğunu işaretlemeyi unutma!
2. **Node.js** → https://nodejs.org *(LTS yazan versiyonu indir)*

Her ikisini de kurduktan sonra aşağıdaki adımlara geç.

---

## ▶️ Uygulamayı Çalıştırma

> 💡 **Terminal nedir?** Windows'ta **Başlat → "cmd"** yaz → Enter. Mac'te **Spotlight → "Terminal"** yaz → Enter.

Aşağıdaki adımları **sırasıyla** uygula.

---

### Adım 1 — Proje klasörünü terminalde aç

Projeyi bilgisayarına indirdikten sonra terminalde o klasöre gir. Örneğin masaüstüne indirdiysen:

```
cd Masaustu\LivePerformance-Analytics-Portal-demo
```

---

### Adım 2 — Arka plan servisi kur ve başlat

Bu uygulamayı ilk kez çalıştırıyorsan aşağıdaki 3 satırı **sırasıyla** yapıştır ve Enter'a bas:

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> Mac/Linux kullanıyorsan 2. satır yerine şunu yaz: `source .venv/bin/activate`

Kurulum bittikten sonra servisi başlat:

```
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Terminalde `Application startup complete.` yazısını görünce bu pencereyi **kapatma**, arka planda çalışsın.

---

### Adım 3 — Arayüzü kur ve başlat

**Yeni bir terminal penceresi aç** (birinci terminal açık kalsın), projenin klasörüne tekrar gir ve şunu çalıştır:

```
cd frontend
npm install
npm run dev
```

Terminalde `Local: http://localhost:5173` yazısını görünce hazırsın.

---

### Adım 4 — Tarayıcıda aç

Herhangi bir tarayıcıda (Chrome, Firefox vb.) şu adresi aç:

**http://localhost:5173**

---

## 🔑 Giriş Bilgileri

| | |
|---|---|
| **E-posta** | `admin@superstar.local` |
| **Şifre** | `admin` |

---

## 📊 İlk Veriyi Yükle

Giriş yaptıktan sonra uygulama boş görünebilir. Sol menüden **"Veriler"** sayfasına git ve `sample_data.csv` dosyasını yükle — bu dosya proje klasörünün içinde hazır geliyor.

---

## ❓ Sorun mu var?

**"Uygulama açılıyor ama veri yok"**
→ Adım 2'deki servisi başlattığından emin ol ve "Veriler" sayfasından dosyayı yükle.

**"pip/python/npm tanımıyor" hatası**
→ Python ve Node.js kurulumunu yaptın mı? Python kurulumunda "Add Python to PATH" seçeneğini işaretledin mi?

**Windows'ta `.venv\Scripts\activate` hata veriyor**
→ Aşağıdaki komutu bir kez çalıştır, ardından tekrar dene:
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
