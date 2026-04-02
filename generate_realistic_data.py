"""
Gerçekçi tarihsel veriler oluşturur - TikTok dashboard'undaki değerlere yakın.
"""
import sqlite3
import random
from datetime import datetime, timedelta
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.db"

def generate_realistic_data():
    """TikTok dashboard'undaki gerçekçi değerlere yakın veriler oluştur"""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Mevcut metrics_history tablosunu temizle
    cur.execute("DROP TABLE IF EXISTS metrics_history")
    
    # Yeniden oluştur
    cur.execute("""
        CREATE TABLE metrics_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            username TEXT NOT NULL,
            mentor TEXT,
            grup TEXT,
            tokens REAL DEFAULT 0,
            hours REAL DEFAULT 0,
            abps REAL DEFAULT 0,
            followers REAL DEFAULT 0,
            likes REAL DEFAULT 0,
            live_days REAL DEFAULT 0,
            tis REAL DEFAULT 0,
            cos REAL DEFAULT 0,
            joined_at TEXT,
            last_live TEXT
        )
    """)
    cur.execute("CREATE INDEX idx_history_date ON metrics_history(date)")
    cur.execute("CREATE INDEX idx_history_username ON metrics_history(date, username)")
    
    # Mevcut ana verilerden kullanıcı listesini al
    cur.execute("SELECT username, mentor, grup, tokens, hours, abps, followers, likes, live_days, tis, cos FROM metrics")
    users = cur.fetchall()
    
    print(f"Toplam kullanıcı: {len(users)}")
    
    # Bugün = 30 Kasım 2025
    today = datetime(2025, 11, 30)
    
    # Hedef değerler (TikTok dashboard'undan - Ajansınız için)
    # Bugün: 125.65K token, 28 aktif
    # Bu hafta (7 gün): 9.89M token, 554 aktif  
    # Bu ay (30 gün): 50.47M token, 781 aktif
    
    # Günlük ortalama token hedefi (aylık / 30)
    daily_target_tokens = 50470000 / 30  # ~1.68M/gün
    
    # Son 31 gün için veri oluştur (31 Ekim - 30 Kasım)
    total_inserted = 0
    
    for days_ago in range(31):
        date = today - timedelta(days=days_ago)
        date_str = date.strftime("%Y-%m-%d")
        
        # O gün için aktif kullanıcı sayısı
        # Hedefler (TikTok Ajansınız):
        # - Bugün: 28 aktif, 125K token
        # - Haftalık: 554 aktif, 9.89M token  
        # - Aylık: 781 aktif, 50.47M token
        
        if days_ago == 0:
            # Bugün - düşük aktivite
            active_ratio = 0.04  # ~28 kişi
            token_multiplier = 0.3  # Düşük token
        else:
            # Diğer günler - normal aktivite
            active_ratio = random.uniform(0.03, 0.05)
            token_multiplier = 1.0
        
        active_count = 0
        day_tokens = 0
        
        for user in users:
            username, mentor, grup, base_tokens, base_hours, base_abps, followers, likes, live_days, tis, cos = user
            
            # Bu kullanıcı bugün aktif mi?
            is_active = random.random() < active_ratio
            
            if is_active:
                active_count += 1
                
                # Token üret - Aylık hedef: ~50M, 31 gün, ~1.6M/gün
                # ~30 aktif kullanıcı/gün = 50K/kullanıcı/gün ortalama
                user_daily_tokens = random.uniform(10000, 60000) * token_multiplier
                
                # Bazı kullanıcılar çok daha fazla kazanır
                if random.random() < 0.1:  # %10 yüksek performans
                    user_daily_tokens *= random.uniform(2, 4)
                
                day_tokens += user_daily_tokens
                
                # Saat hesapla (ABPS'e göre)
                user_abps = base_abps * random.uniform(0.7, 1.3)
                user_hours = user_daily_tokens / user_abps if user_abps > 0 else random.uniform(0.5, 4)
                
                # TIS ve COS
                user_tis = tis * random.uniform(0.8, 1.2)
                user_cos = cos * random.uniform(0.8, 1.2)
                
                cur.execute("""
                    INSERT INTO metrics_history 
                    (date, username, mentor, grup, tokens, hours, abps, followers, likes, live_days, tis, cos)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (date_str, username, mentor, grup, user_daily_tokens, user_hours, user_abps, 
                      followers, likes, 1, user_tis, user_cos))
                total_inserted += 1
        
        print(f"  {date_str}: {active_count} aktif kullanıcı, {day_tokens/1000:.1f}K token")
    
    con.commit()
    con.close()
    
    print(f"\n✅ Toplam {total_inserted} kayıt oluşturuldu!")

if __name__ == '__main__':
    generate_realistic_data()
