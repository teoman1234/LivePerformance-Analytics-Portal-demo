from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import sqlite3
import csv
import os
from datetime import datetime, date, timedelta
from pathlib import Path
import logging

# Logging setup - auto-reload trigger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="ABPS Demo Backend")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"➡️  {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"⬅️  {request.method} {request.url.path} → {response.status_code}")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = str(BASE_DIR / "data.db")
TABLE_NAME = "metrics"


# --- Auth / User design skeleton (MVP-level) ---

class LoginRequest(BaseModel):
    identifier: str  # email or phone
    password: str


class User(BaseModel):
    id: int
    email: str
    role: str


def authenticate_user(email: str, password: str) -> Optional[User]:
    """Very simple placeholder auth.

    For now, we treat a hard-coded supervisor account from environment
    variables as the primary login method. This can later be replaced
    with a proper users table and password hashing.
    """
    import os

    supervisor_email = os.getenv("SUPERSTAR_ADMIN_EMAIL", "admin@superstar.local")
    supervisor_password = os.getenv("SUPERSTAR_ADMIN_PASSWORD", "admin")

    if email == supervisor_email and password == supervisor_password:
        return User(id=1, email=supervisor_email, role="supervisor")

    return None

CSV_COLUMNS = {
    "username": ["İçerik üreticisinin kullanıcı adı", "çerik üreticisinin kullanıcı adı", "Username", "User Name"],
    "mentor": ["Temsilci", "Agent", "Mentor"],
    "tokens": ["Son 30 gündeki elmaslar", "Token", "Tokenlar", "Diamonds", "Tokens"],
    "hours": ["Son 30 gündeki CANLI Yayın süresi", "Live Duration", "Hours"],
    "grup": ["Grup", "Group", "Team"],
    "followers": ["Takipçiler", "Takipçi", "Followers"],
    "likes": ["Beğeniler", "Beğeni", "Likes"],
    "live_days": ["Son 30 günde geçerli CANLI Yayın yapılan günler", "Yayın günleri", "Live Days", "Valid Days"],
}


def init_db():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
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
            cos REAL DEFAULT 0
        )
        """
    )
    # Yeni kolonları mevcut tabloya ekle (varsa hata vermez)
    for col, typ in [("followers", "REAL DEFAULT 0"), ("likes", "REAL DEFAULT 0"), 
                     ("live_days", "REAL DEFAULT 0"), ("tis", "REAL DEFAULT 0"), ("cos", "REAL DEFAULT 0"),
                     ("tokens", "REAL DEFAULT 0")]:
        try:
            cur.execute(f"ALTER TABLE {TABLE_NAME} ADD COLUMN {col} {typ}")
        except:
            pass
    cur.execute(f"CREATE INDEX IF NOT EXISTS idx_mentor ON {TABLE_NAME}(mentor)")
    cur.execute(f"CREATE INDEX IF NOT EXISTS idx_username ON {TABLE_NAME}(username)")
    cur.execute(f"CREATE INDEX IF NOT EXISTS idx_grup ON {TABLE_NAME}(grup)")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """
    )
    # Kullanıcılar tablosu
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            email TEXT,
            phone TEXT
        )
        """
    )
    # Yeni kolonları ekle (varsa hata vermez)
    for col in ["email", "phone"]:
        try:
            cur.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT")
        except:
            pass
    
    # Değişiklik token tablosu
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS change_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            change_type TEXT NOT NULL,
            new_value TEXT,
            created_at TEXT NOT NULL,
            used INTEGER DEFAULT 0
        )
        """
    )
    
    # Admin kullanıcısı oluştur (yoksa)
    # NOT: Production'da bu şifreyi environment variable'dan alın!
    admin_password = os.environ.get("ADMIN_PASSWORD", "changeme")
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_phone = os.environ.get("ADMIN_PHONE", "+900000000000")
    
    cur.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO users (username, password, display_name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
                    ("admin", admin_password, "Admin", "Yönetici", admin_email, admin_phone))
    else:
        # Mevcut admin'e email ve phone ekle
        cur.execute("UPDATE users SET email = ?, phone = ? WHERE username = 'admin' AND email IS NULL",
                    (admin_email, admin_phone))
    con.commit()
    con.close()


init_db()


# ==================== AUTH ENDPOINTS ====================

import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class LoginRequest(BaseModel):
    identifier: str  # email veya telefon
    password: str

class ChangeRequest(BaseModel):
    user_id: int
    change_type: str  # 'email', 'phone', 'password'
    new_value: str

class VerifyChangeRequest(BaseModel):
    token: str
    new_value: Optional[str] = None

def mask_email(email: str) -> str:
    """Email adresini maskele: a***b@gmail.com"""
    if not email or '@' not in email:
        return email
    local, domain = email.split('@')
    if len(local) <= 2:
        return f"{local[0]}***@{domain}"
    return f"{local[0]}***{local[-1]}@{domain}"

def mask_phone(phone: str) -> str:
    """Telefon numarasını maskele: +90****4872"""
    if not phone or len(phone) < 8:
        return phone
    return f"{phone[:3]}****{phone[-4:]}"

def send_verification_email(to_email: str, token: str, change_type: str):
    """Doğrulama emaili gönder (simülasyon - gerçek SMTP gerekir)"""
    # NOT: Gerçek uygulamada SMTP ayarları gerekir
    # Şimdilik sadece log'a yazalım
    verify_url = f"http://localhost:5173/verify?token={token}"
    logger.info(f"📧 Verification email sent to {to_email}")
    logger.info(f"   Change type: {change_type}")
    logger.info(f"   Verification URL: {verify_url}")
    return True

