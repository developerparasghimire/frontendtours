from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationToken, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "is_email_verified", "is_active", "is_staff", "date_joined")
    list_filter = ("role", "is_active", "is_staff", "is_email_verified")
    search_fields = ("email", "username", "first_name", "last_name")
    list_editable = ("role", "is_active")
    ordering = ("-date_joined",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Role & Verification", {"fields": ("role", "is_email_verified")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Role & Verification", {"fields": ("role", "is_email_verified")}),
    )


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "created_at", "is_used")
    list_filter = ("is_used",)
    search_fields = ("user__email",)
    readonly_fields = ("token", "created_at")


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "created_at", "is_used")
    list_filter = ("is_used",)
    search_fields = ("user__email",)
    readonly_fields = ("token", "created_at")
