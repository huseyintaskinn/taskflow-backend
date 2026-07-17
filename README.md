# TaskFlow - Kurumsal Görev Yönetim Sistemi

TaskFlow; ekipler için projeleri, görevleri ve iş süreçlerini kolaylaştırmak, rol bazlı yetkilendirmeyle güvenli şekilde yönetmek amacıyla geliştirilmiş kurumsal düzeyde bir web portalıdır. 

Proje; Django REST Framework (DRF) tabanlı güvenli bir API katmanı ve modern React + Tailwind CSS tabanlı bir tek sayfa uygulamasından (SPA) oluşmaktadır.

---

## 📸 Arayüz Ekran Görüntüleri

### 1. Giriş Ekranı
![Giriş Ekranı](docs/images/login.png)

### 2. Genel Durum & Metrikler (Dashboard)
![Dashboard Paneli](docs/images/dashboard.png)

### 3. Proje Yönetimi
![Proje Yönetimi](docs/images/projects.png)

### 4. Kanban Görev Tahtası
![Kanban Görev Tahtası](docs/images/kanban.png)

### 5. Swagger API Dokümantasyonu (Backend)
![Swagger API Dokümantasyonu](docs/images/swagger.png)

### 6. Django Yönetim (Admin) Paneli
![Django Yönetim Paneli](docs/images/admin.png)

---

## 🌟 Önemli Özellikler & Çözümler

- **Decoupled Architecture**: Django REST Framework (DRF) API backend ve React Vite frontend ayrık olarak kurgulanmıştır.
- **Roles claims in JWT**: Her API isteğinde izin doğrulaması için veritabanına atılan SQL sorguları, rollerin SimpleJWT payload claim'lerine gömülmesiyle tamamen sıfırlanmıştır.
- **Full CRUD Operations**: Projeler ve Görevler API'leri tam CRUD (`ModelViewSet`) işlemlerini desteklemektedir.
- **Görev Atama Kısıtlamaları**: Bir göreve çalışan atarken, bu çalışanın sadece o görevin ait olduğu projenin üyesi olması validation katmanında güvence altına alınmıştır.
- **Hata Toleranslı Redis Blacklist**: Redis sunucusunun çevrimdışı olması durumunda sistem çökmez; hata loglanarak JWT doğrulama akışı güvenli varsayılanlarla devam eder (SPOF engellenmiştir).
- **7/7 Unit Test Coverage**: JWT rolleri, token blacklist ve CRUD kısıtlamalarını kapsayan test suite mevcuttur.

---

## ⚙️ Teknolojiler

- **Backend**: Python 3.9+, Django 4.2+, Django REST Framework, SimpleJWT (OAuth2/JWT Auth), Django Filter, DRF-Spectacular (Swagger/OpenAPI).
- **Database**: PostgreSQL (Docker) / SQLite (Yerel).
- **Cache & Blacklist**: Redis.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **DevOps**: Docker, Docker Compose, Multi-stage Dockerfile.

---

## 🚀 Yerel Kurulum & Çalıştırma

### 1. Backend Kurulumu
Proje klasöründe terminal açın:
```bash
# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Veritabanını göçürün (Migrate)
python manage.py migrate

# Test verilerini ve rollerini oluşturun (Seed)
python manage.py seed_taskflow
```

### 2. Backend Sunucusunu Başlatma
```bash
python manage.py runserver
```
API sunucusu default olarak `http://127.0.0.1:8000` adresinde çalışacaktır.
- **API Dokümantasyonu (Swagger)**: `http://127.0.0.1:8000/swagger/` adresinden tüm endpoint'leri görüntüleyip test edebilirsiniz.

### 3. Frontend Kurulumu & Başlatma
Yeni bir terminalde `frontend` klasörüne geçin:
```bash
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev
```
Frontend default olarak `http://localhost:5173` adresinde çalışacaktır.

---

## 👥 Test Personel & Admin Bilgileri

Sistemde departmanlar için otomatik olarak oluşturulmuş hazır test kullanıcıları mevcuttur. 

**Yönetici (Admin) Giriş Bilgileri:**
*   **Kullanıcı Adı:** `admin@baykar.com`
*   **Şifre:** `adminpassword`

**Personel Giriş Bilgileri:**
*   **Şifre (Tümü İçin):** `testpassword`

| Kullanıcı E-postası | Rolü | Görev Yetkileri |
|---|---|---|
| `manager@baykar.com` | MANAGER | Proje ve Görev oluşturabilir/düzenleyebilir. |
| `user1@baykar.com` | USER | Kendisine atanan görevleri güncelleyebilir. |
| `user2@baykar.com` | USER | Kendisine atanan görevleri güncelleyebilir. |
| `user3@baykar.com` | USER | Kendisine atanan görevleri güncelleyebilir. |

---

## 🧪 Birim Testlerini Çalıştırma

Tüm unit testleri çalıştırmak için projenin kök dizininde:
```bash
python manage.py test
```

---

## 🐳 Docker ile Ayağa Kaldırma (Alternatif)

Kök dizindeki Docker Compose dosyası ile postgres, redis, django ve react sunucularını tek komutla çalıştırabilirsiniz:
```bash
docker-compose up --build
```
`docker-compose` otomatik olarak veritabanlarını oluşturur, migrations uygular ve default test personellerini sisteme yükler. Arayüze `http://localhost:5173` adresinden doğrudan erişebilirsiniz.