@app.post("/api/login")
async def login(req: LoginRequest) -> Dict[str, Any]:
    """Kullanıcı girişi - email veya telefon ile."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    # Email veya telefon ile giriş
    cur.execute(
        "SELECT id, username, display_name, role, email, phone FROM users WHERE (email = ? OR phone = ?) AND password = ?", 
        (req.identifier, req.identifier, req.password)
    )
    user = cur.fetchone()
    con.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz e-posta/telefon veya şifre")
    
    return {
        "success": True,
        "user": {
            "id": user[0],
            "username": user[1],
            "display_name": user[2],
            "role": user[3],
            "email": user[4],
            "phone": user[5],
        }
    }

@app.get("/api/user/{user_id}")
async def get_user(user_id: int) -> Dict[str, Any]:
    """Kullanıcı bilgilerini getir."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT id, username, display_name, role, email, phone FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    con.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    return {
        "id": user[0],
        "username": user[1],
        "display_name": user[2],
        "role": user[3],
        "email": user[4],
        "phone": user[5],
        "masked_email": mask_email(user[4]),
        "masked_phone": mask_phone(user[5]),
    }

@app.post("/api/request-change")
async def request_change(req: ChangeRequest) -> Dict[str, Any]:
    """Bilgi değişikliği talebi - email ile doğrulama linki gönderir."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Kullanıcıyı bul
    cur.execute("SELECT id, email FROM users WHERE id = ?", (req.user_id,))
    user = cur.fetchone()
    
    if not user:
        con.close()
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Token oluştur
    token = secrets.token_urlsafe(32)
    created_at = datetime.now().isoformat()
    
    # Token'ı kaydet
    cur.execute(
        "INSERT INTO change_tokens (user_id, token, change_type, new_value, created_at) VALUES (?, ?, ?, ?, ?)",
        (req.user_id, token, req.change_type, req.new_value, created_at)
    )
    con.commit()
    con.close()
    
    # Email gönder
    send_verification_email(user[1], token, req.change_type)
    
    return {
        "success": True,
        "message": "Doğrulama linki e-posta adresinize gönderildi."
    }

@app.post("/api/verify-change")
async def verify_change(req: VerifyChangeRequest) -> Dict[str, Any]:
    """Token ile değişikliği doğrula ve uygula."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Token'ı bul
    cur.execute(
        "SELECT id, user_id, change_type, new_value, created_at, used FROM change_tokens WHERE token = ?",
        (req.token,)
    )
    token_data = cur.fetchone()
    
    if not token_data:
        con.close()
        raise HTTPException(status_code=404, detail="Geçersiz veya süresi dolmuş link")
    
    if token_data[5] == 1:
        con.close()
        raise HTTPException(status_code=400, detail="Bu link zaten kullanılmış")
    
    # Token süresini kontrol et (24 saat)
    created_at = datetime.fromisoformat(token_data[4])
    if (datetime.now() - created_at).total_seconds() > 86400:
        con.close()
        raise HTTPException(status_code=400, detail="Link süresi dolmuş")
    
    user_id = token_data[1]
    change_type = token_data[2]
    new_value = req.new_value or token_data[3]
    
    # Değişikliği uygula
    if change_type == 'email':
        cur.execute("UPDATE users SET email = ? WHERE id = ?", (new_value, user_id))
    elif change_type == 'phone':
        cur.execute("UPDATE users SET phone = ? WHERE id = ?", (new_value, user_id))
    elif change_type == 'password':
        cur.execute("UPDATE users SET password = ? WHERE id = ?", (new_value, user_id))
    
    # Token'ı kullanıldı olarak işaretle
    cur.execute("UPDATE change_tokens SET used = 1 WHERE id = ?", (token_data[0],))
    
    con.commit()
    con.close()
    
    return {
        "success": True,
        "message": f"{change_type.title()} başarıyla güncellendi."
    }

@app.get("/api/verify-token/{token}")
async def verify_token(token: str) -> Dict[str, Any]:
    """Token geçerliliğini kontrol et."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    cur.execute(
        "SELECT change_type, new_value, created_at, used FROM change_tokens WHERE token = ?",
        (token,)
    )
    token_data = cur.fetchone()
    con.close()
    
    if not token_data:
        raise HTTPException(status_code=404, detail="Geçersiz link")
    
    if token_data[3] == 1:
        raise HTTPException(status_code=400, detail="Bu link zaten kullanılmış")
    
    created_at = datetime.fromisoformat(token_data[2])
    if (datetime.now() - created_at).total_seconds() > 86400:
        raise HTTPException(status_code=400, detail="Link süresi dolmuş")
    
    return {
        "valid": True,
        "change_type": token_data[0],
        "has_value": token_data[1] is not None
    }


# ==================== ADMIN API (Dev Only) ====================

class AdminUserUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    display_name: Optional[str] = None
    role: Optional[str] = None

@app.get("/api/admin/users")
async def admin_list_users() -> Dict[str, Any]:
    """List all users (Admin API)."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT id, username, display_name, role, email, phone FROM users")
    users = cur.fetchall()
    con.close()
    
    return {
        "users": [
            {
                "id": u[0],
                "username": u[1],
                "display_name": u[2],
                "role": u[3],
                "email": u[4],
                "phone": u[5],
            }
            for u in users
        ]
    }

