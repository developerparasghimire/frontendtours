# Image Upload & Site Configuration Setup Guide

## Changes Made

### 1. **Updated Models**
   - **Tour & Event Models**: Changed `image_url` (URLField) → `image` (ImageField)
   - **New SiteConfig Model**: Created in `apps/common/models.py` to manage:
     - Site branding (logo, tagline, description)
     - Footer content and logo
     - Contact information
     - Social media URLs (Facebook, Twitter, Instagram, LinkedIn, YouTube, TikTok)
     - Additional links (Privacy Policy, Terms of Service)

### 2. **Updated Admin Interface**
   - Tours & Events: Added "Media" fieldset for image uploads
   - SiteConfig: Dedicated admin interface with organized sections
   - Only one SiteConfig instance allowed (auto-managed)
   - Deletion protection for SiteConfig

### 3. **Configuration Changes**
   - `settings.py`: Added `MEDIA_URL` and `MEDIA_ROOT` configuration
   - `urls.py`: Added media file serving for development
   - `requirements.txt`: Added `Pillow>=10.0` dependency

### 4. **Created .gitignore**: Excludes media files from version control

---

## Setup Steps

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

This installs **Pillow**, which is required for image handling.

### Step 2: Create Database Migrations
```bash
python3 manage.py makemigrations
```

This creates migration files for:
- Tours table (image field migration)
- Events table (image field migration)
- SiteConfig table (new model)

### Step 3: Apply Migrations
```bash
python3 manage.py migrate
```

This applies the migrations to your database.

### Step 4: Create Initial SiteConfig (Optional)
Run this script to create the SiteConfig instance:

```bash
python3 manage.py shell
```

Then in the Python shell:
```python
from apps.common.models import SiteConfig
SiteConfig.objects.create(
    site_name="Get Tours Nepal",
    site_tagline="Explore Nepal Like Never Before",
    footer_text="© 2024 Get Tours Nepal. All rights reserved.",
    phone="+977-1-4123456",
    email="info@gettours.com",
    address="Thamel, Kathmandu, Nepal",
    facebook_url="https://facebook.com/gettournepal",
    instagram_url="https://instagram.com/gettournepal",
)
exit()
```

---

## Using the Admin Panel

### Uploading Images for Tours/Events
1. Go to **Admin Dashboard** → **Tours** or **Events**
2. Click **Add Tour** or **Add Event**
3. In the **Media** section, click "Choose Image" to upload
4. Images are automatically saved to `/media/tours/` or `/media/events/`

### Managing Site Configuration
1. Go to **Admin Dashboard** → **Site Configuration**
2. Click the single instance to edit
3. Upload logos, footer images, and manage all social media links
4. Changes are immediately available to the frontend

---

## Frontend Integration

To access uploaded images and site settings from your Next.js frontend:

### For Tour/Event Images
```typescript
// Instead of selectedItem.image_url, use:
const imageUrl = `/media/${selectedItem.image}`;
```

### For Site Configuration
Create an API endpoint:

**backend/apps/common/views.py**
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SiteConfig

@api_view(['GET'])
def site_config(request):
    config = SiteConfig.objects.first()
    data = {
        'site_name': config.site_name,
        'logo': config.logo.url if config.logo else None,
        'footer_text': config.footer_text,
        'email': config.email,
        'phone': config.phone,
        'facebook_url': config.facebook_url,
        'instagram_url': config.instagram_url,
        # ... add other fields
    }
    return Response(data)
```

**backend/apps/common/urls.py**
```python
from django.urls import path
from .views import site_config

urlpatterns = [
    path('config/', site_config, name='site-config'),
]
```

Then add to **config/urls.py**:
```python
path('api/v1/common/', include('apps.common.urls')),
```

---

## File Structure

```
backend/
├── media/                    # ← New directory (will be created automatically)
│   ├── tours/               # Tour images
│   ├── events/              # Event images
│   └── site/                # Site branding images
├── apps/
│   ├── common/
│   │   ├── models.py        # ← Updated with SiteConfig
│   │   └── admin.py         # ← Updated with admin interface
│   ├── tours/
│   │   ├── models.py        # ← Changed image_url → image
│   │   └── admin.py         # ← Updated fieldsets
│   └── events/
│       ├── models.py        # ← Changed image_url → image
│       └── admin.py         # ← Updated fieldsets
└── config/
    ├── settings.py          # ← Added MEDIA_URL/MEDIA_ROOT
    └── urls.py              # ← Added media serving
```

---

## Troubleshooting

### Media files not showing?
- Ensure Django development server is running (`python3 manage.py runserver`)
- Check FILES app has uploaded images in `/media/` directory
- Verify `MEDIA_URL` and `MEDIA_ROOT` in settings.py

### Migration errors?
```bash
# Reset and redo migrations (if development only):
python3 manage.py migrate apps.tours zero
python3 manage.py migrate apps.events zero
python3 manage.py migrate apps.common zero
python3 manage.py makemigrations
python3 manage.py migrate
```

### Pillow installation issues?
If you're using a virtual environment, activate it first:
```bash
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate     # On Windows
pip install -r requirements.txt
```

---

## Benefits

✅ **Easy Admin Interface**: Upload images directly, no URLs needed  
✅ **Centralized Configuration**: Manage all site settings from one place  
✅ **Dynamic Content**: Update site branding, social links without code changes  
✅ **Production Ready**: Proper media file organization and handling  
✅ **SEO Friendly**: Site description and metadata in one place  
