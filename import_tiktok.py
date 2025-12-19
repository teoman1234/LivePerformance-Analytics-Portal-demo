import pandas as pd
import sqlite3
from datetime import datetime

# Excel'i oku
df = pd.read_excel('tiktok_data.xlsx', skiprows=1)
print(f'Toplam kayıt: {len(df)}')

# Elmas sayısına göre sırala ve ilk 150'yi al
df = df.nlargest(150, 'Son 30 gündeki elmaslar')
print(f'Seçilen kayıt: {len(df)}')

# Sütun mapping
data = pd.DataFrame({
    'username': df['İçerik üreticisinin kullanıcı adı'].astype(str).str.strip(),
    'mentor': df['Temsilci'].astype(str).str.strip(),
    'grup': df['Grup'].astype(str).str.strip(),
    'tokens': pd.to_numeric(df['Son 30 gündeki elmaslar'], errors='coerce').fillna(0),
    'hours': pd.to_numeric(df['Son 30 gündeki CANLI Yayın süresi'], errors='coerce').fillna(0),
    'followers': pd.to_numeric(df['Takipçiler'], errors='coerce').fillna(0),
    'likes': pd.to_numeric(df['Beğeniler'], errors='coerce').fillna(0),
    'live_days': pd.to_numeric(df['Son 30 günde geçerli CANLI Yayın yapılan günler'], errors='coerce').fillna(0),
    'joined_at': df['Katılma zamanı'].astype(str).str.strip(),
    'last_live': df['Son CANLI'].astype(str).str.strip(),
})

# Metrik hesapla
data['abps'] = data.apply(lambda r: r['tokens'] / r['hours'] if r['hours'] > 0 else 0, axis=1)
data['tis'] = data.apply(lambda r: (r['likes'] / r['followers'] * 100) if r['followers'] > 0 else 0, axis=1)
data['cos'] = data.apply(lambda r: r['hours'] / r['live_days'] if r['live_days'] > 0 else 0, axis=1)

print()
print('=== İLK 5 KAYIT ===')
print(data.head().to_string())
print()
print('=== METRİKLER ===')
print(f'Toplam Token: {data["tokens"].sum():,.0f}')
print(f'Toplam Saat: {data["hours"].sum():,.1f}')
print(f'Ortalama ABPS: {data["abps"].mean():,.1f}')
print(f'Ortalama TIS: {data["tis"].mean():,.2f}%')
print(f'Ortalama COS: {data["cos"].mean():,.2f}h')
print(f'Gruplar: {data["grup"].nunique()}')
print(f'Temsilciler: {data["mentor"].nunique()}')

# Veritabanını yeniden oluştur
con = sqlite3.connect('data.db')
cur = con.cursor()

# Tabloyu yeniden oluştur (yeni sütunlarla)
cur.execute('DROP TABLE IF EXISTS metrics')
cur.execute('''
    CREATE TABLE metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        mentor TEXT NOT NULL,
        grup TEXT,
        tokens REAL NOT NULL,
        hours REAL NOT NULL,
        abps REAL NOT NULL,
        followers REAL DEFAULT 0,
        likes REAL DEFAULT 0,
        live_days REAL DEFAULT 0,
        tis REAL DEFAULT 0,
        cos REAL DEFAULT 0,
        joined_at TEXT,
        last_live TEXT
    )
''')

for _, r in data.iterrows():
    cur.execute('''INSERT INTO metrics(username, mentor, grup, tokens, hours, abps, followers, likes, live_days, tis, cos, joined_at, last_live)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (r['username'], r['mentor'], r['grup'], r['tokens'], r['hours'], r['abps'],
                 r['followers'], r['likes'], r['live_days'], r['tis'], r['cos'], r['joined_at'], r['last_live']))

ts = datetime.utcnow().isoformat() + "Z"
cur.execute("REPLACE INTO meta(key, value) VALUES(?, ?)", ("last_upload", ts))
con.commit()
con.close()

print()
print('✅ Veritabanı güncellendi!')
print(f'📅 Timestamp: {ts}')
