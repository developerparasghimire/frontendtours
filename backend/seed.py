import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role, User
from apps.tours.models import Tour
from apps.events.models import Event
from apps.blog.models import BlogPost
from django.utils import timezone
from datetime import timedelta, date


def run():
    admin_email = os.environ.get("GETTOURS_ADMIN_EMAIL", "admin@gettours.com").lower().strip()
    admin_password = os.environ.get("GETTOURS_ADMIN_PASSWORD", "GetTours@2026!")
    reset_admin_password = os.environ.get("GETTOURS_RESET_ADMIN_PASSWORD", "").lower() in {"1", "true", "yes"}
    legacy_admin_email = "admin@gettour.com"

    admin_user = (
        User.objects.filter(email__iexact=admin_email).first()
        or User.objects.filter(email__iexact=legacy_admin_email).first()
    )
    if admin_user:
        admin_user.email = admin_email
        admin_user.username = admin_user.username or "admin"
        admin_user.role = Role.SUPER_ADMIN
        admin_user.is_active = True
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_email_verified = True
        update_fields = [
            "email",
            "username",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_email_verified",
        ]
        if reset_admin_password:
            admin_user.set_password(admin_password)
            update_fields.append("password")
        admin_user.save(update_fields=update_fields)
        print(f"Superuser ensured: {admin_email}")
    else:
        User.objects.create_superuser(
            username="admin",
            email=admin_email,
            password=admin_password,
            role=Role.SUPER_ADMIN,
            is_email_verified=True,
        )
        print(f"Superuser created: {admin_email}")

    tours_data = [
        {
            "title": "Kathmandu Heritage Tour",
            "slug": "kathmandu-heritage-tour",
            "description": "Walk through ancient Durbar Squares, marvel at sacred Pashupatinath and Swayambhunath, and dive into the vibrant markets of Thamel. Visit seven UNESCO World Heritage Sites in two days.",
            "destination": "Kathmandu",
            "base_price": 8500,
            "duration_days": 2,
            "max_capacity": 15,
        },
        {
            "title": "Pokhara Adventure",
            "slug": "pokhara-adventure",
            "description": "Experience the majestic Phewa Lake, stunning Annapurna views, world-class paragliding, and serene sunset walks along the Lakeside. Soar above mountains on a tandem paraglide.",
            "destination": "Pokhara",
            "base_price": 15000,
            "duration_days": 3,
            "max_capacity": 12,
        },
        {
            "title": "Chitwan Jungle Safari",
            "slug": "chitwan-jungle-safari",
            "description": "Venture into Chitwan National Park for an unforgettable wildlife safari. Spot one-horned rhinos, Bengal tigers, and exotic birds on jeep safaris and canoe rides.",
            "destination": "Chitwan",
            "base_price": 12000,
            "duration_days": 2,
            "max_capacity": 10,
        },
        {
            "title": "Everest Base Camp Trek",
            "slug": "everest-base-camp",
            "description": "The ultimate Himalayan adventure. Trek through Sherpa villages to the foot of the world's tallest peak at 5,364m. Cross suspension bridges and witness stunning mountain panoramas.",
            "destination": "Solukhumbu",
            "base_price": 45000,
            "duration_days": 14,
            "max_capacity": 8,
        },
        {
            "title": "Lumbini Spiritual Journey",
            "slug": "lumbini-spiritual-journey",
            "description": "Visit the birthplace of Lord Buddha. Explore monasteries from around the world, the sacred Bodhi tree, and the eternal peace flame in this UNESCO World Heritage Site.",
            "destination": "Lumbini",
            "base_price": 9500,
            "duration_days": 2,
            "max_capacity": 20,
        },
        {
            "title": "Annapurna Circuit Trek",
            "slug": "annapurna-circuit-trek",
            "description": "One of the world's greatest treks. Cross the Thorong La Pass at 5,416m, passing through diverse landscapes from subtropical forests to alpine meadows and ethnic communities.",
            "destination": "Annapurna Region",
            "base_price": 55000,
            "duration_days": 18,
            "max_capacity": 10,
        },
        {
            "title": "Nagarkot Sunrise & Hike",
            "slug": "nagarkot-sunrise-hike",
            "description": "Wake up to a stunning sunrise over the Himalayan range from Nagarkot, then hike through forested trails to the ancient Changu Narayan temple.",
            "destination": "Nagarkot",
            "base_price": 5500,
            "duration_days": 1,
            "max_capacity": 15,
        },
        {
            "title": "Bandipur Village Retreat",
            "slug": "bandipur-village-retreat",
            "description": "Step back in time in Bandipur, a beautifully preserved Newari hilltop town with panoramic Himalayan views, cave explorations, and authentic local cuisine.",
            "destination": "Bandipur",
            "base_price": 7000,
            "duration_days": 2,
            "max_capacity": 12,
        },
        {
            "title": "Pyuthan Landscapes",
            "slug": "pyuthan-landscapes",
            "description": "Discover the hidden beauty of Pyuthan with lush green hills, terraced farms, the sacred Swargadwari temple, and authentic rural culture far from the tourist trail.",
            "destination": "Pyuthan",
            "base_price": 11000,
            "duration_days": 3,
            "max_capacity": 8,
        },
    ]

    for data in tours_data:
        Tour.objects.get_or_create(slug=data["slug"], defaults={**data, "currency": "USD", "is_active": True})
    print(f"Tours seeded: {len(tours_data)} tours")

    events_data = [
        {
            "title": "Kathmandu Jazz Festival",
            "slug": "kathmandu-jazz-festival",
            "description": "An evening of soulful jazz performances by top Nepali and international artists at the Hyatt Regency grounds.",
            "venue": "Hyatt Regency, Kathmandu",
            "event_date": timezone.now() + timedelta(days=4),
            "base_price": 2500,
            "total_tickets": 500,
        },
        {
            "title": "Holi Color Festival",
            "slug": "holi-color-festival",
            "description": "Celebrate the festival of colors with live DJ sets, water balloons, organic colors, and delicious street food stalls.",
            "venue": "Basantapur, Kathmandu",
            "event_date": timezone.now() + timedelta(days=17),
            "base_price": 1200,
            "total_tickets": 1000,
        },
        {
            "title": "Patan Heritage Walk",
            "slug": "patan-heritage-walk",
            "description": "A guided cultural walk through Patan Durbar Square exploring centuries-old Newari architecture, art, and traditions.",
            "venue": "Patan Durbar Square",
            "event_date": timezone.now() + timedelta(days=25),
            "base_price": 800,
            "total_tickets": 30,
        },
        {
            "title": "Nepali Folk Music Night",
            "slug": "nepali-folk-music-night",
            "description": "Experience authentic Nepali folk music with live sarangi, madal drums, and traditional dance performances.",
            "venue": "Thamel, Kathmandu",
            "event_date": timezone.now() + timedelta(days=32),
            "base_price": 1500,
            "total_tickets": 200,
        },
        {
            "title": "Street Food Festival",
            "slug": "street-food-festival",
            "description": "Taste the best of Nepali street food — momos, chatpate, sel roti, and dozens of other local delicacies all in one place.",
            "venue": "Bhrikutimandap, Kathmandu",
            "event_date": timezone.now() + timedelta(days=40),
            "base_price": 500,
            "total_tickets": 2000,
        },
        {
            "title": "Bisket Jatra — Bhaktapur",
            "slug": "bisket-jatra-bhaktapur",
            "description": "Witness one of Nepal's most famous festivals in Bhaktapur with chariot processions, rituals, and cultural displays.",
            "venue": "Bhaktapur Durbar Square",
            "event_date": timezone.now() + timedelta(days=34),
            "base_price": 0,
            "total_tickets": 5000,
        },
        {
            "title": "Newari Cooking Class",
            "slug": "newari-cooking-class",
            "description": "Learn to cook authentic Newari dishes — yomari, bara, choila — from a local master chef in a traditional kitchen.",
            "venue": "Patan, Lalitpur",
            "event_date": timezone.now() + timedelta(days=45),
            "base_price": 3000,
            "total_tickets": 15,
        },
        {
            "title": "Buddha Jayanti Celebrations",
            "slug": "buddha-jayanti-celebrations",
            "description": "Join thousands of devotees at Boudhanath for prayer ceremonies, butter lamp offerings, and cultural programs celebrating Buddha's birthday.",
            "venue": "Boudhanath Stupa",
            "event_date": timezone.now() + timedelta(days=62),
            "base_price": 0,
            "total_tickets": 5000,
        },
    ]

    for data in events_data:
        Event.objects.get_or_create(
            slug=data["slug"],
            defaults={**data, "currency": "USD", "available_tickets": data["total_tickets"], "is_active": True}
        )
    print(f"Events seeded: {len(events_data)} events")

    blog_data = [
        {
            "title": "The Ultimate Guide to Everest Base Camp Trek",
            "slug": "ultimate-guide-everest-base-camp-trek",
            "excerpt": "Everything you need to know before embarking on the world's most iconic trek — from permits and packing to altitude sickness and teahouse life.",
            "content": """The Everest Base Camp trek is more than a hike — it's a journey into the heart of the Himalayas. Starting from Lukla airport, you'll traverse through rhododendron forests, suspension bridges draped in prayer flags, and ancient Sherpa villages.

The trail follows the Dudh Koshi river valley, slowly gaining altitude as you pass through Namche Bazaar, the trading hub of the Khumbu, Tengboche monastery with its jaw-dropping Ama Dablam views, and the colorful teahouses of Dingboche.

**Essential permits:** You'll need a Sagarmatha National Park entry permit (NPR 3,000) and a TIMS card. These can be arranged through licensed operators like Get Tours.

**Acclimatization is everything.** Plan rest days at Namche (3,440m) and Dingboche (4,360m). Never ascend more than 500m per day above 3,000m.

**What to pack:** Layering is key. Merino wool base layers, a down jacket rated to -20°C, waterproof boots, trekking poles, and a good sleeping bag liner are non-negotiable.

The payoff? Standing at 5,364m with Khumbu Glacier beneath your feet and the world's highest peak towering above you — utterly priceless.""",
            "author": "Pasang Sherpa",
            "category": "Trekking Guide",
            "read_time": "8 min read",
            "tags": "Everest,Trekking,Nepal,Himalaya,EBC",
        },
        {
            "title": "10 Must-Try Street Foods in Kathmandu",
            "slug": "must-try-street-foods-kathmandu",
            "excerpt": "From steaming momos to crispy chatpate, Kathmandu's street food scene is a flavour adventure you can't miss. Here are our top 10 picks.",
            "content": """Kathmandu's streets are alive with the sizzle of hot oil, the scent of spices, and the sound of vendors calling out their offerings. Whether you're wandering Thamel's alleys or browsing Ason Bazaar, your taste buds are in for a treat.

**1. Momos** — Nepal's beloved dumplings, steamed or fried, stuffed with buffalo, chicken, or vegetables. The real deal is found at a tiny stall, not a restaurant.

**2. Chatpate** — Puffed rice tossed with spices, lime, chilli, and crunchy bits. Each vendor has a secret recipe.

**3. Sel Roti** — A ring-shaped deep-fried rice bread, crispy outside, soft inside. Best enjoyed with achar.

**4. Samay Baji** — A traditional Newari platter of beaten rice, black-eyed beans, dried meat, and egg. Festival food made accessible.

**5. Aloo Chop** — Spiced potato fritters coated in chickpea batter, sold piping hot in paper bags.

**6. Bhatti ko Daal** — Slow-cooked lentil soup eaten with rice at tiny roadside dhaabas.

**7. Juju Dhau** — The "king curd" from Bhaktapur, creamy and slightly sweet, served in clay pots.

**8. Yomari** — Steamed rice-flour dumplings filled with chaku (molasses and sesame). A Newari delicacy.

**9. Kwati** — A mixed-bean soup, especially popular during Janai Purnima festival.

**10. Lassi** — Thick yoghurt-based drink, plain or flavoured, perfect after a spicy snack.

Pro tip: eat where the locals eat. Long queues means it's good.""",
            "author": "Sunita Tamang",
            "category": "Travel Tips",
            "read_time": "5 min read",
            "tags": "Kathmandu,Food,Culture,Nepal",
        },
        {
            "title": "Paragliding in Pokhara: A Complete First-Timer's Guide",
            "slug": "paragliding-pokhara-first-timers-guide",
            "excerpt": "Soaring above Phewa Lake with the Annapurna range as your backdrop — paragliding in Pokhara is a bucket-list experience. Here's everything you need to know.",
            "content": """Pokhara is considered one of the best paragliding destinations in the world, and once you've glided silently above Phewa Lake with the snow-capped Annapurna massif stretching across the horizon, you'll understand why.

**The launch site** is Sarangkot hill, about 1,600m above sea level. From here, tandem pilots and their passengers soar on thermal updrafts, sometimes climbing to 2,500m.

**Flight duration** ranges from 20 to 40 minutes for a standard tandem flight. Experienced pilots can extend this to over an hour.

**Best season:** October to April. The skies are clearer and winds more predictable. Monsoon season (June-September) grounds most flights.

**What to expect:**
- Transfer to Sarangkot launch site (~20 mins)
- Safety briefing and harness fitting (10 mins)
- A running launch off the grassy cliff
- Peaceful, exhilarating glide over the lake and city
- Landing at the Pokhara lakeside

**Safety:** Reputable operators employ certified pilots who fly regularly. All equipment is imported and regularly inspected. The accident rate among professional operators is extremely low.

**Price:** Typically NPR 8,000-15,000 for a tandem flight including GoPro video. Get Tours partners only with certified, insured operators.""",
            "author": "Bikram Gurung",
            "category": "Adventure",
            "read_time": "6 min read",
            "tags": "Pokhara,Paragliding,Adventure,Nepal",
        },
        {
            "title": "A Spiritual Journey to Lumbini: Birthplace of the Buddha",
            "slug": "spiritual-journey-lumbini-birthplace-buddha",
            "excerpt": "Lumbini is one of the holiest places on Earth. Here's how to make the most of a visit to the birthplace of Siddhartha Gautama, the founder of Buddhism.",
            "content": """In the Terai lowlands of southwestern Nepal, within sight of the Himalayan foothills, lies the small town of Lumbini — a UNESCO World Heritage site and one of Buddhism's most sacred pilgrimage destinations.

**The Sacred Garden** is the heart of Lumbini. Here stands the Maya Devi Temple, built over the exact spot where Queen Maya Devi gave birth to Siddhartha Gautama around 563 BCE. Inside, you can see the ancient brick foundations and the nativity sculpture.

**The Ashoka Pillar** was erected in 249 BCE by Emperor Ashoka, who visited on pilgrimage. Its inscription confirms the site as the Buddha's birthplace.

**The Monastery Zone** stretches for over 3km and is divided into East (Theravada) and West (Mahayana/Vajrayana) sections. Dozens of monasteries from countries including Myanmar, Vietnam, Japan, Sri Lanka, China, and Korea line the central canal.

**The Eternal Peace Flame** burns day and night as a symbol of world peace.

**Best time to visit:** October-March, avoiding the intense Terai summer heat.

**How to get there:** Fly to Bhairahawa (Gautam Buddha Airport) from Kathmandu (45 min flight), then a short drive to Lumbini. Alternatively, take an overnight bus or a Get Tours package including transport.""",
            "author": "Anita Shrestha",
            "category": "Spiritual",
            "read_time": "7 min read",
            "tags": "Lumbini,Buddhism,Spiritual,Nepal,UNESCO",
        },
        {
            "title": "Chitwan National Park: A Wildlife Safari Packing List",
            "slug": "chitwan-national-park-wildlife-safari-packing-list",
            "excerpt": "Heading to Chitwan for a jungle safari? Pack smart with this definitive gear guide so you don't miss a thing — or get eaten by mosquitos.",
            "content": """Chitwan National Park is Nepal's oldest national park and a UNESCO World Heritage site. It's home to over 68 species of mammals, 544 species of birds, and some of the world's last populations of one-horned rhinoceros and Bengal tiger.

**Essential Clothing:**
- Neutral colours (khaki, olive, brown) — avoid bright colours that startle wildlife
- Long-sleeved shirts to protect against insects and sun
- Lightweight trousers (zip-off styles work well)
- Sturdy closed-toe shoes or boots
- Light rain jacket (Chitwan gets sudden showers)
- A warm layer for early morning jeep safaris

**Gear:**
- Binoculars (8x42 or 10x42) — essential for birdwatching
- Camera with at least 200mm zoom lens
- Headlamp and spare batteries
- Dry bags for electronics

**Health & Safety:**
- Malaria prophylaxis (consult your doctor)
- High-DEET insect repellent
- Sunscreen SPF 50+
- Oral rehydration sachets
- Personal first aid kit

**What NOT to bring:**
- Plastic bags (banned in the park)
- Noisy electronic toys or loud music speakers
- Flash photography equipment

**Safari Activities to Book:**
Jeep safaris offer the best chance of tiger sightings. Canoe rides on the Rapti River are peaceful and excellent for crocodile and bird spotting. Elephant-back safaris are available though we recommend jeep safaris for ethical reasons.""",
            "author": "Ram Tharu",
            "category": "Wildlife",
            "read_time": "6 min read",
            "tags": "Chitwan,Safari,Wildlife,Nepal,Packing",
        },
        {
            "title": "Newari Culture: Nepal's Ancient Urban Civilisation",
            "slug": "newari-culture-nepal-ancient-urban-civilisation",
            "excerpt": "The Newari people of the Kathmandu Valley built some of Asia's most remarkable cities. Discover their art, architecture, festivals, and cuisine.",
            "content": """Long before Nepal became a unified kingdom, the Kathmandu Valley was the domain of the Newars — an urban civilisation of extraordinary sophistication. Their legacy surrounds you in every pagoda temple, carved wooden window, and courtyard of Kathmandu, Patan, and Bhaktapur.

**Architecture:** Newari architecture is defined by tiered pagoda roofs, intricately carved peacock windows, and brick-paved courtyards called chowks. The three Durbar Squares — Kathmandu, Patan, and Bhaktapur — are UNESCO World Heritage Sites showcasing the height of Newari craftsmanship.

**Art:** The Newars were master metalworkers, creating the gilded statues and butter lamps you see in temples throughout the Valley and across the Buddhist world from Tibet to Japan.

**Festivals:** Newari festivals are numerous and spectacular. Indra Jatra fills Kathmandu streets with masked dancers and chariots. Bisket Jatra in Bhaktapur involves a tug-of-war between two halves of the city pulling a chariot. The Living Goddess (Kumari) tradition is unique to the Newars.

**Cuisine:** Newari food (Newa cuisine) is elaborate and ritualistic. Key dishes include:
- **Samay Baji:** the ceremonial platter of beaten rice, beans, meat, and egg
- **Yomari:** sweet steamed rice dumplings
- **Bara:** savoury lentil pancakes
- **Chatamari:** rice crepes topped with egg and meat
- **Aila:** locally brewed rice spirit

Experience Newari culture on a Get Tours guided walk through Patan's narrow lanes and temple squares.""",
            "author": "Dipika Maharjan",
            "category": "Culture",
            "read_time": "9 min read",
            "tags": "Culture,Kathmandu,Newari,Nepal,Heritage",
        },
        {
            "title": "Best Photography Spots in Nepal for Stunning Landscape Shots",
            "slug": "best-photography-spots-nepal-landscape",
            "excerpt": "From Himalayan sunrise panoramas to misty valley scenes, Nepal is a paradise for landscape photographers. Here are our 8 favourite locations.",
            "content": """Nepal is arguably the most photogenic country on Earth. Nowhere else can you capture an ancient pagoda temple with an 8,000m peak glittering in the background. For photography lovers, this is the ultimate destination.

**1. Sarangkot, Pokhara**
The classic Annapurna sunrise shot. Arrive at 5am, set up your tripod, and watch the first light turn Machhapuchhre and Annapurna South a fiery orange.

**2. Nagarkot**
Similar magic for the eastern Himalayan range including Langtang and even Everest on clear days. The ridge at 2,175m is perfect for both sunrise and sunset.

**3. Poon Hill, Ghorepani**
The most accessible Himalayan viewpoint requiring only a 2-day trek. Offers one of the widest panoramas of the Annapurna and Dhaulagiri ranges.

**4. Boudhanath Stupa at dawn**
The giant white dome surrounded by golden pyramids and spinning prayer wheels, with monks making their morning circumambulations — extraordinary at 6am before the tourists arrive.

**5. Swayambhunath (Monkey Temple)**
The all-seeing Buddha eyes gaze out over the valley fog. Dawn shots from the east-facing stupa platform are particularly atmospheric.

**6. Upper Mustang's Ochre Cliffs**
The restricted area of Lo Manthang and its eroded canyons are unlike anything else in Nepal — otherworldly and deeply photogenic.

**7. Chitwan at dawn**
Morning mist rises from the Rapti River as rhinos wade through the shallows. Long lens shots of wildlife in golden light.

**8. Bhaktapur's Pottery Square**
Traditional potters at work surrounded by drying clay pots and medieval architecture — timeless documentary photography.

Every Get Tours trip includes a photography briefing so you capture each destination at its best.""",
            "author": "Marcus Webb",
            "category": "Travel Tips",
            "read_time": "7 min read",
            "tags": "Photography,Nepal,Landscape,Travel,Tips",
        },
        {
            "title": "Annapurna Circuit vs Everest Base Camp: Which Trek is Right for You?",
            "slug": "annapurna-circuit-vs-everest-base-camp-which-trek",
            "excerpt": "Both are world-class Himalayan treks, but they offer very different experiences. We break down the key differences to help you choose.",
            "content": """The eternal dilemma for Nepal trekkers: the Annapurna Circuit or Everest Base Camp? Both deliver towering peaks, remote villages, and life-changing experiences. But they are fundamentally different adventures.

**The Everest Base Camp Trek**

*Distance:* ~130km round trip from Lukla
*Duration:* 12-14 days return
*Max altitude:* 5,364m (Kala Patthar 5,545m)
*Starting point:* Fly Kathmandu-Lukla
*Terrain:* Mostly valley walking along river gorges, well-defined trail

**Why choose EBC:**
- Stand at the foot of the world's tallest mountain
- Sherpa culture is rich and accessible
- Khumbu Glacier and Icefall views are unmatched
- Bunkmates from every corner of the world — great social experience

**The Annapurna Circuit**

*Distance:* 160-230km (varies by route)
*Duration:* 14-21 days
*Max altitude:* 5,416m (Thorong La Pass)
*Starting point:* Drive from Pokhara or Kathmandu
*Terrain:* More varied — forests, gorges, high passes, desert plateau

**Why choose Annapurna Circuit:**
- Greater landscape diversity (subtropical to alpine desert)
- Cultural diversity — Gurung, Thakali, Manangi villages
- Mustang and Jomsom detour possible
- Less crowded than the EBC corridor
- No flight required to start

**Our verdict:**
First-time Himalayan trekker? EBC for icon status and simpler logistics. Experienced trekker wanting a richer, more diverse journey? Annapurna Circuit every time.

Both can be booked through Get Tours with experienced certified guides.""",
            "author": "Pasang Sherpa",
            "category": "Trekking Guide",
            "read_time": "10 min read",
            "tags": "Trekking,Everest,Annapurna,Nepal,Himalaya",
        },
        {
            "title": "Visiting Nepal on a Budget: How to Travel for Less",
            "slug": "visiting-nepal-budget-travel-tips",
            "excerpt": "Nepal is already one of the most affordable travel destinations in Asia, but with a few smart strategies you can stretch every rupee further.",
            "content": """Nepal consistently ranks among the world's best value-for-money destinations. The country is affordable by any standard, but a little local knowledge makes the difference between spending NPR 2,000/day and NPR 800/day.

**Accommodation:**
Basic teahouse rooms on trekking routes: NPR 200-500/night (often free if you eat meals there). Kathmandu guesthouses in Thamel: NPR 600-1,500/night for a clean double with bathroom.

**Food:**
A dal bhat (rice, lentils, vegetables, pickle) at a local restaurant: NPR 150-250. A full meal at a tourist restaurant: NPR 400-700. Street food: NPR 50-150. Cooking your own food is rarely an option and not worth it — dal bhat is incredibly nutritious and affordable.

**Transport:**
Local bus Kathmandu-Pokhara: NPR 550 (8 hrs). Tourist bus: NPR 900 (same route, more comfortable). Flight: NPR 4,500 (25 min). Kathmandu city bus: NPR 25. Taxis: always negotiate or use the meter.

**Trekking on a budget:**
Independent trekking (with a guide) is cheaper than a package tour. A TIMS card and national park permit together cost NPR 4,000-6,000 depending on the area.

**Where NOT to cut corners:**
- Guide and porter wages — these are real livelihoods. Pay fair rates.
- Altitude medicine — cheap is dangerous above 3,500m
- Permits — fines and evacuation costs far exceed permit fees

**Best budget destinations:**
Pokhara (cheaper than Kathmandu), Bandipur (low crowds, low prices), Ghorepani (2-day trek, world-class views).""",
            "author": "Sunita Tamang",
            "category": "Travel Tips",
            "read_time": "8 min read",
            "tags": "Budget,Travel,Nepal,Tips",
        },
    ]

    for data in blog_data:
        BlogPost.objects.get_or_create(slug=data["slug"], defaults=data)
    print(f"Blog posts seeded: {len(blog_data)} posts")

    print("Seed complete!")

if __name__ == '__main__':
    run()
