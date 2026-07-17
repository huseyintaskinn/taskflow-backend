# TaskFlow - Kurumsal Görev Yönetim Sistemi

TaskFlow; ekipler için projeleri, görevleri ve iş süreçlerini kolaylaştırmak, rol bazlı yetkilendirmeyle güvenli şekilde yönetmek amacıyla geliştirilmiş kurumsal düzeyde bir iş yönetim portalıdır.

Proje; Django REST Framework (DRF) tabanlı güvenli bir API katmanı ve modern, dikey menülü (SaaS stili) React + Tailwind CSS tabanlı bir tek sayfa uygulamasından (SPA) oluşmaktadır.

---

## 📸 Arayüz Ekran Görüntüleri

### 1. Giriş Ekranı
<img width="415" height="400" alt="image" src="https://github.com/user-attachments/assets/b1ed6fc1-2dd0-4403-8175-efb012381ac6" />

### 2. Genel Durum & Metrikler (Dashboard)
<img width="815" height="450" alt="image" src="https://github.com/user-attachments/assets/4801d4e8-def6-4da8-8db2-16ac5300cb03" />

### 3. Proje Detay Sayfası & Ekip Yönetimi
<img width="815" height="450" alt="image" src="https://github.com/user-attachments/assets/074f7f34-36fe-4f39-b9fe-0f1e899fba36" />

### 4. Kanban Görev Tahtası
<img width="815" height="300" alt="image" src="https://github.com/user-attachments/assets/c8b2cf4f-57b0-42c2-9106-0785535484d4" />

### 5. Sağdan Kayan Görev Detay Paneli & Yorumlar
<img width="415" height="315" alt="image" src="https://github.com/user-attachments/assets/6bd21941-98d2-492c-a476-8fda6bc19ff4" />

### 6. Swagger API Dokümantasyonu (Backend)
<img width="815" height="1000" alt="127 0 0 1_8000_api_docs_" src="https://github.com/user-attachments/assets/c94561b9-0c37-471d-a9da-34b8780f9033" />

---

## 🌟 Önemli Özellikler & Çözümler

- **SaaS Stili Sol Menü Tasarımı**: Jira/Linear benzeri dikey kenar çubuğu (Sidebar Navigation) düzenine sahiptir. Ekip üyelerini ve sekmeleri (Dashboard, Projeler, Görev Tahtası) tek bir noktadan yönetir.
- **Kapsamlı Proje Detay Sayfası**: Projeye atanmış ekip üyelerinin e-postalarını listeler ve yöneticilere projeye yeni üyeler atayabilme/çıkarabilme imkanı sunar.
- **Rol Bazlı İzin Koruması & Yetkilendirme**:
  *   Proje oluşturma yetkisi sadece `ADMIN` ve `MANAGER` yetkilerine ait olup regular `USER` rolünden tamamen kısıtlanmıştır.
  *   Görev kapatma (DONE) yetkisi sadece göreve atanan personele veya yöneticilere aittir.
- **Çift Yönlü Aşama Geçişleri (Status Rollback)**: Tamamlanan görevler, yanlışlık payına karşı detay panelindeki veya tahtadaki "Geri Al" butonuyla önceki aşamalara (Yapılacak, Devam Eden, İnceleme) geri çekilebilir.
- **Jira Stili Sağ Görev Detay Paneli (Side Drawer)**: Göreve tıklandığında sağdan kayarak açılır. Görevin detaylarını, teslim tarihlerini gösterir ve ekip üyelerinin göreve yorum/kapatma notu yazmasını sağlar.
- **Roles claims in JWT**: Her API isteğinde izin doğrulaması için veritabanına atılan SQL sorguları, rollerin SimpleJWT payload claim'lerine gömülmesiyle tamamen sıfırlanmıştır.
- **9/9 Unit Test Coverage**: JWT rolleri, token blacklist ve CRUD kısıtlamalarını kapsayan test suite mevcuttur.

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
- **API Dokümantasyonu (Swagger)**: `http://127.0.0.1:8000/api/docs/` adresinden tüm endpoint'leri görüntüleyip test edebilirsiniz.

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
| `manager@baykar.com` | MANAGER | Proje ve Görev oluşturabilir/düzenleyebilir, ekip ataması yapabilir. |
| `user1@baykar.com` | USER | Kendisine atanan görevleri güncelleyebilir, kapatabilir. |
| `user2@baykar.com` | USER | Kendisine atanan görevleri güncelleyebilir, kapatabilir. |
| `user3@baykar.com` | USER | Kendisine atanan görevleri güncelleyebilir, kapatabilir. |

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