@app.put("/api/admin/user/{user_id}")
async def admin_update_user(user_id: int, data: AdminUserUpdate) -> Dict[str, Any]:
    """Update user details (Admin API)."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Mevcut kullanıcıyı kontrol et
    cur.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cur.fetchone():
        con.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Güncelleme yap
    updates = []
    values = []
    
    if data.email is not None:
        updates.append("email = ?")
        values.append(data.email)
    if data.phone is not None:
        updates.append("phone = ?")
        values.append(data.phone)
    if data.password is not None:
        updates.append("password = ?")
        values.append(data.password)
    if data.display_name is not None:
        updates.append("display_name = ?")
        values.append(data.display_name)
    if data.role is not None:
        updates.append("role = ?")
        values.append(data.role)
    
    if updates:
        values.append(user_id)
        cur.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", values)
        con.commit()
    
    # Güncel kullanıcıyı döndür
    cur.execute("SELECT id, username, display_name, role, email, phone FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    con.close()
    
    logger.info(f"✅ User {user_id} updated: {data}")
    
    return {
        "success": True,
        "user": {
            "id": user[0],
            "username": user[1],
            "display_name": user[2],
            "role": user[3],
            "email": user[4],
            "phone": user[5],
        }
    }

@app.post("/api/admin/user")
async def admin_create_user(data: AdminUserUpdate) -> Dict[str, Any]:
    """Create new user (Admin API)."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Username oluştur (email'den)
    username = data.email.split('@')[0] if data.email else f"user_{datetime.now().timestamp()}"
    
    try:
        cur.execute(
            "INSERT INTO users (username, password, display_name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
            (username, data.password or "123456", data.display_name or username, data.role or "User", data.email, data.phone)
        )
        user_id = cur.lastrowid
        con.commit()
    except sqlite3.IntegrityError:
        con.close()
        raise HTTPException(status_code=400, detail="User already exists")
    
    cur.execute("SELECT id, username, display_name, role, email, phone FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    con.close()
    
    logger.info(f"✅ New user created: {username}")
    
    return {
        "success": True,
        "user": {
            "id": user[0],
            "username": user[1],
            "display_name": user[2],
            "role": user[3],
            "email": user[4],
            "phone": user[5],
        }
    }


@app.delete("/api/admin/user/{user_id}")
async def admin_delete_user(user_id: int) -> Dict[str, Any]:
    """Delete user (Admin API)."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    cur.execute("SELECT username FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    
    if not user:
        con.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
    con.commit()
    con.close()
    
    logger.info(f"🗑️ User {user_id} deleted: {user[0]}")
    
    return {"success": True, "message": f"User {user[0]} deleted"}


# Dashboard Override Storage (in-memory, can be persisted to DB if needed)
_dashboard_override = {
    "enabled": False,
    "stats": {
        "total_tokens": 0,
        "broadcast_rate": 0,
        "active_creators": 0,
        "total_hours": 0,
        "avg_abps": 0,
        "avg_tis": 0,
        "avg_cos": 0,
        "new_creators": 0,
    }
}

@app.get("/api/admin/dashboard-override")
async def get_dashboard_override() -> Dict[str, Any]:
    """Dashboard override ayarlarını getir."""
    return _dashboard_override

@app.put("/api/admin/dashboard-override")
async def update_dashboard_override(data: Dict[str, Any]) -> Dict[str, Any]:
    """Dashboard override ayarlarını güncelle."""
    global _dashboard_override
    
    if "enabled" in data:
        _dashboard_override["enabled"] = data["enabled"]
    if "stats" in data:
        _dashboard_override["stats"].update(data["stats"])
    
    logger.info(f"📊 Dashboard override updated: enabled={_dashboard_override['enabled']}")
    
    return {"success": True, "data": _dashboard_override}


# ==================== FILE PROCESSING ====================

def df_from_upload(upload: UploadFile) -> pd.DataFrame:
    content = upload.file.read()
    name = upload.filename or ""
    if name.lower().endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
    elif name.lower().endswith(".xlsx"):
        # TikTok export files have metadata in row 0, real headers in row 1
        df = pd.read_excel(io.BytesIO(content))
        # Check if first row looks like metadata (contains "Dışa aktarma" or similar)
        if len(df.columns) > 0 and any("aktarma" in str(c).lower() or "unnamed" in str(c).lower() for c in df.columns):
            df = pd.read_excel(io.BytesIO(content), skiprows=1)
    else:
        try:
            df = pd.read_csv(io.BytesIO(content))
        except Exception:
            try:
                df = pd.read_excel(io.BytesIO(content))
            except Exception:
                raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or XLSX.")
    return df


def _resolve_column(df: pd.DataFrame, candidates: list[str]) -> str:
    for cand in candidates:
        if cand in df.columns:
            return cand
    # fallback: case-insensitive / trailing match
    lowered = [c.lower() for c in df.columns]
    for cand in candidates:
        lcand = cand.lower()
        for i, existing in enumerate(lowered):
            if existing == lcand or existing.endswith(lcand) or lcand.endswith(existing):
                return df.columns[i]
    raise HTTPException(status_code=400, detail=f"Missing required column: {candidates[0]}")


def normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    username_col = _resolve_column(df, CSV_COLUMNS["username"])  # type: ignore[arg-type]
    mentor_col = _resolve_column(df, CSV_COLUMNS["mentor"])      # type: ignore[arg-type]
    tokens_col = _resolve_column(df, CSV_COLUMNS["tokens"])      # type: ignore[arg-type]
    hours_col = _resolve_column(df, CSV_COLUMNS["hours"])        # type: ignore[arg-type]
    
    # Optional columns
    try:
        grup_col = _resolve_column(df, CSV_COLUMNS["grup"])
        grup_series = df[grup_col].astype(str).str.strip()
    except:
        grup_series = pd.Series([""] * len(df))
    
    try:
        followers_col = _resolve_column(df, CSV_COLUMNS["followers"])
        followers_series = pd.to_numeric(df[followers_col], errors="coerce").fillna(0.0).clip(lower=0)
    except:
        followers_series = pd.Series([0.0] * len(df))
    
    try:
        likes_col = _resolve_column(df, CSV_COLUMNS["likes"])
        likes_series = pd.to_numeric(df[likes_col], errors="coerce").fillna(0.0).clip(lower=0)
    except:
        likes_series = pd.Series([0.0] * len(df))
    
    try:
        live_days_col = _resolve_column(df, CSV_COLUMNS["live_days"])
        live_days_series = pd.to_numeric(df[live_days_col], errors="coerce").fillna(0.0).clip(lower=0)
    except:
        live_days_series = pd.Series([0.0] * len(df))
    
    tokens_series = pd.to_numeric(df[tokens_col], errors="coerce").fillna(0.0).clip(lower=0)
    hours_series = pd.to_numeric(df[hours_col], errors="coerce").fillna(0.0).clip(lower=0)
    
    out = pd.DataFrame({
        "username": df[username_col].astype(str).str.strip(),
        "mentor": df[mentor_col].astype(str).str.strip(),
        "grup": grup_series,
        "tokens": tokens_series,
        "hours": hours_series,
        "followers": followers_series,
        "likes": likes_series,
        "live_days": live_days_series,
    })
    
    # Metrik hesaplamaları
    # ABPS: Token / Saat (Verimlilik)
    out["abps"] = out.apply(lambda r: (r["tokens"] / r["hours"]) if r["hours"] > 0 else 0.0, axis=1)
    # TIS: Beğeni / Takipçi * 100 (Etkileşim Kalitesi)
    out["tis"] = out.apply(lambda r: (r["likes"] / r["followers"] * 100) if r["followers"] > 0 else 0.0, axis=1)
    # COS: Saat / Gün (Oturum Sürekliliği)
    out["cos"] = out.apply(lambda r: (r["hours"] / r["live_days"]) if r["live_days"] > 0 else 0.0, axis=1)
    
    return out


def persist_df(df: pd.DataFrame):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(f"DELETE FROM {TABLE_NAME}")
    rows = df[["username", "mentor", "grup", "tokens", "hours", "abps", "followers", "likes", "live_days", "tis", "cos"]].values.tolist()
    cur.executemany(
        f"INSERT INTO {TABLE_NAME}(username, mentor, grup, tokens, hours, abps, followers, likes, live_days, tis, cos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rows,
    )
    con.commit()
    con.close()


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)) -> Dict[str, Any]:
    df = df_from_upload(file)
    df = normalize_df(df)
    persist_df(df)
    ts = datetime.utcnow().isoformat()+"Z"
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("REPLACE INTO meta(key,value) VALUES(?,?)", ("last_upload", ts))
    con.commit()
    con.close()
    mentors = df["mentor"].nunique()
    influencers = df["username"].nunique()
    return {
        "rows": int(df.shape[0]),
        "mentors": int(mentors),
        "influencers": int(influencers),
        "avg_abps": float(df["abps"].mean()) if df.shape[0] else 0.0,
        "last_upload": ts,
    }


@app.get("/api/influencers")
async def influencers(
    mentor: str | None = None,
    sort: str = "abps",
    order: str = "desc",
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List influencers with filters, search, sorting and pagination."""
    if sort not in {"abps", "tokens", "hours", "username", "tis", "cos", "followers", "likes"}:
        sort = "abps"
    direction = "DESC" if order.lower() == "desc" else "ASC"
    # Limit increased to 10000 to support larger datasets
    limit = max(1, min(limit, 10000))
    offset = max(0, offset)
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    clauses = []
    params: list[Any] = []
    if mentor:
        clauses.append("mentor = ?")
        params.append(mentor)
    if q:
        clauses.append("(LOWER(username) LIKE ? OR LOWER(mentor) LIKE ?)")
        like = f"%{q.lower()}%"
        params.extend([like, like])
    where_sql = ""
    if clauses:
        where_sql = " WHERE " + " AND ".join(clauses)
    cur.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}{where_sql}", params)
    total = cur.fetchone()[0]
    cur.execute(
        f"SELECT username, mentor, tokens, hours, abps, followers, likes, live_days, tis, cos, joined_at, last_live FROM {TABLE_NAME}{where_sql} ORDER BY {sort} {direction} LIMIT ? OFFSET ?",
        params + [limit, offset],
    )
    rows = cur.fetchall()
    con.close()
    return {
        "total": int(total),
        "limit": limit,
        "offset": offset,
        "items": [
            {"username": r[0], "mentor": r[1], "tokens": r[2], "hours": r[3], "abps": r[4],
             "followers": r[5], "likes": r[6], "live_days": r[7], "tis": round(r[8], 2), "cos": round(r[9], 2),
             "joined_at": r[10] or "", "last_live": r[11] or ""}
            for r in rows
        ],
    }


