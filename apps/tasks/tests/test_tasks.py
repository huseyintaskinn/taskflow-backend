from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.users.models import User, Role
from apps.projects.models import Project
from apps.tasks.models import Task

class TaskAPITests(APITestCase):
    def setUp(self):
        # Create Roles
        self.admin_role = Role.objects.create(name="ADMIN", description="Admin Role")
        self.user_role = Role.objects.create(name="USER", description="User Role")

        # Create Users
        self.admin_user = User.objects.create_user(email="admin@baykar.com", password="testpassword")
        self.admin_user.roles.add(self.admin_role)

        self.user1 = User.objects.create_user(email="user1@baykar.com", password="testpassword")
        self.user1.roles.add(self.user_role)

        self.user2 = User.objects.create_user(email="user2@baykar.com", password="testpassword")
        self.user2.roles.add(self.user_role)

        self.user_outside = User.objects.create_user(email="outside@baykar.com", password="testpassword")
        self.user_outside.roles.add(self.user_role)

        # Create Project
        self.project = Project.objects.create(name="Collaborative Project", owner=self.user1)
        self.project.members.add(self.user2)

        # URLs
        self.list_url = reverse("task-list")

    def get_jwt_token(self, email):
        login_url = reverse("token_obtain_pair")
        res = self.client.post(login_url, {"email": email, "password": "testpassword"}, format="json")
        return res.data["access"]

    def test_assignee_must_be_project_member(self):
        """
        Verify that attempting to assign a task to a user who is not a project member
        throws a validation error.
        """
        token = self.get_jwt_token("user1@baykar.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        payload = {
            "project": self.project.id,
            "title": "Aerodynamic Test",
            "description": "Test descriptions",
            "assigned_to": self.user_outside.id,  # Not a project member
            "status": "TODO",
            "priority": "HIGH"
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("assigned_to", response.data)

    def test_assignee_can_be_project_member_or_owner(self):
        """
        Verify that assigning a task to a member of the project succeeds.
        """
        token = self.get_jwt_token("user1@baykar.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        payload = {
            "project": self.project.id,
            "title": "Aerodynamic Test Valid",
            "description": "Test descriptions",
            "assigned_to": self.user2.id,  # Project member
            "status": "TODO",
            "priority": "HIGH"
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.filter(title="Aerodynamic Test Valid").count(), 1)

    def test_add_comment_to_task(self):
        """
        Verify that adding a comment to a task succeeds.
        """
        token = self.get_jwt_token("user1@baykar.com")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        task = Task.objects.create(
            project=self.project,
            title="Task to Comment",
            status="TODO",
            priority="LOW"
        )
        url = reverse("task-detail", args=[task.id]) + "comments/"
        payload = {"content": "This is a test comment"}
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(task.comments.count(), 1)
        self.assertEqual(task.comments.first().content, "This is a test comment")

