from django.core.management.base import BaseCommand
from apps.users.models import User, Role
from apps.projects.models import Project
from apps.tasks.models import Task
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = 'Seeds TaskFlow database with default roles, users, projects, and tasks.'

    def handle(self, *args, **options):
        self.stdout.write("Database seeding started...")

        # 1. Create Roles
        roles_data = [
            ("ADMIN", "Sistem Yöneticisi - Tüm kaynaklara tam erişim."),
            ("MANAGER", "Proje Yöneticisi - Proje ve görev oluşturup atayabilir."),
            ("USER", "Ekip Üyesi - Kendisine atanan görevleri güncelleyebilir."),
        ]
        
        roles = {}
        for r_name, r_desc in roles_data:
            role, created = Role.objects.get_or_create(name=r_name, defaults={"description": r_desc})
            roles[r_name] = role
            if created:
                self.stdout.write(f"Rol oluşturuldu: {r_name}")

        # 2. Create Users
        users_data = [
            ("admin@baykar.com", "adminpassword", "Ahmet", "Admin", "ADMIN", True),
            ("manager@baykar.com", "testpassword", "Kemal", "Yönetici", "MANAGER", True),
            ("user1@baykar.com", "testpassword", "Hüseyin", "Yazılımcı", "USER", False),
            ("user2@baykar.com", "testpassword", "Ayşe", "Tasarımcı", "USER", False),
            ("user3@baykar.com", "testpassword", "Mehmet", "Testçi", "USER", False),
        ]

        users = {}
        for email, password, f_name, l_name, role_name, is_staff in users_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": f_name,
                    "last_name": l_name,
                    "is_staff": is_staff,
                    "is_superuser": (role_name == "ADMIN")
                }
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(f"Kullanıcı oluşturuldu: {email}")
            
            # Associate role
            user.roles.add(roles[role_name])
            users[email] = user

        # 3. Create Projects
        projects_data = [
            ("Baykar İHA Geliştirme Projesi", "TB3 ve Akıncı insansız hava araçlarının görev takip sistemi.", "manager@baykar.com", ["user1@baykar.com", "user2@baykar.com"]),
            ("Yapay Zeka Ar-Ge Çalışması", "Otonom uçuş algoritmaları ve görüntü işleme Ar-Ge modülleri.", "admin@baykar.com", ["user2@baykar.com", "user3@baykar.com"]),
        ]

        projects = {}
        for name, desc, owner_email, member_emails in projects_data:
            project, created = Project.objects.get_or_create(
                name=name,
                defaults={
                    "description": desc,
                    "owner": users[owner_email]
                }
            )
            if created:
                self.stdout.write(f"Proje oluşturuldu: {name}")
            
            # Add members
            for m_email in member_emails:
                project.members.add(users[m_email])
            
            projects[name] = project

        # 4. Create Tasks
        tasks_data = [
            ("TB3 Kanat Aerodinamik Tasarımı", "Kanat profillerinin CFD analizlerinin tamamlanması.", "Baykar İHA Geliştirme Projesi", "user1@baykar.com", Task.Status.TODO, Task.Priority.HIGH),
            ("Gövde Kompozit Malzeme Seçimi", "Akıncı gövdesi için mukavemet hesapları ve malzeme listesi.", "Baykar İHA Geliştirme Projesi", "user2@baykar.com", Task.Status.IN_PROGRESS, Task.Priority.MEDIUM),
            ("Yapay Zeka Görüntü İşleme Modülü", "Kamera beslemesinden hedef tespit eden derin öğrenme kodu.", "Yapay Zeka Ar-Ge Çalışması", "user3@baykar.com", Task.Status.IN_REVIEW, Task.Priority.HIGH),
            ("Test ve Kalifikasyon Dokümantasyonu", "Uçuş öncesi test prosedürlerinin yazılması.", "Baykar İHA Geliştirme Projesi", "user2@baykar.com", Task.Status.DONE, Task.Priority.LOW),
        ]

        for title, desc, proj_name, assignee_email, status, priority in tasks_data:
            task, created = Task.objects.get_or_create(
                title=title,
                project=projects[proj_name],
                defaults={
                    "description": desc,
                    "assigned_to": users[assignee_email],
                    "status": status,
                    "priority": priority,
                    "due_date": timezone.now().date() + datetime.timedelta(days=10)
                }
            )
            if created:
                self.stdout.write(f"Görev oluşturuldu: {title}")

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