def get_archetype(username: str) -> str:
    """Determine a deterministic archetype based on username"""
    hash_val = sum(ord(c) for c in username)
    mod = hash_val % 100
    
    if mod < 15: return "SNIPER"       # 15%
    if mod < 40: return "GRINDER"      # 25%
    if mod < 55: return "RISING_STAR"  # 15%
    if mod < 60: return "UNICORN"      # 5%
    return "STANDARD"                  # 40%

def calculate_ovr(abps: float, tis: float, cos: float) -> int:
    """
    Calculate OVR (Overall Rating) (0-99).
    FIFA card logic.
    """
    # Heuristic normalization
    # ABPS: 1000 is good -> 40 pts
    # TIS: 2000 is good -> 30 pts
    # COS: 3.0 is good -> 30 pts
    
    score = 0
    score += min(40, (abps / 1000) * 40)
    score += min(30, (tis / 2000) * 30)
    score += min(30, (cos / 3.0) * 30)
    
    # Base score to avoid 0
    score = max(40, score)
    
    return int(min(99, score))


@app.get("/api/influencer/{username}")
async def influencer(username: str) -> Dict[str, Any]:
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(f"SELECT username, mentor, tokens, hours, abps, followers, likes, live_days, tis, cos, joined_at, last_live FROM {TABLE_NAME} WHERE username = ?", (username,))
    r = cur.fetchone()
    con.close()
    if not r:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    abps = r[4]
    tis = r[8]
    cos = r[9]
    
    archetype = get_archetype(r[0])
    ovr = calculate_ovr(abps, tis, cos)
    
    return {
        "username": r[0], "mentor": r[1], "tokens": r[2], "hours": r[3], "abps": abps,
        "followers": r[5], "likes": r[6], "live_days": r[7], "tis": round(tis, 2), "cos": round(cos, 2),
        "joined_at": r[10] or "", "last_live": r[11] or "",
        "archetype": archetype,
        "ovr": ovr
    }


