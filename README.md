# 🎯 LivePerformance Analytics Portal

> **A comprehensive TikTok streamer performance analytics and management platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.5-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📋 Overview

**LivePerformance Analytics Portal** is a powerful analytics platform designed for TikTok content creators, influencer managers, and marketing agencies. It provides real-time performance tracking, AI-powered insights, and comprehensive metrics to optimize streaming strategies and maximize revenue.

### 🎨 Key Features

#### 📊 **Supervisor Dashboard**
- **Multi-level Analytics:** Track performance across agencies, teams, and individual creators
- **Real-time Metrics:** Monitor tokens earned, streaming hours, follower growth, and engagement
- **Performance Heatmaps:** Visualize top and bottom performers at a glance
- **Team Comparisons:** Compare metrics across different groups and mentors
- **Historical Trends:** 7-day, 30-day, and custom date range analytics

#### 👤 **Influencer Portal**
- **Personal Performance Card:** FIFA-style creator profile with overall rating (OVR)
- **AI Coach Recommendations:** Smart suggestions based on performance patterns
- **Archetype Classification:** Automated profiling (Sniper, Grinder, Rising Star, Unicorn)
- **Skill Radar Chart:** Visual representation of Revenue Velocity, Hype Factor, and Stream Stamina
- **Trend Analysis:** Track personal growth and identify optimization opportunities

#### 🔐 **Advanced Features**
- **Role-based Access Control:** Supervisor, Mentor, and Influencer roles
- **Multi-language Support:** English and Turkish localization
- **Data Import/Export:** CSV upload and download capabilities
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile
- **Dark Theme UI:** Modern, eye-friendly interface with purple/teal accent colors

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+**
- **Node.js 16+** and npm
- **SQLite3** (included with Python)

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/LivePerformance-Analytics-Portal-demo.git
cd LivePerformance-Analytics-Portal-demo
```

#### 2️⃣ Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Initialize the database with sample data
python load_real_data.py

# Start the FastAPI backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at `http://localhost:8001`

#### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 🏗️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for Python
- **[Pandas](https://pandas.pydata.org/)** - Data manipulation and analysis
- **[SQLite](https://www.sqlite.org/)** - Lightweight database engine
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server implementation

### Frontend
- **[React](https://reactjs.org/)** - UI component library
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[Chart.js](https://www.chartjs.org/)** - Interactive data visualizations
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Data Processing
- **Custom Algorithms:** 
  - **ABPS** (Revenue Velocity) - Tokens earned per streaming hour
  - **TIS** (Hype Factor) - Engagement quality metric
  - **COS** (Stream Stamina) - Consistency and sustainability score

---

## 📁 Project Structure

```
LivePerformance-Analytics-Portal-demo/
├── app/
│   └── main.py                 # FastAPI backend application
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page-level components
│   │   ├── translations/       # i18n language files
│   │   ├── context/            # React context providers
│   │   └── api.js              # API configuration
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
├── docs/
│   ├── architecture.md         # System architecture
│   ├── product-brief.md        # Product specifications
│   └── roles-and-permissions.md # Access control documentation
├── generate_historical.py      # Historical data generator
├── load_real_data.py           # Database initialization script
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Backend Configuration
VITE_API_BASE=http://localhost:8001

# Admin Credentials (Change these in production!)
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_PHONE=+1234567890

# Supervisor Account
SUPERSTAR_ADMIN_EMAIL=supervisor@example.com
SUPERSTAR_ADMIN_PASSWORD=your-secure-password

# Database
DB_PATH=./data.db
```

⚠️ **Security Note:** Never commit `.env` files to version control. Use strong passwords in production.

---

## 📊 Key Metrics Explained

### Revenue Velocity (RV)
- **Formula:** Tokens earned per hour of streaming
- **Purpose:** Measures earning efficiency
- **Target:** Higher RV indicates better monetization

### Hype Factor (HF)
- **Formula:** Likes per follower ratio
- **Purpose:** Measures audience engagement quality
- **Target:** Higher HF indicates more passionate fanbase

### Stream Stamina (SS)
- **Formula:** Consistency score based on streaming frequency
- **Purpose:** Measures sustainability and reliability
- **Target:** Higher SS indicates better work discipline

### Creator OVR (Overall Rating)
- **Formula:** Weighted average of RV, HF, and SS
- **Purpose:** Single-number talent assessment (0-100)
- **Target:** 90+ = Elite, 70-89 = Professional, 50-69 = Developing

---

## 👥 Creator Archetypes

The platform automatically classifies creators into strategic archetypes:

| Archetype | Description | Characteristics |
|-----------|-------------|-----------------|
| 🎯 **The Sniper** | High earner, low volume | High RV, Low SS |
| 🛡️ **The Grinder** | Consistent workhorse | Low RV, High SS |
| ✨ **The Rising Star** | High engagement, growing | High HF, Improving metrics |
| 🦄 **The Unicorn** | Elite all-around | High RV, HF, and SS |

---

## 🎮 Usage Guide

### For Supervisors
1. **Dashboard:** View agency-wide performance metrics
2. **Veriler (Data):** Dive into team-level analytics
3. **Influencers:** Browse and manage creator roster
4. **Settings:** Manage account and preferences

### For Influencers
1. **Portal:** View personalized performance dashboard
2. **Metrics:** Track your RV, HF, and SS scores
3. **AI Coach:** Get personalized improvement recommendations
4. **Trends:** Monitor your progress over time

### For Developers
1. **Dev Panel:** Override dashboard stats for testing
2. **User Management:** Create and manage test accounts
3. **Data Upload:** Import custom CSV datasets

---

## 📈 Data Import Format

To import custom data, use CSV files with these columns:

```csv
İçerik üreticisinin kullanıcı adı,Temsilci,Grup,Son 30 gündeki elmaslar,Son 30 gündeki CANLI Yayın süresi,Takipçiler,Beğeniler,Son 30 günde geçerli CANLI Yayın yapılan günler
@username,Mentor Name,Group A,50000,100,10000,50000,25
```

Or use English headers:
```csv
Username,Mentor,Group,Tokens,Hours,Followers,Likes,Live Days
@username,Mentor Name,Group A,50000,100,10000,50000,25
```

---

## 🔒 Security Best Practices

1. ✅ Change default admin credentials immediately
2. ✅ Use environment variables for sensitive configuration
3. ✅ Enable HTTPS in production environments
4. ✅ Implement rate limiting on API endpoints
5. ✅ Regular security audits and dependency updates
6. ✅ Use strong password hashing (bcrypt/argon2)
7. ✅ Implement proper authentication tokens (JWT)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 API Documentation

Once the backend is running, visit:
- **Interactive API Docs:** `http://localhost:8001/docs`
- **Alternative Docs:** `http://localhost:8001/redoc`

Key endpoints:
- `GET /api/metrics` - Fetch all creator metrics
- `GET /api/metrics/history` - Get historical data
- `GET /api/influencer/{username}` - Individual creator details
- `POST /api/upload` - Import CSV data
- `POST /api/login` - User authentication

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port is already in use
lsof -i :8001  # macOS/Linux
netstat -ano | findstr :8001  # Windows

# Try a different port
uvicorn app.main:app --port 8002
```

### Frontend can't connect to API
1. Verify backend is running at `http://localhost:8001`
2. Check CORS settings in `app/main.py`
3. Verify `VITE_API_BASE` in frontend `.env` file

### Database errors
```bash
# Reinitialize the database
rm data.db
python load_real_data.py
```

---

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/LivePerformance-Analytics-Portal-demo/issues)
- **Email:** [your-email@example.com](mailto:your-email@example.com)
- **Documentation:** [docs/](./docs/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- TikTok Creator Platform for inspiration
- FastAPI community for excellent documentation
- React ecosystem contributors
- All beta testers and early adopters

---

## 🗺️ Roadmap

- [ ] Real-time WebSocket updates
- [ ] Advanced AI predictions using ML models
- [ ] Multi-platform support (YouTube, Twitch)
- [ ] Mobile native applications (iOS/Android)
- [ ] Advanced team collaboration features
- [ ] Custom report generation
- [ ] API rate limiting and authentication
- [ ] Payment integration for premium features

---

<div align="center">

**Made with ❤️ for the Creator Economy**

⭐ Star this repo if you find it useful!

</div>
