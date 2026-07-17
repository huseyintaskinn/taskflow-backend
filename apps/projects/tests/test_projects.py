from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.users.models import User, Role
from apps.projects.models import Project

class ProjectAPITests(APITestCase):
    def setUp(self):
        # Create Roles
        self.admin_role = Role.objects.create(name="ADMIN", description="Admin Role")
        self.manager_role = Role.objects.create(name="MANAGER", description="Manager Role")
        self.user_role = Role.objects.create(name="USER", description="User Role")

        # Create Users
        self.admin_user = User.objects.create_user(email="admin@baykar.com", password="testpassword")
        self.admin_user.roles.add(self.admin_role)

        self.user1 = User.objects.create_user(email="user1@baykar.com", password="testpassword")
        self.user1.roles.add(self.manager_role) # Assign Manager role so user1 can create projects

        self.user2 = User.objects.create_user(email="user2@baykar.com", password="testpassword")
        self.user2.roles.add(self.user_role)

        # Create Projects
        self.project1 = Project.objects.create(name="Project 1", owner=self.user1)
        self.project1.members.add(self.user2)

        self.project2 = Project.objects.create(name="Project 2", owner=self.user2)

        # URLs
        self.list_url = reverse("project-list")

    def get_jwt_token(self, email):
        login_url = reverse("token_obtain_pair")
        res = self.client.post(login_url, {"email": email, "password": "testpassword"}, format="json")
        return res.data["access"]

    def test_list_projects_user_permissions(self):
        """
        Verify users only see projects they own or belong to as members.
        """
        token = self.get_jwt_token("user1@baykar.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # User 1 should only see Project 1 (owned by user1, user2 is member)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Project 1")

    def test_list_projects_admin_permissions(self):
        """
        Verify admin can see all projects in the system.
        """
        token = self.get_jwt_token("admin@baykar.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Admin should see both Project 1 and Project 2
        self.assertEqual(response.data["count"], 2)

    def test_create_project_auto_assigns_owner(self):
        """
        Verify that creating a project sets the active user as the owner.
        """
        token = self.get_jwt_token("user1@baykar.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        payload = {"name": "New Project", "description": "New Project Desc"}
        response = self.client.post(self.list_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_project = Project.objects.get(name="New Project")
        self.assertEqual(new_project.owner, self.user1)

    def test_non_manager_cannot_create_project(self):
        """
        Verify that a regular user without MANAGER/ADMIN roles cannot create a project.
        """
        token = self.get_jwt_token("user2@baykar.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        payload = {"name": "Unauthorized Project"}
        response = self.client.post(self.list_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
