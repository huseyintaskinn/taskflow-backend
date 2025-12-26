from typing import List, Optional

from django.contrib.auth import get_user_model
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from apps.users.models import Role

User = get_user_model()


class UserService:
    """
    User domain'ine ait tüm business logic bu class altında toplanır.
    View katmanı bu servisi çağırır, direkt ORM işlemi yapmaz.
    """

    @staticmethod
    @transaction.atomic
    def create_user(
        email: str,
        password: str,
        roles: Optional[List[str]] = None,
        is_staff: bool = False,
        is_superuser: bool = False,
    ) -> User:
        """
        Yeni bir kullanıcı oluşturur ve varsa rollerini atar.
        """

        user = User.objects.create_user(
            email=email,
            password=password,
        )

        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.save(update_fields=["is_staff", "is_superuser"])

        if roles:
            UserService.assign_roles(user=user, roles=roles)

        return user

    @staticmethod
    @transaction.atomic
    def assign_roles(user: User, roles: List[str]) -> User:
        """
        Kullanıcıya rol/roller atar.
        Var olmayan roller sessizce yok sayılmaz, bilinçli filtrelenir.
        """

        role_qs = Role.objects.filter(name__in=roles)

        if not role_qs.exists():
            raise ValueError("Geçerli bir rol bulunamadı.")

        user.roles.set(role_qs)
        return user

    @staticmethod
    def get_user_by_email(email: str) -> User:
        """
        Email üzerinden kullanıcıyı getirir.
        """

        try:
            return User.objects.get(email=email)
        except ObjectDoesNotExist:
            raise ValueError("Kullanıcı bulunamadı.")

    @staticmethod
    def has_role(user: User, role_name: str) -> bool:
        """
        Kullanıcının belirli bir role sahip olup olmadığını kontrol eder.
        """

        return user.roles.filter(name=role_name).exists()

    @staticmethod
    def list_user_roles(user: User) -> List[str]:
        """
        Kullanıcının sahip olduğu rollerin isimlerini döner.
        """

        return list(user.roles.values_list("name", flat=True))