@app.get("/api/metrics")
async def metrics() -> Dict[str, Any]:
    """Key metrics: total tokens, average ABPS, TIS, COS etc."""
    
    # Dashboard override check
    if _dashboard_override["enabled"]:
        stats = _dashboard_override["stats"]
        return {
            "total_tokens": float(stats.get("total_tokens", 0)),
            "total_hours": float(stats.get("total_hours", 0)),
            "avg_abps": round(float(stats.get("avg_abps", 0)), 2),
            "total_influencers": int(stats.get("active_influencers", 0)),
            "active_influencers": int(stats.get("active_influencers", 0)),
            "live_ratio": round(float(stats.get("broadcast_rate", 0)), 2),
            "total_followers": 0,
            "total_likes": 0,
            "avg_tis": round(float(stats.get("avg_tis", 0)), 2),
            "avg_cos": round(float(stats.get("avg_cos", 0)), 2),
            "new_influencers": int(stats.get("new_influencers", 0)),
            "last_upload": None,
            "override_active": True,
        }
    
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(f"SELECT SUM(tokens), SUM(hours), AVG(abps), COUNT(*), SUM(followers), SUM(likes), AVG(tis), AVG(cos) FROM {TABLE_NAME}")
    row = cur.fetchone()
    total_tokens = row[0] or 0
    total_hours = row[1] or 0
    avg_abps = row[2] or 0
    total_influencers = row[3] or 0
    total_followers = row[4] or 0
    total_likes = row[5] or 0
    avg_tis = row[6] or 0
    avg_cos = row[7] or 0
    # Active: hours > 0
    cur.execute(f"SELECT COUNT(*) FROM {TABLE_NAME} WHERE hours > 0")
    active_influencers = cur.fetchone()[0]
    # Avg daily LIVE ratio (simulated: active/total * 100)
    live_ratio = (active_influencers / total_influencers * 100) if total_influencers > 0 else 0
    cur.execute("SELECT value FROM meta WHERE key='last_upload'")
    lu = cur.fetchone()
    con.close()
    return {
        "total_tokens": float(total_tokens),
        "total_hours": float(total_hours),
        "avg_abps": round(float(avg_abps), 2),
        "total_influencers": int(total_influencers),
        "active_influencers": int(active_influencers),
        "live_ratio": round(live_ratio, 2),
        "total_followers": float(total_followers),
        "total_likes": float(total_likes),
        "avg_tis": round(float(avg_tis), 2),
        "avg_cos": round(float(avg_cos), 2),
        "last_upload": lu[0] if lu else None,
    }


@app.get("/api/grup-stats")
async def grup_stats(
    period: str = Query("monthly", description="daily, weekly, monthly"),
    filter_type: str = Query("all", description="all or team")
) -> List[Dict[str, Any]]:
    """Group based stats: total tokens, influencer count, ABPS/TIS/COS average."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Find latest data date
    cur.execute("SELECT MAX(date) FROM metrics_history")
    latest_date_str = cur.fetchone()[0]
    if latest_date_str:
        latest_date = date.fromisoformat(latest_date_str)
    else:
        latest_date = date.today()
    
    # Calculate date range (based on latest data)
    if period == "daily":
        start_date = latest_date
        end_date = latest_date
    elif period == "weekly":
        start_date = latest_date - timedelta(days=6)
        end_date = latest_date
    else:  # monthly
        start_date = latest_date - timedelta(days=29)
        end_date = latest_date
    
    # Fetch from history table by period (including TIS and COS)
    cur.execute(f"""
        SELECT 
            COALESCE(NULLIF(h.grup, ''), 'No Group') as grup_name,
            COUNT(DISTINCT h.username) as influencer_count,
            SUM(h.tokens) as total_tokens,
            SUM(h.hours) as total_hours,
            AVG(h.abps) as avg_abps,
            AVG(h.tis) as avg_tis,
            AVG(h.cos) as avg_cos
        FROM metrics_history h
        WHERE h.date BETWEEN ? AND ?
        GROUP BY grup_name
        ORDER BY total_tokens DESC
    """, (start_date.isoformat(), end_date.isoformat()))
    rows = cur.fetchall()
    con.close()
    
    return [
        {
            "grup": r[0],
            "influencer_count": int(r[1]),
            "total_tokens": float(r[2] or 0),
            "total_hours": float(r[3] or 0),
            "avg_abps": round(float(r[4] or 0), 2),
            "avg_tis": round(float(r[5] or 0), 2),
            "avg_cos": round(float(r[6] or 0), 2),
        }
        for r in rows
    ]


@app.get("/api/temel-metrikler")
async def temel_metrikler() -> Dict[str, Any]:
    """TikTok Backstage style Key Metrics: Agency and Creator groups."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Total stats
    cur.execute(f"""
        SELECT 
            COUNT(DISTINCT mentor) as ajans_count,
            COUNT(*) as uretici_count,
            SUM(tokens) as total_tokens,
            SUM(hours) as total_hours,
            SUM(followers) as total_followers,
            SUM(likes) as total_likes,
            SUM(live_days) as total_live_days
        FROM {TABLE_NAME}
    """)
    totals = cur.fetchone()
    
    # Agency (mentor) based summary
    cur.execute(f"""
        SELECT 
            mentor,
            COUNT(*) as uretici_count,
            SUM(tokens) as total_tokens,
            SUM(hours) as total_hours,
            AVG(abps) as avg_abps
        FROM {TABLE_NAME}
        GROUP BY mentor
        ORDER BY total_tokens DESC
    """)
    ajanslar = cur.fetchall()
    
    # Group based summary
    cur.execute(f"""
        SELECT 
            COALESCE(NULLIF(grup, ''), 'No Group') as grup_name,
            COUNT(*) as uretici_count,
            SUM(tokens) as total_tokens,
            SUM(hours) as total_hours,
            AVG(abps) as avg_abps
        FROM {TABLE_NAME}
        GROUP BY grup_name
        ORDER BY total_tokens DESC
    """)
    gruplar = cur.fetchall()
    
    con.close()
    
    return {
        "ozet": {
            "ajans_sayisi": int(totals[0] or 0),
            "uretici_sayisi": int(totals[1] or 0),
            "toplam_token": float(totals[2] or 0),
            "toplam_saat": float(totals[3] or 0),
            "toplam_takipci": float(totals[4] or 0),
            "toplam_begeni": float(totals[5] or 0),
            "toplam_yayin_gunu": float(totals[6] or 0),
        },
        "ajanslar": [
            {
                "ad": r[0],
                "uretici_sayisi": int(r[1]),
                "toplam_token": float(r[2] or 0),
                "toplam_saat": float(r[3] or 0),
                "ortalama_abps": round(float(r[4] or 0), 1),
            }
            for r in ajanslar
        ],
        "gruplar": [
            {
                "ad": r[0],
                "uretici_sayisi": int(r[1]),
                "toplam_token": float(r[2] or 0),
                "toplam_saat": float(r[3] or 0),
                "ortalama_abps": round(float(r[4] or 0), 1),
            }
            for r in gruplar
        ],
    }


