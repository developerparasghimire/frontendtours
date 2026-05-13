from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch

from .models import EmailVerificationToken, Role, User


LOGIN_URL = "/api/v1/users/auth/login/"
REGISTER_URL = "/api/v1/users/auth/register/"
GOOGLE_AUTH_URL = "/api/v1/users/auth/google/"
PASSWORD = "StrongPass1!"


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def create_user(self, **kwargs):
        defaults = {
            "username": "customer",
            "email": "customer@example.com",
            "password": PASSWORD,
            "role": Role.CUSTOMER,
            "is_active": True,
            "is_email_verified": True,
        }
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)

    def login(self, email="customer@example.com", password=PASSWORD):
        return self.client.post(LOGIN_URL, {"email": email, "password": password}, format="json")

    def response_text(self, response):
        return response.content.decode("utf-8")

    def test_verified_customer_can_login_with_case_insensitive_email(self):
        self.create_user()

        response = self.login(email="  CUSTOMER@EXAMPLE.COM  ")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "customer@example.com")

    def test_wrong_password_returns_generic_error(self):
        self.create_user(is_email_verified=False)

        response = self.login(password="WrongPass1!")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Invalid email or password.", self.response_text(response))
        self.assertNotIn("verify your email", self.response_text(response).lower())

    def test_unverified_customer_gets_clear_verification_message(self):
        self.create_user(is_email_verified=False)

        response = self.login()

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Please verify your email before logging in.", self.response_text(response))

    def test_inactive_customer_gets_clear_inactive_message_after_verification(self):
        self.create_user(is_active=False, is_email_verified=True)

        response = self.login()

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("This account is inactive. Please contact support.", self.response_text(response))

    def test_admin_can_login_without_email_verification(self):
        self.create_user(
            username="admin",
            email="admin@example.com",
            role=Role.ADMIN,
            is_staff=True,
            is_email_verified=False,
        )

        response = self.login(email="admin@example.com")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_staff_customer_role_can_login_without_email_verification(self):
        self.create_user(
            username="staffcustomer",
            email="staffcustomer@example.com",
            role=Role.CUSTOMER,
            is_staff=True,
            is_superuser=True,
            is_email_verified=False,
        )

        response = self.login(email="staffcustomer@example.com")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_register_creates_inactive_unverified_user_and_token(self):
        response = self.client.post(
            REGISTER_URL,
            {
                "username": "newcustomer",
                "email": "NewCustomer@Example.COM",
                "password": PASSWORD,
                "password2": PASSWORD,
                "first_name": "New",
                "last_name": "Customer",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="newcustomer@example.com")
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_email_verified)
        self.assertTrue(EmailVerificationToken.objects.filter(user=user, is_used=False).exists())

    def test_register_rejects_duplicate_email_case_insensitive(self):
        self.create_user(email="duplicate@example.com", username="duplicate")

        response = self.client.post(
            REGISTER_URL,
            {
                "username": "another",
                "email": "DUPLICATE@EXAMPLE.COM",
                "password": PASSWORD,
                "password2": PASSWORD,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("An account with this email already exists.", self.response_text(response))

    def test_register_requires_matching_password_confirmation_when_sent(self):
        response = self.client.post(
            REGISTER_URL,
            {
                "username": "newcustomer",
                "email": "newcustomer@example.com",
                "password": PASSWORD,
                "password2": "DifferentPass1!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Passwords do not match.", self.response_text(response))

    @override_settings(GOOGLE_OAUTH_CLIENT_IDS=["google-client-id"])
    @patch("apps.users.views.verify_google_oauth_token")
    def test_google_auth_creates_verified_customer_account(self, verify_google_oauth_token_mock):
        verify_google_oauth_token_mock.return_value = {
            "email": "googleuser@example.com",
            "email_verified": True,
            "given_name": "Google",
            "family_name": "User",
            "aud": "google-client-id",
            "iss": "https://accounts.google.com",
        }

        response = self.client.post(GOOGLE_AUTH_URL, {"credential": "mock-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["created"])
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        user = User.objects.get(email="googleuser@example.com")
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_email_verified)
        self.assertFalse(user.has_usable_password())
        self.assertEqual(user.first_name, "Google")
        self.assertEqual(user.last_name, "User")

    @override_settings(GOOGLE_OAUTH_CLIENT_IDS=["google-client-id"])
    @patch("apps.users.views.verify_google_oauth_token")
    def test_google_auth_activates_existing_unverified_customer(self, verify_google_oauth_token_mock):
        user = self.create_user(
            email="existinggoogle@example.com",
            username="existinggoogle",
            is_active=False,
            is_email_verified=False,
        )

        verify_google_oauth_token_mock.return_value = {
            "email": user.email,
            "email_verified": True,
            "given_name": "Existing",
            "family_name": "Customer",
            "aud": "google-client-id",
            "iss": "https://accounts.google.com",
        }

        response = self.client.post(GOOGLE_AUTH_URL, {"credential": "mock-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["created"])

        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_email_verified)
        self.assertEqual(user.first_name, "Existing")
        self.assertEqual(user.last_name, "Customer")

    @override_settings(GOOGLE_OAUTH_CLIENT_IDS=["google-client-id"])
    @patch("apps.users.views.verify_google_oauth_token")
    def test_google_auth_rejects_unverified_google_email(self, verify_google_oauth_token_mock):
        verify_google_oauth_token_mock.side_effect = ValueError("Your Google account must have a verified email address.")

        response = self.client.post(GOOGLE_AUTH_URL, {"credential": "mock-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("verified email address", self.response_text(response))
