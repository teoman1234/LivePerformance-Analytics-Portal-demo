"""
Gerçek Excel verilerini sisteme yükleyen script.
Hem güncel veriyi hem de tarihsel verileri yükler.
"""
import pandas as pd
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "data.db"

def load_excel(filepath, date_str):
    """Excel dosyasını oku ve DataFrame döndür"""
    df = pd.read_excel(filepath, header=1)
    
    # Kolon mapping
    col_map = {
        'İçerik üreticisinin kullanıcı adı': 'username',
        'Temsilci': 'mentor',
        'Grup': 'grup',
        'Son 30 gündeki elmaslar': 'tokens',
        'Son 30 gündeki CANLI Yayın süresi': 'hours',
        'Takipçiler': 'followers',
        'Beğeniler': 'likes',
        'Son 30 günde geçerli CANLI Yayın yapılan günler': 'live_days',
        'Katılma zamanı': 'joined_at',
        'Son CANLI': 'last_live',
    }
    
    # Kolonları yeniden adlandır
    df = df.rename(columns=col_map)
    
    # Gerekli kolonları seç
    cols = ['username', 'mentor', 'grup', 'tokens', 'hours', 'followers', 'likes', 'live_days', 'joined_at', 'last_live']
    for c in cols:
        if c not in df.columns:
            df[c] = None
    
    df = df[cols].copy()
    
    # Temizlik
    df = df.dropna(subset=['username', 'mentor'])
    df['tokens'] = pd.to_numeric(df['tokens'], errors='coerce').fillna(0)
    df['hours'] = pd.to_numeric(df['hours'], errors='coerce').fillna(0)
    df['followers'] = pd.to_numeric(df['followers'], errors='coerce').fillna(0)
    df['likes'] = pd.to_numeric(df['likes'], errors='coerce').fillna(0)
    df['live_days'] = pd.to_numeric(df['live_days'], errors='coerce').fillna(0)
    
    # Metrikleri hesapla
    df['abps'] = df.apply(lambda r: r['tokens'] / r['hours'] if r['hours'] > 0 else 0, axis=1)
    df['tis'] = df.apply(lambda r: (r['likes'] / r['followers'] * 100) if r['followers'] > 0 else 0, axis=1)
    df['cos'] = df.apply(lambda r: (r['hours'] / r['live_days']) if r['live_days'] > 0 else 0, axis=1)
    
    # Tarih ekle
    df['date'] = date_str
    
    return df

def init_historical_table(con):
    """Tarihsel veri tablosunu oluştur"""
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS metrics_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            username TEXT NOT NULL,
            mentor TEXT NOT NULL,
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
    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_date ON metrics_history(date)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_username ON metrics_history(username)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_mentor ON metrics_history(mentor)")
    con.commit()

def add_columns_to_metrics(con):
    """Ana metrics tablosuna joined_at ve last_live kolonları ekle"""
    cur = con.cursor()
    for col in ['joined_at', 'last_live']:
        try:
            cur.execute(f"ALTER TABLE metrics ADD COLUMN {col} TEXT")
        except:
            pass
    con.commit()

def load_to_db(df, con, table='metrics', clear_first=True):
    """DataFrame'i veritabanına yükle"""
    cur = con.cursor()
    
    if clear_first and table == 'metrics':
        cur.execute(f"DELETE FROM {table}")
    
    if table == 'metrics':
        cols = ['username', 'mentor', 'grup', 'tokens', 'hours', 'abps', 'followers', 'likes', 'live_days', 'tis', 'cos', 'joined_at', 'last_live']
        placeholders = ','.join(['?' for _ in cols])
        for _, row in df.iterrows():
            values = [row.get(c, None) for c in cols]
            # Convert datetime to string
            for i, v in enumerate(values):
                if pd.isna(v):
                    values[i] = None
                elif hasattr(v, 'isoformat'):
                    values[i] = str(v)
            cur.execute(f"INSERT INTO {table}({','.join(cols)}) VALUES ({placeholders})", values)
    else:
        # Historical table
        cols = ['date', 'username', 'mentor', 'grup', 'tokens', 'hours', 'abps', 'followers', 'likes', 'live_days', 'tis', 'cos', 'joined_at', 'last_live']
        placeholders = ','.join(['?' for _ in cols])
        for _, row in df.iterrows():
            values = [row.get(c, None) for c in cols]
            for i, v in enumerate(values):
                if pd.isna(v):
                    values[i] = None
                elif hasattr(v, 'isoformat'):
                    values[i] = str(v)
            cur.execute(f"INSERT INTO {table}({','.join(cols)}) VALUES ({placeholders})", values)
    
    con.commit()

def main():
    # Veritabanına bağlan
    con = sqlite3.connect(DB_PATH)
    
    # Tabloları hazırla
    init_historical_table(con)
    add_columns_to_metrics(con)
    
    # 30 Kasım verisini yükle (en güncel - ana tablo)
    print("30 Kasım verisi yükleniyor...")
    df_nov30 = load_excel('data_nov30.xlsx', '2025-11-30')
    load_to_db(df_nov30, con, table='metrics', clear_first=True)
    print(f"  -> {len(df_nov30)} kayıt ana tabloya yüklendi")
    
    # Tarihsel verileri yükle
    print("\nTarihsel veriler yükleniyor...")
    
    # Önce mevcut tarihsel verileri temizle
    cur = con.cursor()
    cur.execute("DELETE FROM metrics_history")
    con.commit()
    
    # 29 Kasım
    df_nov29 = load_excel('data_nov29.xlsx', '2025-11-29')
    load_to_db(df_nov29, con, table='metrics_history', clear_first=False)
    print(f"  -> 29 Kasım: {len(df_nov29)} kayıt")
    
    # 30 Kasım'ı da history'e ekle
    load_to_db(df_nov30, con, table='metrics_history', clear_first=False)
    print(f"  -> 30 Kasım: {len(df_nov30)} kayıt")
    
    # Meta bilgisini güncelle
    cur.execute("REPLACE INTO meta(key, value) VALUES ('last_upload', ?)", 
                (datetime.now().isoformat() + 'Z',))
    con.commit()
    
    # Özet
    cur.execute("SELECT COUNT(*) FROM metrics")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(DISTINCT mentor) FROM metrics")
    mentors = cur.fetchone()[0]
    cur.execute("SELECT AVG(abps) FROM metrics")
    avg_abps = cur.fetchone()[0]
    
    print(f"\n✅ Yükleme tamamlandı!")
    print(f"   Toplam Yayıncı: {total}")
    print(f"   Toplam Temsilci: {mentors}")
    print(f"   Ortalama ABPS: {avg_abps:.2f}")
    
    con.close()

if __name__ == '__main__':
    main()
