"""
Son 30 günlük tahmini verileri oluşturur.
Mevcut gerçek verilerden (nov29, nov30) interpolasyon yaparak
eksik günleri doldurur.
Ayrıca "Master Plan" çerçevesinde yayıncılara (Archetypes) uygun
senaryolu veri üretir.
"""
import sqlite3
import random
from datetime import datetime, timedelta
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.db"

def get_archetype(username):
    """Kullanıcı adına göre deterministik bir archetype belirle"""
    # Basit bir hash ile her kullanıcıya sabit bir rol atayalım
    hash_val = sum(ord(c) for c in username)
    mod = hash_val % 100
    
    if mod < 15: return "SNIPER"       # %15
    if mod < 40: return "GRINDER"      # %25
    if mod < 55: return "RISING_STAR"  # %15
    if mod < 60: return "UNICORN"      # %5
    return "STANDARD"                  # %40

def generate_historical_data():
    """Son 30 günlük tahmini verileri oluştur"""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # En son tarih ve verilerini al
    cur.execute("SELECT MAX(date) FROM metrics_history")
    latest_date_str = cur.fetchone()[0]
    
    if not latest_date_str:
        print("Hata: Mevcut veri bulunamadı!")
        return
    
    latest_date = datetime.strptime(latest_date_str, "%Y-%m-%d")
    print(f"En son veri tarihi: {latest_date_str}")
    
    # En son güne ait verileri al
    cur.execute("""
        SELECT username, mentor, grup, tokens, hours, abps, followers, likes, 
               live_days, tis, cos, joined_at, last_live
        FROM metrics_history WHERE date = ?
    """, (latest_date_str,))
    latest_data = cur.fetchall()
    
    print(f"Mevcut kullanıcı sayısı: {len(latest_data)}")
    
    # Mevcut tüm tarihleri al
    cur.execute("SELECT DISTINCT date FROM metrics_history ORDER BY date")
    existing_dates = set(r[0] for r in cur.fetchall())
    
    # Son 30 gün için tarihler oluştur
    dates_to_generate = []
    for i in range(1, 31):
        date = latest_date - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        if date_str not in existing_dates:
            dates_to_generate.append(date_str)
    
    print(f"Oluşturulacak tarihler: {len(dates_to_generate)}")
    
    if not dates_to_generate:
        print("Tüm tarihler zaten mevcut!")
        con.close()
        return
    
    # Her eksik gün için veri oluştur
    total_inserted = 0
    
    for date_str in dates_to_generate:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        days_ago = (latest_date - date).days
        
        # Genel organik küçülme (geçmişe gidiyoruz)
        base_decay = 1 - (days_ago * 0.005)
        
        for row in latest_data:
            username, mentor, grup, tokens, hours, abps, followers, likes, live_days, tis, cos, joined_at, last_live = row
            
            archetype = get_archetype(username)
            
            # Archetype'a göre davranış parametreleri
            skip_prob = 0.05      # Yayın yapmama ihtimali
            token_var = 0.03      # Token dalgalanması
            hour_var = 0.05       # Saat dalgalanması
            
            if archetype == "SNIPER":
                # Az yayın, yüksek verim. Geçmişte sık sık yayın yapmamış olmalı.
                skip_prob = 0.40
                token_var = 0.15  # Gelir dalgalı olabilir
            
            elif archetype == "GRINDER":
                # İstikrarlı yayıncı.
                skip_prob = 0.01
                hour_var = 0.01   # Saatler çok oynamaz
                
            elif archetype == "RISING_STAR":
                # Hızlı yükselen. Geçmişte veriler çok daha düşük olmalı (hızlı decay).
                base_decay = 1 - (days_ago * 0.02) # Daha hızlı düşüş (geçmişte daha azdı)
                
            elif archetype == "UNICORN":
                # Hep iyi.
                skip_prob = 0.0
                base_decay = 1 - (days_ago * 0.001) # Çok az değişim, hep zirve
            
            # Rastgele varyasyon
            noise = 1 + random.uniform(-token_var, token_var)
            day_factor = base_decay * noise
            
            # Yayın yapmama durumu (Skip)
            if random.random() < skip_prob:
                # O gün yayın yoksa token ve saat 0'a yakın veya 0
                # Ancak kümülatif veriler (followers) kalmalı, günlükler (tokens, hours) 0 olmalı.
                # Veritabanı yapımız günlük snapshot mı yoksa kümülatif mi?
                # metrics_history genellikle o güne ait snapshot değerleri tutar.
                # Eğer "tokens" o gün kazanılan ise 0 olmalı.
                # Eğer "tokens" son 30 günlük toplam ise, o günkü katkı kadar azalmalı.
                # Mevcut yapı: "tokens" sütunu genellikle "Son 30 gündeki elmaslar" olarak tanımlanmış (main.py).
                # Bu yüzden 0 yapamayız, sadece o günkü katkıyı çıkararak azaltmalıyız.
                # Simülasyonu basitleştirmek için day_factor'ü düşürelim.
                day_factor *= 0.95 # O gün yayın yoksa 30 günlük toplam biraz düşer
            
            # Değerleri hesapla
            new_tokens = max(0, tokens * day_factor)
            new_hours = max(0, hours * day_factor)
            
            # ABPS (Anlık verim)
            new_abps = new_tokens / new_hours if new_hours > 0 else 0
            
            # Followers (Zamanla artar, geçmişte azdır)
            new_followers = max(0, followers * (1 - days_ago * 0.001))
            
            new_likes = max(0, likes * day_factor)
            new_live_days = max(1, live_days * day_factor) # 30 günlük aktif gün sayısı da azalır geçmişe gidince (eğer o gün yayın yoksa)
            
            new_tis = (new_likes / new_followers * 100) if new_followers > 0 else 0
            new_cos = new_hours / new_live_days if new_live_days > 0 else 0
            
            cur.execute("""
                INSERT INTO metrics_history 
                (date, username, mentor, grup, tokens, hours, abps, followers, likes, live_days, tis, cos, joined_at, last_live)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (date_str, username, mentor, grup, new_tokens, new_hours, new_abps, 
                  new_followers, new_likes, new_live_days, new_tis, new_cos, joined_at, last_live))
            total_inserted += 1
        
        print(f"  {date_str}: veriler oluşturuldu")
    
    con.commit()
    con.close()
    
    print(f"\n✅ Toplam {total_inserted} kayıt oluşturuldu!")
    print(f"   Artık son 30 gün için veri mevcut.")

if __name__ == '__main__':
    generate_historical_data()
