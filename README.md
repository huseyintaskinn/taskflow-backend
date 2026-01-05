# TaskFlow Backend

TaskFlow, ekipler için görev (task) yönetimini hedefleyen, ölçeklenebilir ve güvenli bir backend servisidir.  
Proje; modern Django ekosistemi, JWT tabanlı kimlik doğrulama ve Redis destekli oturum/token yönetimi üzerine inşa edilmiştir.

## 🚀 Özellikler

- Django + Django REST Framework tabanlı REST API
- JWT (SimpleJWT) ile kimlik doğrulama
- Redis destekli token blacklist / logout mekanizması
- Role-based yetkilendirme (Admin / User)
- Swagger (OpenAPI) dokümantasyonu
- Modüler ve genişletilebilir proje mimarisi
- Task & Project domain yapısına uygun modelleme

---

## 🧱 Mimari Yaklaşım

- **Config-based settings** (environment ayrımı)
- **App-based modüler yapı**
- Authentication & authorization katmanı ayrıştırılmıştır
- Redis, sadece cache değil güvenlik akışının bir parçası olarak kullanılır
- API-first yaklaşım (frontend bağımsız)

---

## 🗂️ Proje Yapısı (Özet)

taskflow-backend/  
│  
├── apps/  
│ ├── users/ # Kullanıcı, admin ve auth işlemleri  
│ ├── tasks/ # Task domain yapısı  
│ └── projects/ # Project domain yapısı  
│  
├── core/  
│ ├── auth/ # Custom JWT & blacklist logic  
│ └── middleware/ # Global request/response kontrolleri  
│  
├── config/  
│ ├── settings/ # Base / local / prod ayarları  
│ └── urls.py  
│  
├── .env.example  
└── manage.py  


---

## 🔐 Authentication Akışı

- Login → Access & Refresh token üretilir
- Protected endpoint’ler JWT ile korunur
- Logout:
  - Refresh token blacklist’e eklenir
  - Token kontrolü Redis + DB üzerinden yapılır
- Expired veya blacklist’teki token’lar otomatik olarak reddedilir

---

## 📦 Kullanılan Teknolojiler

- Python 3.10+
- Django 5.x
- Django REST Framework
- SimpleJWT
- Redis
- drf-spectacular (Swagger / OpenAPI)
- Docker (Redis için)

---

## ⚙️ Kurulum

### 1. Ortam Değişkenleri

cp .env.example .env

### 2. Sanal Ortam & Bağımlılıklar
python -m venv .venv  
source .venv/bin/activate  # Windows: .venv\Scripts\activate  
pip install -r requirements.txt  

### 3. Redis
docker run -d --name taskflow-redis -p 6379:6379 redis:7

### 4. Migration & Server
python manage.py migrate  
python manage.py runserver  

### 📘 API Dokümantasyonu

### Swagger UI:

http://127.0.0.1:8000/api/docs/