@app.get("/api/supervisor")
async def supervisor(top: int = 60, bottom: int = 27) -> Dict[str, Any]:
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    # ABPS ortalamaları ve toplam token
    cur.execute(f"SELECT mentor, AVG(abps), AVG(tis), AVG(cos), SUM(tokens) FROM {TABLE_NAME} GROUP BY mentor ORDER BY AVG(abps) DESC")
    mentor_rows = cur.fetchall()
    cur.execute(f"SELECT username, mentor, abps, tis, cos, tokens FROM {TABLE_NAME} ORDER BY abps DESC LIMIT ?", (top,))
    top_rows = cur.fetchall()
    cur.execute(f"SELECT username, mentor, abps FROM {TABLE_NAME} ORDER BY abps ASC LIMIT ?", (bottom,))
    bottom_rows = cur.fetchall()
    cur.execute("SELECT value FROM meta WHERE key='last_upload'")
    lu = cur.fetchone()
    con.close()
    return {
        "mentor_avg_abps": [{"mentor": m, "avg_abps": float(a or 0), "avg_tis": float(t or 0), "avg_cos": float(c or 0), "total_tokens": int(tk or 0)} for (m, a, t, c, tk) in mentor_rows],
        "top_influencers": [{"username": u, "mentor": m, "abps": float(a or 0), "tis": float(t or 0), "cos": float(c or 0), "tokens": int(tk or 0)} for (u, m, a, t, c, tk) in top_rows],
        "bottom_influencers": [{"username": u, "mentor": m, "abps": float(a)} for (u, m, a) in bottom_rows],
        "last_upload": lu[0] if lu else None,
    }


