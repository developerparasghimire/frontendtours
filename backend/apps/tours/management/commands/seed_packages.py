"""
Management command to seed / update the EBC and Mardi Himal tour packages.
Usage:  python manage.py seed_packages
"""

from django.core.management.base import BaseCommand
from apps.tours.models import Tour


EBC_LONG_DESCRIPTION = """<p>The Everest Base Camp Trek is one of the most iconic and inspiring adventures in the world. This legendary journey takes you into the heart of the Khumbu region, leading to the base of Mount Everest (8,848.86m), the highest peak on Earth. Walking through dramatic valleys, ancient Sherpa villages, and high-altitude landscapes, every step brings you closer to the roof of the world.</p>

<p>The adventure begins with a thrilling mountain flight to Lukla, home to the famous Tenzing-Hillary Airport. From there, the trail follows the Dudh Koshi River, passing suspension bridges draped in prayer flags and entering the protected wilderness of Sagarmatha National Park. Along the way, you experience the vibrant Sherpa culture, visit the spiritual hub of Namche Bazaar, and explore ancient monasteries surrounded by towering Himalayan peaks.</p>

<p>As you ascend higher, the scenery becomes increasingly dramatic — glaciers, icefalls, and panoramic views of Everest, Lhotse, Nuptse, and Ama Dablam dominate the skyline. Reaching Everest Base Camp is a moment of pride and achievement, standing beneath the mighty Himalayas. The sunrise view from Kala Patthar offers one of the most breathtaking mountain panoramas in the world.</p>

<p>The Everest Base Camp Trek is not just a trek — it is a life-changing Himalayan experience combining adventure, culture, natural beauty, and personal accomplishment.</p>

<h2>Day-by-Day Itinerary</h2>

<h3>Day 01: Fly to Lukla (2,840m) &amp; Trek to Phakding (2,651m)</h3>
<p><strong>30 min flight | 3–4 hrs trek</strong></p>
<p>An early morning scenic flight takes you to Lukla, the gateway to the Everest region. Upon arrival, you meet your trekking crew and begin your journey along a gently descending trail toward Phakding. Along the way, enjoy views of sacred Mount Khumbila and pass through charming Sherpa villages and prayer-flag-lined suspension bridges.</p>

<h3>Day 02: Phakding to Namche Bazaar (3,438m)</h3>
<p><strong>5–6 hrs trek</strong></p>
<p>Following the Dudh Koshi River, the trail winds through pine forests and traditional villages before entering the protected wilderness of Sagarmatha National Park. After crossing several suspension bridges, including the famous Hillary Bridge, a steep ascent leads you to the vibrant mountain town of Namche Bazaar — the heart of the Khumbu region.</p>

<h3>Day 03: Acclimatization Day in Namche Bazaar (3,440m)</h3>
<p>A rest day essential for altitude adjustment. Explore Namche's lively market, cafés, and museums, or hike to Everest View Point for your first glimpse of Mount Everest along with Lhotse, Nuptse, and Ama Dablam. You may also visit Khumjung village and the Hillary School.</p>

<h3>Day 04: Namche Bazaar to Tengboche (3,870m)</h3>
<p><strong>5–6 hrs trek</strong></p>
<p>A scenic trail with spectacular Himalayan views leads to Tengboche, home to the region's most important monastery — Tengboche Monastery. Surrounded by towering peaks, the monastery offers breathtaking panoramic views and the opportunity to witness a serene Buddhist prayer ceremony.</p>

<h3>Day 05: Tengboche to Dingboche (4,360m)</h3>
<p><strong>5–6 hrs trek</strong></p>
<p>Descending through rhododendron forests, you cross the Imja River and pass Pangboche village. As the landscape opens into the Imja Valley, dramatic Himalayan scenery unfolds. Dingboche, surrounded by stone-walled fields and grazing yaks, offers stunning alpine views.</p>

<h3>Day 06: Dingboche to Lobuche (4,940m)</h3>
<p><strong>4–6 hrs trek</strong></p>
<p>The trail climbs gradually along the Khumbu Glacier's moraine. At Chupki Lhara, memorials honor climbers who lost their lives on Everest. Towering peaks including Pumori and Nuptse dominate the skyline as you reach Lobuche.</p>

<h3>Day 07: Lobuche to Gorak Shep (5,170m) &amp; Visit Everest Base Camp (5,364m)</h3>
<p><strong>6–7 hrs trek</strong></p>
<p>Today is one of the most anticipated days. Trek across glacial terrain to Gorak Shep before continuing to Everest Base Camp. Standing at the foot of Mount Everest, surrounded by the Khumbu Icefall and towering Himalayan giants, is a truly emotional and unforgettable achievement. Return to Gorak Shep for the night.</p>

<h3>Day 08: Hike to Kala Patthar (5,545m) &amp; Trek to Pheriche (4,288m)</h3>
<p><strong>7–8 hrs trek</strong></p>
<p>An early morning ascent to Kala Patthar rewards you with the most spectacular sunrise view over Everest and surrounding peaks. After soaking in the panorama, descend via Gorak Shep and continue down to Pheriche.</p>

<h3>Day 09: Pheriche to Tengboche (3,870m)</h3>
<p><strong>3–4 hrs trek</strong></p>
<p>Retrace your steps through alpine meadows and mountain landscapes back to Tengboche, enjoying magnificent views along the way.</p>

<h3>Day 10: Tengboche to Namche Bazaar (3,440m)</h3>
<p><strong>3–4 hrs trek</strong></p>
<p>Descend through forests of pine and rhododendron, crossing suspension bridges and passing charming settlements before returning to Namche Bazaar.</p>

<h3>Day 11: Namche Bazaar to Lukla (2,840m)</h3>
<p><strong>7–8 hrs trek</strong></p>
<p>A long but rewarding final trekking day along the Dudh Koshi River brings you back to Lukla. Celebrate the completion of your Everest journey with your trekking team.</p>

<h3>Day 12: Fly Back to Kathmandu</h3>
<p>An early morning flight returns you to Kathmandu, concluding your incredible Everest Base Camp adventure.</p>"""


