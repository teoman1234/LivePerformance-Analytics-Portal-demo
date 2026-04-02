# 🌍 PROJECT MASTER PLAN: "Global Creator Economy SaaS"

## 1. Vizyon Değişimi (Rebranding)

Proje artık basit bir "Ajans Yönetim Paneli" değildir. Proje, TikTok verilerini işleyerek ham veriden "gelir stratejisi" üreten bir **Yapay Zeka Destekli Performans Motoru**dur.

*   **Eski Algı:** "Yayıncıların kaç saat yayın yaptığını gösteren tablo."
*   **Yeni Algı (Global):** "Yayıncıların gizli potansiyelini (Revenue Velocity) keşfeden ve onları optimize eden veri zekası."

## 2. Ar-Ge'nin "Markalaşmış" Yüzü (The Secret Sauce)

Teknokent için geliştirdiğimiz algoritmaları, akademik isimlerden kurtarıp "Satılabilir Özelliklere" (Trademark Features) dönüştürdük.

| Akademik İsim (Ar-Ge) | **Global Ürün İsmi (Marketing)** | **Kısaltma** | **Ne İşe Yarar? (Value Proposition)** |
| :--- | :--- | :--- | :--- |
| ABPS (Gelir/Zaman) | **Revenue Velocity** | **RV** | *"Saatte ne kadar hızlı para basıyor?"* (Verimlilik) |
| TIS (Beğeni/Takipçi) | **Hype Factor** | **HF** | *"Kitlesi ne kadar fanatik?"* (Etkileşim Kalitesi) |
| COS (Süreklilik) | **Stream Stamina** | **SS** | *"Yayıncılık kondisyonu ne kadar?"* (İstikrar) |
| Ağırlıklı Ortalama | **Creator OVR** | **OVR** | *"FIFA kartı gibi genel yetenek puanı (0-100)."* |

## 3. Modül 1: SUPERVISOR DASHBOARD (Kontrol Merkezi)

*Mevcut sayfanın İngilizceleştirilmiş ve cilalanmış hali.*

**Amaç:** Ajans sahibine "Büyük Resmi" göstermek ve sorunlu noktaları kırmızı alarm ile bildirmek.

**Yapılacak Revizyonlar:**

1.  **Dil Dönüşümü:** Tüm etiketler İngilizce olacak (Örn: "Toplam Ciro" -> **"Gross Revenue"**).
2.  **Heatmap Tabloları:** Listelerde sadece sayı yazmayacak; düşük performanslılar (RV < 50) kırmızı, yüksek performanslılar (RV > 90) neon mor arka planla vurgulanacak.
3.  **Mentör Rozetleri:** Tablolarda mentör isimleri yerine, her mentöre atanan renkli rozetler (Badges) kullanılacak.

## 4. Modül 2: INFLUENCER DASHBOARD (Motivasyon Merkezi)

*Sıfırdan inşa edeceğimiz, projenin "Vitrin" sayfası.*

**Amaç:** Yayıncıyı motive etmek, oyunlaştırılmış verilerle (Gamification) daha çok ve daha verimli yayın yapmasını sağlamak.

**Sayfa Mimarisi:**

1.  **Identity Card (FIFA Konsepti):**
    *   Sol üstte yayıncı fotoğrafı.
    *   Yanında devasa bir **OVR Puanı** (Örn: 88).
    *   Altında karakter sınıfı etiketi: **"THE SNIPER"** veya **"THE GRINDER"**.

2.  **Yetenek Üçgeni (Radar Chart):**
    *   RV, HF ve SS metriklerini üç köşeli bir radar grafikte göster. Yayıncının "şeklini" ortaya çıkar. (Dengeli mi? Agresif mi?)

3.  **Trend Grafiği (Dual Axis):**
    *   Tek bir grafikte **Gelir (Revenue)** ve **Yayın Saati (Airtime)** çakışması.
    *   *Mesaj:* "Bak, yayın saatini artırdığın gün gelirin de artmış mı?"

4.  **AI Coach (Akıllı Tavsiye Kutusu):**
    *   Ar-Ge algoritmamızın çıktısı burada konuşur:
    *   *"Your **Hype Factor** is amazing, but **Stamina** is low. Stream consistently for 3 days to unlock 'Rising Star' status!"*

## 5. Yapay Zeka Sınıflandırması (Archetypes)

Sunumlarda "Biz yayıncıları analiz edip etiketliyoruz" diyeceğimiz bölüm. Kod tarafında basit `if-else` mantığıyla çalışacak ama sunumu çok güçlüdür.

*   🎯 **THE SNIPER (Keskin Nişancı):** Az yayın yapar, çok kazanır. (High RV, Low SS).
*   🛡️ **THE GRINDER (Emektar):** Çok yayın yapar, sürümden kazanır. (Low RV, High SS).
*   ✨ **THE RISING STAR (Yükselen Yıldız):** Hype Factor çok yüksektir, patlamaya hazırdır.
*   🦄 **THE UNICORN (Efsane):** Her metriği (RV, HF, SS) zirvededir.

## 6. Teknik Yol Haritası (Execution Roadmap)

Bu "Master Plan"ı hayata geçirmek için sırasıyla şu adımları kodlayacağız:

### Adım 1: Veri Tabanı ve Backend (Simülasyon)
*   `generate_historical.py`: Rastgele veri yerine, yukarıdaki "Sniper" ve "Grinder" profillerine uygun **senaryolu geçmiş verisi** üretecek.
*   API Update: `/api/influencer/{username}` endpoint'i, sadece ham veriyi değil, hesaplanmış **OVR** ve **Archetype** bilgisini de döndürecek.

### Adım 2: Frontend "Globalleşme" (Supervisor)
*   Mevcut `Dashboard.jsx` dosyasındaki Türkçe metinleri İngilizce karşılıklarıyla değiştir.
*   Renk paletini **Dark/Neon** konseptine sabitle (Mor, Turkuaz, Altın Sarısı).

### Adım 3: Influencer Dashboard (Yeni İnşaat)
*   `Chart.js` kütüphanesinden **Radar Chart** bileşenini entegre et.
*   FIFA kartı tasarımını CSS ile oluştur.
*   Yayıncıya özel "Kişisel Gelişim" sayfasını kodla.