@app.get("/api/export.csv")
async def export_csv() -> StreamingResponse:
    """Export current metrics with timestamps."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT value FROM meta WHERE key='last_upload'")
    lu = cur.fetchone()
    cur.execute(f"SELECT username, mentor, tokens, hours, abps FROM {TABLE_NAME} ORDER BY abps DESC")
    rows = cur.fetchall()
    con.close()
    exported_at = datetime.utcnow().isoformat()+"Z"
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["exported_at", exported_at])
    writer.writerow(["username", "mentor", "tokens", "hours", "abps", "last_upload"])
    for r in rows:
        writer.writerow(list(r) + [lu[0] if lu else ""])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=metrics_export.csv"})


@app.get("/api/history/dates")
async def history_dates() -> List[str]:
    """Return dates with historical data"""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    try:
        cur.execute("SELECT DISTINCT date FROM metrics_history ORDER BY date DESC")
        dates = [r[0] for r in cur.fetchall()]
    except:
        dates = []
    con.close()
    return dates


@app.get("/api/metrics/period")
async def metrics_by_period(period: str = "daily", filter_type: str = "all") -> Dict[str, Any]:
    """
    Return metrics by period
    period: daily, weekly, monthly
    filter_type: all (agency), team (your team - creators)
    
    Realistic TikTok-like values:
    - Today + Your Creators: 16K diamonds, 5 active
    - This Week + Your Creators: 1.44M diamonds, 76 active  
    - This Month + Your Creators: 7.89M diamonds, 98 active
    - Today + Agency: 125K diamonds, 28 active
    - This Week + Agency: 9.89M diamonds, 554 active
    - This Month + Agency: 50.47M diamonds, 781 active
    """
    from datetime import datetime, timedelta
    
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Get latest date
    cur.execute("SELECT MAX(date) FROM metrics_history")
    latest_date_str = cur.fetchone()[0]
    
    if not latest_date_str:
        con.close()
        return {"error": "No data found", "data": []}
    
    latest_date = datetime.strptime(latest_date_str, "%Y-%m-%d")
    
    # Determine date range by period
    if period == "daily":
        start_date = latest_date
    elif period == "weekly":
        start_date = latest_date - timedelta(days=7)
    else:  # monthly
        start_date = latest_date - timedelta(days=30)
    
    start_date_str = start_date.strftime("%Y-%m-%d")
    
    # Realistic values close to TikTok dashboard
    # filter_type: team = your creators (small), all = agency (large)
    realistic_data = {
        "daily": {
            "team": {"tokens": 16070, "active_users": 5, "live_ratio": 4.76},
            "all": {"tokens": 125650, "active_users": 28, "live_ratio": 3.89}
        },
        "weekly": {
            "team": {"tokens": 1440000, "active_users": 76, "live_ratio": 43.2},
            "all": {"tokens": 9890000, "active_users": 554, "live_ratio": 43.53}
        },
        "monthly": {
            "team": {"tokens": 7890000, "active_users": 98, "live_ratio": 46.17},
            "all": {"tokens": 50470000, "active_users": 781, "live_ratio": 44.39}
        }
    }
    
    filter_key = "team" if filter_type == "team" else "all"
    realistic = realistic_data.get(period, realistic_data["monthly"]).get(filter_key)
    
    try:
        # Fetch from real DB but scale with realistic numbers
        if filter_type == "mentors":
            cur.execute("""
                SELECT mentor, 
                       SUM(tokens) as total_tokens, 
                       AVG(hours) as avg_hours, 
                       AVG(abps) as avg_abps,
                       AVG(tis) as avg_tis,
                       AVG(cos) as avg_cos,
                       COUNT(DISTINCT username) as user_count
                FROM metrics_history 
                WHERE date >= ? AND date <= ?
                GROUP BY mentor
                ORDER BY total_tokens DESC
            """, (start_date_str, latest_date_str))
            
            rows = cur.fetchall()
            data = [
                {
                    "mentor": r[0],
                    "tokens": round(r[1], 2),
                    "hours": round(r[2], 2),
                    "abps": round(r[3], 2),
                    "tis": round(r[4], 2),
                    "cos": round(r[5], 2),
                    "user_count": r[6]
                }
                for r in rows
            ]
            
        else:  # all or team
            cur.execute("""
                SELECT username, mentor,
                       SUM(tokens) as total_tokens, 
                       AVG(hours) as avg_hours, 
                       AVG(abps) as avg_abps,
                       AVG(tis) as avg_tis,
                       AVG(cos) as avg_cos,
                       AVG(followers) as avg_followers
                FROM metrics_history 
                WHERE date >= ? AND date <= ?
                GROUP BY username
                ORDER BY avg_abps DESC
            """, (start_date_str, latest_date_str))
            
            rows = cur.fetchall()
            data = [
                {
                    "username": r[0],
                    "mentor": r[1],
                    "tokens": round(r[2], 2),
                    "hours": round(r[3], 2),
                    "abps": round(r[4], 2),
                    "tis": round(r[5], 2),
                    "cos": round(r[6], 2),
                    "followers": round(r[7], 2)
                }
                for r in rows
            ]
        
        # Realistic summary stats close to TikTok dashboard
        # Team (Your Influencers) higher values (small team, higher quality)
        # All (Agency) average values (large team, average quality)
        if filter_key == "team":
            avg_tis_values = {"daily": 2150.5, "weekly": 2080.3, "monthly": 1950.8}
            avg_cos_values = {"daily": 3.2, "weekly": 2.95, "monthly": 2.78}
        else:  # all
            avg_tis_values = {"daily": 1851.02, "weekly": 1830.39, "monthly": 1758.0}
            avg_cos_values = {"daily": 2.31, "weekly": 2.44, "monthly": 2.45}
        
        summary = {
            "total_users": realistic["active_users"],
            "total_mentors": 17 if filter_key == "all" else 3,
            "total_tokens": realistic["tokens"],
            "live_ratio": realistic["live_ratio"],
            "avg_abps": round(realistic["tokens"] / max(1, realistic["active_users"]) / (7 if period == "weekly" else 30 if period == "monthly" else 1) / 10, 2),
            "avg_tis": avg_tis_values.get(period, 1800),
            "avg_cos": avg_cos_values.get(period, 2.4),
        }
        
    except Exception as e:
        con.close()
        return {"error": str(e), "data": [], "summary": {}}
    
    con.close()
    return {
        "period": period,
        "filter_type": filter_type,
        "start_date": start_date_str,
        "end_date": latest_date_str,
        "data": data,
        "summary": summary
    }


@app.get("/api/chart/period")
async def chart_by_period(period: str = "daily", filter_type: str = "all") -> Dict[str, Any]:
    """
    Return daily trend data for charts by period
    period: daily, weekly, monthly
    filter_type: all, mentors (agencies), influencers (creators)
    """
    from datetime import datetime, timedelta
    
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    # Get latest date
    cur.execute("SELECT MAX(date) FROM metrics_history")
    latest_date_str = cur.fetchone()[0]
    
    if not latest_date_str:
        con.close()
        return {"error": "No data found", "labels": [], "datasets": []}
    
    latest_date = datetime.strptime(latest_date_str, "%Y-%m-%d")
    
    # Determine date range by period
    if period == "daily":
        start_date = latest_date
    elif period == "weekly":
        start_date = latest_date - timedelta(days=7)
    else:  # monthly
        start_date = latest_date - timedelta(days=30)
    
    start_date_str = start_date.strftime("%Y-%m-%d")
    
    try:
        if filter_type == "mentors":
            # Mentor based daily trend
            cur.execute("""
                SELECT date, mentor, AVG(abps) as avg_abps, SUM(tokens) as total_tokens
                FROM metrics_history 
                WHERE date >= ? AND date <= ?
                GROUP BY date, mentor
                ORDER BY date
            """, (start_date_str, latest_date_str))
            
            rows = cur.fetchall()
            
            # Mentor list
            mentors = sorted(set(r[1] for r in rows))
            dates = sorted(set(r[0] for r in rows))
            
            # Create dataset per mentor
            datasets = []
            colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
            
            for i, mentor in enumerate(mentors[:8]):  # First 8 mentors
                mentor_data = {r[0]: r[2] for r in rows if r[1] == mentor}
                datasets.append({
                    "label": mentor or "Unknown",
                    "data": [round(mentor_data.get(d, 0), 2) for d in dates],
                    "borderColor": colors[i % len(colors)],
                    "backgroundColor": f"{colors[i % len(colors)]}40",
                })
            
            labels = [d.split('-')[2] + '/' + d.split('-')[1] for d in dates]  # DD/MM format
            
        else:  # all or influencers
            # General daily trend
            cur.execute("""
                SELECT date, AVG(abps) as avg_abps, SUM(tokens) as total_tokens, COUNT(DISTINCT username) as users
                FROM metrics_history 
                WHERE date >= ? AND date <= ?
                GROUP BY date
                ORDER BY date
            """, (start_date_str, latest_date_str))
            
            rows = cur.fetchall()
            
            labels = [r[0].split('-')[2] + '/' + r[0].split('-')[1] for r in rows]  # DD/MM format
            
            datasets = [
                {
                    "label": "Avg RV",
                    "data": [round(r[1], 2) for r in rows],
                    "borderColor": "#3b82f6",
                    "backgroundColor": "#3b82f640",
                    "yAxisID": "y"
                },
                {
                    "label": "Total Tokens (K)",
                    "data": [round(r[2] / 1000, 1) for r in rows],
                    "borderColor": "#10b981",
                    "backgroundColor": "#10b98140",
                    "yAxisID": "y1"
                }
            ]
        
    except Exception as e:
        con.close()
        return {"error": str(e), "labels": [], "datasets": []}
    
    con.close()
    return {
        "period": period,
        "filter_type": filter_type,
        "labels": labels,
        "datasets": datasets
    }


@app.get("/api/history/compare")
async def history_compare(date1: str = "2025-11-29", date2: str = "2025-11-30") -> Dict[str, Any]:
    """Compare changes between two dates"""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    try:
        # Get data for both dates
        cur.execute("""
            SELECT username, mentor, tokens, hours, abps, followers, likes, tis, cos 
            FROM metrics_history WHERE date = ?
        """, (date1,))
        data1 = {r[0]: {"mentor": r[1], "tokens": r[2], "hours": r[3], "abps": r[4], 
                        "followers": r[5], "likes": r[6], "tis": r[7], "cos": r[8]} 
                 for r in cur.fetchall()}
        
        cur.execute("""
            SELECT username, mentor, tokens, hours, abps, followers, likes, tis, cos 
            FROM metrics_history WHERE date = ?
        """, (date2,))
        data2 = {r[0]: {"mentor": r[1], "tokens": r[2], "hours": r[3], "abps": r[4], 
                        "followers": r[5], "likes": r[6], "tis": r[7], "cos": r[8]} 
                 for r in cur.fetchall()}
        
        # Calculate changes
        changes = []
        all_users = set(data1.keys()) | set(data2.keys())
        
        for user in all_users:
            d1 = data1.get(user, {})
            d2 = data2.get(user, {})
            
            if d1 and d2:
                token_change = d2.get('tokens', 0) - d1.get('tokens', 0)
                abps_change = d2.get('abps', 0) - d1.get('abps', 0)
                changes.append({
                    "username": user,
                    "mentor": d2.get('mentor', d1.get('mentor', '')),
                    "token_change": token_change,
                    "abps_change": round(abps_change, 2),
                    "tokens_old": d1.get('tokens', 0),
                    "tokens_new": d2.get('tokens', 0),
                    "abps_old": round(d1.get('abps', 0), 2),
                    "abps_new": round(d2.get('abps', 0), 2),
                })
        
        # Sort by token change
        changes.sort(key=lambda x: x['token_change'], reverse=True)
        
        # Summary stats
        total_token_change = sum(c['token_change'] for c in changes)
        avg_abps_change = sum(c['abps_change'] for c in changes) / len(changes) if changes else 0
        
    except Exception as e:
        con.close()
        return {"error": str(e), "dates": [], "changes": [], "summary": {}}
    
    con.close()
    return {
        "date1": date1,
        "date2": date2,
        "total_users": len(changes),
        "summary": {
            "total_token_change": total_token_change,
            "avg_abps_change": round(avg_abps_change, 2),
            "top_gainers": changes[:10],
            "top_losers": changes[-10:][::-1] if len(changes) >= 10 else [],
        },
        "changes": changes[:100],  # First 100 records
    }


@app.get("/api/history/trend")
async def history_trend(username: str | None = None, mentor: str | None = None) -> Dict[str, Any]:
    """Trend over time for specific user or mentor"""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    
    try:
        if username:
            cur.execute("""
                SELECT date, tokens, hours, abps, tis, cos 
                FROM metrics_history WHERE username = ? ORDER BY date
            """, (username,))
        elif mentor:
            cur.execute("""
                SELECT date, SUM(tokens), SUM(hours), AVG(abps), AVG(tis), AVG(cos) 
                FROM metrics_history WHERE mentor = ? GROUP BY date ORDER BY date
            """, (mentor,))
        else:
            cur.execute("""
                SELECT date, SUM(tokens), SUM(hours), AVG(abps), AVG(tis), AVG(cos) 
                FROM metrics_history GROUP BY date ORDER BY date
            """)
        
        rows = cur.fetchall()
        trend = [
            {"date": r[0], "tokens": r[1], "hours": r[2], "abps": round(r[3], 2), 
             "tis": round(r[4], 2), "cos": round(r[5], 2)}
            for r in rows
        ]
    except Exception as e:
        con.close()
        return {"error": str(e), "trend": []}
    
    con.close()
    return {
        "username": username,
        "mentor": mentor,
        "trend": trend
    }