EBC_HIGHLIGHTS = [
    "Trek to the legendary Everest Base Camp (5,364m)",
    "Breathtaking sunrise panorama from Kala Patthar (5,545m)",
    "Scenic mountain flight to Lukla via Tenzing-Hillary Airport",
    "Explore Namche Bazaar — the vibrant capital of the Khumbu region",
    "Visit the iconic Tengboche Monastery amid towering Himalayan peaks",
    "Walk through Sagarmatha National Park — a UNESCO World Heritage Site",
    "Panoramic views of Everest, Lhotse, Nuptse, and Ama Dablam",
    "Immerse yourself in authentic Sherpa culture and high-altitude villages",
    "Cross dramatic suspension bridges draped in colourful prayer flags",
]


EBC_INCLUDES = [
    "Airport pick-up and drop-off by private vehicle",
    "Domestic round-trip flight: Kathmandu – Lukla – Kathmandu",
    "Kathmandu hotel accommodation with breakfast (as per itinerary)",
    "Sagarmatha National Park entry permit",
    "Khumbu Pasang Lhamu Rural Municipality permit",
    "Government-licensed, experienced English-speaking trekking guide",
    "Required number of porters (1 porter for 2 trekkers)",
    "Guide and porter salary, insurance, meals, accommodation, and equipment",
    "Teahouse/lodge accommodation during the trek (twin-sharing basis)",
    "Three meals a day during the trek (Breakfast, Lunch, Dinner)",
    "Seasonal fresh fruits after dinner (as available)",
    "First aid medical kit carried by the guide",
    "Trek completion certificate",
    "All government taxes and service charges",
]


MARDI_LONG_DESCRIPTION = """<p>Nestled in the Annapurna region of Nepal, the Mardi Himal Trek is a hidden gem that combines serene landscapes, charming villages, and panoramic mountain views. This moderate trek takes you through lush rhododendron forests, terraced farmlands, and peaceful alpine meadows, offering a refreshing escape from the bustle of city life. From the very first step, trekkers are treated to stunning vistas of the Annapurna range and the iconic Machhapuchhre (Fishtail) peak.</p>

<p>The journey gradually ascends through quiet villages and open ridges, allowing you to immerse yourself in the culture of local Gurung and Magar communities. Along the way, the trail reveals breathtaking viewpoints, including the Mardi Himal Base Camp and High Camp, where the Himalayas rise dramatically around you. Every step offers a new perspective, from sparkling waterfalls to glacial streams, making the trek both invigorating and visually spectacular.</p>

<p>Perfect for those seeking adventure without the crowds, this trek also provides the flexibility of optional excursions and moderate daily distances. Whether witnessing the sunrise over Annapurna South, exploring quiet villages, or enjoying the serene solitude of alpine landscapes, the Mardi Himal Trek is an unforgettable journey for nature lovers, photographers, and anyone longing to experience the Himalayas up close.</p>

<h2>Day-by-Day Itinerary</h2>

<h3>Day 1: Arrival in Kathmandu (1,345m)</h3>
<p>Arrive in the vibrant city of Kathmandu and transfer to your hotel. Stroll around the streets or enjoy the hotel facilities as you prepare for the adventure ahead.</p>

<h3>Day 2: Kathmandu Sightseeing</h3>
<p>Sightseeing in Kathmandu offers a rich blend of ancient temples, UNESCO heritage sites, and vibrant culture, showcasing the spiritual and historical heart of Nepal. Visit:</p>
<ul>
  <li>Basantapur Durbar Square</li>
  <li>Swayambhunath Stupa</li>
  <li>Jama Masjid</li>
</ul>

<h3>Day 3: Kathmandu to Pokhara (800m)</h3>
<p>Set out on a scenic 7–8 hour drive to Pokhara, winding through river valleys, terraced hills, and quaint villages. Catch glimpses of distant snow-capped peaks as you approach the lakeside city. Overnight stay at hotel.</p>

<h3>Day 4: Pokhara – Kande – Trek to Deurali (1,925m)</h3>
<p>Start the trek from Kande, walking past traditional Gurung villages and terraced farmlands. The trail winds through shaded forests with occasional clearings offering views of the Annapurna range. Reach Deurali in around 4 hours and rest at a lodge surrounded by peaceful mountain scenery.</p>

<h3>Day 5: Trek from Deurali to Low Camp (2,985m)</h3>
<p>Trek through vibrant rhododendron and oak forests, where sunlight filters through the trees and the air smells of pine. Stop for lunch at Forest Camp (2,600m) and continue upward to Low Camp, soaking in ever-changing views of rolling hills and distant snowy peaks. Overnight at the lodge.</p>

<h3>Day 6: Trek from Low Camp to High Camp (3,550m)</h3>
<p>Ascend through open alpine meadows with panoramic vistas of Machhapuchhre (Fishtail) looming majestically ahead and Annapurna South rising to the left. The trail opens to breathtaking views at every turn, making the 4-hour trek a visual feast. Overnight at High Camp.</p>

<h3>Day 7: Excursion to Mardi Himal Base Camp (4,500m) &amp; Trek to Badal Danda (3,210m)</h3>
<p>An early morning excursion to Mardi Himal Base Camp offers stunning close-up views of the surrounding Himalayan peaks, including Annapurna I, Machhapuchhre, and Mardi Himal itself. Descend to Badal Danda for the night, enjoying the remarkable alpine scenery along the way.</p>"""


MARDI_HIGHLIGHTS = [
    "Panoramic views of Machhapuchhre (Fishtail) and the Annapurna range",
    "Excursion to Mardi Himal Base Camp (4,500m)",
    "Trek through lush rhododendron and oak forests",
    "Explore authentic Gurung and Magar villages",
    "Less-crowded trail — a peaceful alternative to the Annapurna Circuit",
    "Sunrise over Annapurna South from High Camp",
    "Sightseeing in Kathmandu: Durbar Square, Swayambhunath Stupa",
    "Scenic drive through river valleys to the lakeside city of Pokhara",
]


MARDI_INCLUDES = [
    "Airport pick-up and drop-off by private vehicle",
    "Kathmandu hotel accommodation with breakfast (as per itinerary)",
    "Pokhara hotel accommodation with breakfast (as per itinerary)",
    "Annapurna Conservation Area (ACAP) permit",
    "TIMS (Trekkers' Information Management System) card",
    "Government-licensed, experienced English-speaking trekking guide",
    "Required number of porters (1 porter for 2 trekkers)",
    "Guide and porter salary, insurance, meals, accommodation, and equipment",
    "Teahouse/lodge accommodation during the trek (twin-sharing basis)",
    "Three meals a day during the trek (Breakfast, Lunch, Dinner)",
    "First aid medical kit carried by the guide",
    "Trek completion certificate",
    "All government taxes and service charges",
]


PACKAGES = [
    {
        "slug": "everest-base-camp",
        "defaults": {
            "title": "Everest Base Camp Trek",
            "description": (
                "The ultimate Himalayan pilgrimage. Trek through iconic Sherpa villages, "
                "cross dramatic suspension bridges, and stand at the foot of Mount Everest "
                "(5,364m). Witness the unforgettable sunrise from Kala Patthar and collect "
                "memories that last a lifetime."
            ),
            "long_description": EBC_LONG_DESCRIPTION,
            "destination": "Solukhumbu",
            "base_price": 45000,
            "currency": "USD",
            "duration_days": 12,
            "category": "Trekking",
            "difficulty": "Challenging",
            "rating": 4.9,
            "badge": "Best Seller",
            "highlights": EBC_HIGHLIGHTS,
            "includes": EBC_INCLUDES,
            "max_capacity": 8,
            "is_active": True,
            "is_latest": True,
        },
    },
    {
        "slug": "mardi-himal-trek",
        "defaults": {
            "title": "Mardi Himal Trek",
            "description": (
                "A hidden Himalayan gem in the Annapurna region. Trek through lush "
                "rhododendron forests and peaceful alpine meadows to Mardi Himal Base Camp "
                "(4,500m), rewarded with stunning views of Machhapuchhre and the Annapurna "
                "range — all without the crowds."
            ),
            "long_description": MARDI_LONG_DESCRIPTION,
            "destination": "Annapurna Region",
            "base_price": 35000,
            "currency": "USD",
            "duration_days": 7,
            "category": "Trekking",
            "difficulty": "Moderate",
            "rating": 4.8,
            "badge": "Popular",
            "highlights": MARDI_HIGHLIGHTS,
            "includes": MARDI_INCLUDES,
            "max_capacity": 10,
            "is_active": True,
            "is_latest": True,
        },
    },
]


KEEP_SLUGS = {"everest-base-camp", "mardi-himal-trek"}


class Command(BaseCommand):
    help = "Seed / update Everest Base Camp and Mardi Himal tour packages, removing all others."

    def handle(self, *args, **options):
        # Deactivate old tours that are not in our keep list (can't delete: protected bookings)
        old_tours = Tour.objects.exclude(slug__in=KEEP_SLUGS)
        deactivated = old_tours.update(is_active=False, is_latest=False)
        if deactivated:
            self.stdout.write(self.style.WARNING(f"Deactivated {deactivated} old tour(s)."))

        # Upsert the two canonical packages
        for pkg in PACKAGES:
            slug = pkg["slug"]
            defaults = pkg["defaults"]
            tour, created = Tour.objects.update_or_create(
                slug=slug,
                defaults=defaults,
            )
            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action}: {tour.title}"))

        self.stdout.write(self.style.SUCCESS("Done seeding packages."))
