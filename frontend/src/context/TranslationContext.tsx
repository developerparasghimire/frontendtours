"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CurrencyCode } from "@/context/CurrencyTypes";

export type LangCode = "EN" | "DE" | "FR" | "ES" | "IT" | "JA" | "RU" | "ZH" | "HI";

export const LANGUAGES = [
  { code: "EN" as LangCode, label: "English",  flag: "🇬🇧" },
  { code: "DE" as LangCode, label: "Deutsch",  flag: "🇩🇪" },
  { code: "FR" as LangCode, label: "Français", flag: "🇫🇷" },
  { code: "ES" as LangCode, label: "Español",  flag: "🇪🇸" },
  { code: "IT" as LangCode, label: "Italiano", flag: "🇮🇹" },
  { code: "JA" as LangCode, label: "日本語",    flag: "🇯🇵" },
  { code: "RU" as LangCode, label: "Русский",  flag: "🇷🇺" },
  { code: "ZH" as LangCode, label: "中文",      flag: "🇨🇳" },
  { code: "HI" as LangCode, label: "हिन्दी",    flag: "🇮🇳" },
];

const SUPPORTED_LANGS = new Set<LangCode>(["EN", "DE", "FR", "ES", "IT", "JA", "RU", "ZH", "HI"]);

// Browser navigator.language → LangCode
function getBrowserLang(): LangCode {
  if (typeof navigator === "undefined") return "EN";
  const code = (navigator.language || "").split("-")[0].toUpperCase() as LangCode;
  return SUPPORTED_LANGS.has(code) ? code : "EN";
}

// Country code → LangCode (primary language of country)
const LANG_MAP: Record<string, LangCode> = {
  DE: "DE", AT: "DE", LI: "DE", CH: "DE",
  FR: "FR", BE: "FR", LU: "FR", MC: "FR",
  ES: "ES", MX: "ES", AR: "ES", CO: "ES", PE: "ES",
  CL: "ES", VE: "ES", EC: "ES", BO: "ES", PY: "ES",
  UY: "ES", CR: "ES", PA: "ES", GT: "ES", HN: "ES",
  SV: "ES", NI: "ES", DO: "ES", CU: "ES",
  IT: "IT", SM: "IT", VA: "IT",
  JP: "JA",
  RU: "RU", BY: "RU", KZ: "RU",
  CN: "ZH", TW: "ZH", HK: "ZH", SG: "ZH",
  IN: "HI",
};

// Countries whose default currency is EUR
const EUR_COUNTRIES = new Set([
  "DE","AT","FR","ES","IT","BE","NL","PT","FI","IE","LU",
  "SK","SI","LT","LV","EE","CY","MT","MC","SM","VA","LI","GR","HR",
]);

// Country-specific currency overrides (non-EUR)
const CURRENCY_MAP: Record<string, CurrencyCode> = {
  NP: "NPR", IN: "INR", GB: "GBP", AU: "AUD", NZ: "AUD",
};

export function countryToCurrency(country: string): CurrencyCode {
  if (EUR_COUNTRIES.has(country)) return "EUR";
  return CURRENCY_MAP[country] ?? "USD";
}

export function countryToLang(country: string): LangCode {
  return LANG_MAP[country] ?? "EN";
}

// ─────────────────────────────────────────────
// Translation dictionary
// ─────────────────────────────────────────────
type Dict = Record<string, string>;

const T: Record<LangCode, Dict> = {
  // ─── ENGLISH ───────────────────────────────
  EN: {
    // Navigation
    "nav.home": "Home", "nav.about": "About", "nav.events": "Events",
    "nav.tours": "Tours", "nav.blogs": "Blogs", "nav.contact": "Contact",
    "nav.signin": "Sign In",

    // Tour detail
    "tour.book": "Book This Tour", "tour.book_now": "Book Now",
    "tour.download": "Download Tour Details",
    "tour.price_from": "Starting from", "tour.per_person": "per person",
    "tour.about": "About This Tour", "tour.highlights": "Tour Highlights",
    "tour.gallery": "Gallery", "tour.included": "What's Included",
    "tour.guide": "Your Guide", "tour.faq": "Frequently Asked Questions",
    "tour.back": "Back to All Tours",
    "tour.destination": "Destination", "tour.duration": "Duration",
    "tour.difficulty": "Difficulty", "tour.activity": "Activity",
    "tour.best_season": "Best Season", "tour.rating": "Rating",
    "tour.reviews": "reviews",

    // Event detail
    "event.book": "Book Tickets", "event.back": "Back to All Events",
    "event.about": "About This Event", "event.highlights": "Event Highlights",
    "event.download": "Download Event Details",
    "event.date": "Date", "event.time": "Time", "event.venue": "Venue",
    "event.price": "Entry Price", "event.tickets": "Tickets Available",

    // Common
    "common.free": "Free", "common.sold_out": "Sold Out",
    "common.contact": "Contact Us", "common.need_help": "Need help planning your trip?",
    "common.select_date": "Select Date", "common.travelers": "Travelers",
    "common.tickets": "Tickets",
    "common.all_categories": "All categories",
    "common.explore_tour": "Explore tour",
    "common.view_event": "View event",
    "common.showing": "Showing",
    "common.in": "in",

    // Trust badges
    "trust.certified": "Certified Travel Agency",
    "trust.safe": "Safe & Secure",
    "trust.support": "24/7 Support",
    "trust.guarantee": "Best Price Guarantee",

    // Home – Events section
    "home.events_eyebrow": "What's Happening",
    "home.events_heading": "Latest Events",
    "home.events_desc": "Upcoming festivals, cultural experiences, and local happenings across Nepal.",
    "home.events_cta": "View all events",

    // Home – Tours section
    "home.tours_eyebrow": "Top Picks",
    "home.tours_heading": "Popular Tour Packages",
    "home.tours_desc": "Our most booked adventures across Nepal — handpicked for every type of traveller.",
    "home.tours_cta": "See all tours",

    // Home – Gallery
    "home.gallery_eyebrow": "Our Adventures",
    "home.gallery_heading": "Life in the Mountains",

    // Home – Adventure categories
    "home.adventure_eyebrow": "Travel Styles",
    "home.adventure_heading": "Find Your Adventure",

    // Home – Why us
    "home.why_eyebrow": "Why Get Tours",
    "home.why_heading": "Travel With Confidence",
    "home.why_desc": "We combine local knowledge, transparent planning, and thoughtful service so your Nepal trip feels exciting from the first click to the final day.",
    "home.trust1_title": "Verified & Safe",
    "home.trust1_desc": "Every tour is vetted for safety. Licensed guides, insured vehicles, and 24/7 support throughout your journey.",
    "home.trust1_stat": "200+ licensed guides",
    "home.trust2_title": "Best Price Guarantee",
    "home.trust2_desc": "We match any comparable offer. Get the best value for your Nepal adventure with no hidden fees.",
    "home.trust2_stat": "500+ trips matched",
    "home.trust3_title": "Local Expertise",
    "home.trust3_desc": "Our team of local experts crafts authentic experiences. We know Nepal like the back of our hand.",
    "home.trust3_stat": "15 yrs local roots",

    // Home – Testimonials
    "home.testimonials_eyebrow": "Testimonials",
    "home.testimonials_heading": "Real stories from Nepal travelers",

    // Home – Contact section
    "home.contact_eyebrow": "Get In Touch",
    "home.contact_heading": "Plan Your Nepal Journey",
    "home.contact_desc": "Share your dates, travel style, or group size and our local team will shape the perfect itinerary for you.",
    "home.contact_cta": "Send Us a Message",
    "home.call_us": "Call Us",
    "home.email_us": "Email Us",
    "home.find_us": "Find Us",
    "home.hours": "Mon–Sat, 9 AM – 6 PM",
    "home.reply_time": "Reply within 24 hours",
    "home.maps_link": "Open in Google Maps",
    "home.our_story": "Our Story",
    "home.get_in_touch": "Get in Touch",

    // Home – Partners & newsletter
    "home.partners_eyebrow": "Trusted By",
    "home.partners_heading": "Certificates & Partners",
    "home.newsletter_eyebrow": "Newsletter",
    "home.newsletter_heading": "Get Nepal Travel Inspiration",
    "home.newsletter_desc": "Subscribe for the latest tour packages, upcoming events, travel tips, and exclusive deals delivered to your inbox.",

    // About page
    "about.hero_title": "Our Story, Our Mountains",
    "about.hero_subtitle": "From Teahouses to Summits",
    "about.hero_desc": "Born in the heart of the Himalayas — driven by a passion to connect every traveller with Nepal's most breathtaking peaks, trails, and people.",
    "about.years_exp": "25+ Years Experience",
    "about.years_excellence": "Years of Excellence",
    "about.trek_eyebrow": "Trek With Confidence",
    "about.trek_heading": "What Makes Our Treks Different",
    "about.feature1_title": "Expert Route Planning",
    "about.feature1_desc": "Every trail is GPS-mapped and reviewed by experienced Sherpa guides with decades on the mountains.",
    "about.feature2_title": "Premium Teahouse Stays",
    "about.feature2_desc": "Hand-picked lodges along the route — warm meals, hot showers, and uninterrupted mountain views.",
    "about.feature3_title": "Altitude Sickness Care",
    "about.feature3_desc": "Acclimatization schedules, oximeters on every trek, and emergency evacuation plans at high altitude.",
    "about.feature4_title": "Photography Treks",
    "about.feature4_desc": "Dedicated photography-focused treks with golden-hour stops at the best Himalayan viewpoints.",
    "about.values_eyebrow": "Our Values",
    "about.values_heading": "What Drives Us Up the Mountain",
    "about.timeline_eyebrow": "Our Journey",
    "about.timeline_heading": "Trail Milestones",
    "about.guides_eyebrow": "The Summit Crew",
    "about.guides_heading": "Meet Our Trail Leaders",
    "about.guides_desc": "Every great adventure starts with an even greater guide. Our team brings decades of Himalayan experience to every trek.",
    "about.team_eyebrow": "The Office Crew",
    "about.team_heading": "Meet Our Team",
    "about.team_desc": "The people behind every booking, itinerary, and Himalayan story — leadership and staff working from our Thamel office.",
    "about.cta_eyebrow": "Begin Your Adventure",
    "about.cta_heading": "Ready for the Summit?",
    "about.cta_desc": "Whether you're a first-time trekker or a seasoned mountaineer — your next Himalayan adventure starts here.",
    "about.cta_explore": "Explore Treks",
    "about.cta_contact": "Get In Touch",

    // Tours listing page
    "tours.hero_title": "All Tour Packages",
    "tours.hero_subtitle": "Explore Nepal",
    "tours.hero_desc": "From day trips to multi-week treks — find the perfect adventure for every traveler.",
    "tours.singular": "tour",
    "tours.plural": "tours",
    "tours.no_tours_cat": "No tours found in",
    "tours.empty": "No tours available right now. Check back soon!",
    "tours.show_all": "Show all tours",
    "tours.cta_heading": "Can't Decide? Let Us Help!",
    "tours.cta_desc": "Our travel experts will craft a personalized itinerary just for you.",
    "tours.custom_trip": "Get Custom Trip",
    "tours.regions": "regions",

    // Events listing page
    "events.hero_title": "Upcoming Events & Experiences",
    "events.hero_subtitle": "Don't Miss Out",
    "events.hero_desc": "Discover concerts, cultural walks, festivals, cooking classes, and more happening across Nepal.",
    "events.singular": "event",
    "events.plural": "events",
    "events.show_all": "Show all events",
    "events.no_events_cat": "No events found in",
    "events.empty": "No events available right now. Check back soon!",
    "events.host_heading": "Want to Host an Event With Us?",
    "events.host_desc": "Partner with Get Tours to promote your event to thousands of travelers and locals.",
  },

  // ─── GERMAN ────────────────────────────────
  DE: {
    "nav.home": "Startseite", "nav.about": "Über uns", "nav.events": "Veranstaltungen",
    "nav.tours": "Touren", "nav.blogs": "Blog", "nav.contact": "Kontakt",
    "nav.signin": "Anmelden",

    "tour.book": "Diese Tour buchen", "tour.book_now": "Jetzt buchen",
    "tour.download": "Details herunterladen",
    "tour.price_from": "Ab", "tour.per_person": "pro Person",
    "tour.about": "Über diese Tour", "tour.highlights": "Tour-Highlights",
    "tour.gallery": "Galerie", "tour.included": "Im Preis enthalten",
    "tour.guide": "Ihr Reiseleiter", "tour.faq": "Häufig gestellte Fragen",
    "tour.back": "Zurück zu allen Touren",
    "tour.destination": "Reiseziel", "tour.duration": "Dauer",
    "tour.difficulty": "Schwierigkeit", "tour.activity": "Aktivität",
    "tour.best_season": "Beste Reisezeit", "tour.rating": "Bewertung",
    "tour.reviews": "Bewertungen",

    "event.book": "Tickets buchen", "event.back": "Zurück zu Veranstaltungen",
    "event.about": "Über diese Veranstaltung", "event.highlights": "Highlights",
    "event.download": "Details herunterladen",
    "event.date": "Datum", "event.time": "Uhrzeit", "event.venue": "Veranstaltungsort",
    "event.price": "Eintrittspreis", "event.tickets": "Verfügbare Tickets",

    "common.free": "Kostenlos", "common.sold_out": "Ausverkauft",
    "common.contact": "Kontakt", "common.need_help": "Hilfe bei der Reiseplanung?",
    "common.select_date": "Datum wählen", "common.travelers": "Reisende",
    "common.tickets": "Tickets",
    "common.all_categories": "Alle Kategorien",
    "common.explore_tour": "Tour erkunden",
    "common.view_event": "Event ansehen",
    "common.showing": "Angezeigt",
    "common.in": "in",

    "trust.certified": "Zertifiziertes Reisebüro",
    "trust.safe": "Sicher & Geschützt",
    "trust.support": "24/7 Unterstützung",
    "trust.guarantee": "Bestpreis-Garantie",

    "home.events_eyebrow": "Was ist los",
    "home.events_heading": "Aktuelle Events",
    "home.events_desc": "Bevorstehende Festivals, Kulturerlebnisse und lokale Events in ganz Nepal.",
    "home.events_cta": "Alle Events ansehen",

    "home.tours_eyebrow": "Empfehlungen",
    "home.tours_heading": "Beliebte Tourpakete",
    "home.tours_desc": "Unsere meistgebuchten Abenteuer in Nepal – für jeden Reisenden sorgfältig ausgewählt.",
    "home.tours_cta": "Alle Touren ansehen",

    "home.gallery_eyebrow": "Unsere Abenteuer",
    "home.gallery_heading": "Leben in den Bergen",

    "home.adventure_eyebrow": "Reisestile",
    "home.adventure_heading": "Finde dein Abenteuer",

    "home.why_eyebrow": "Warum Get Tours",
    "home.why_heading": "Reisen mit Vertrauen",
    "home.why_desc": "Lokales Wissen, transparente Planung und aufmerksamer Service – damit Ihre Nepal-Reise vom ersten Klick bis zum letzten Tag begeistert.",
    "home.trust1_title": "Geprüft & Sicher",
    "home.trust1_desc": "Jede Tour wird auf Sicherheit geprüft. Lizenzierte Guides, versicherte Fahrzeuge und 24/7-Support auf Ihrer Reise.",
    "home.trust1_stat": "200+ lizenzierte Guides",
    "home.trust2_title": "Bestpreisgarantie",
    "home.trust2_desc": "Wir passen uns jedem vergleichbaren Angebot an. Bestes Preis-Leistungs-Verhältnis ohne versteckte Kosten.",
    "home.trust2_stat": "500+ Reisen verglichen",
    "home.trust3_title": "Lokale Expertise",
    "home.trust3_desc": "Unser Team lokaler Experten schafft authentische Erlebnisse. Wir kennen Nepal in- und auswendig.",
    "home.trust3_stat": "15 J. lokale Verwurzelung",

    "home.testimonials_eyebrow": "Reisebewertungen",
    "home.testimonials_heading": "Echte Geschichten aus Nepal",

    "home.contact_eyebrow": "Kontakt aufnehmen",
    "home.contact_heading": "Plane deine Nepal-Reise",
    "home.contact_desc": "Teile Reisedaten, Stil oder Gruppengröße – unser Team erstellt das perfekte Itinerar.",
    "home.contact_cta": "Nachricht senden",
    "home.call_us": "Anrufen",
    "home.email_us": "E-Mail senden",
    "home.find_us": "Finden Sie uns",
    "home.hours": "Mo–Sa, 9–18 Uhr",
    "home.reply_time": "Antwort in 24 Stunden",
    "home.maps_link": "In Google Maps öffnen",
    "home.our_story": "Unsere Geschichte",
    "home.get_in_touch": "Kontakt aufnehmen",

    "home.partners_eyebrow": "Unsere Partner",
    "home.partners_heading": "Zertifikate & Partner",
    "home.newsletter_eyebrow": "Newsletter",
    "home.newsletter_heading": "Nepal-Reiseinspiration",
    "home.newsletter_desc": "Abonnieren Sie die neuesten Tourpakete, Events, Reisetipps und exklusive Angebote direkt in Ihr Postfach.",

    // About page
    "about.hero_title": "Unsere Geschichte, unsere Berge",
    "about.hero_subtitle": "Von Teehaus bis zum Gipfel",
    "about.hero_desc": "Im Herzen des Himalaya geboren — angetrieben von der Leidenschaft, jeden Reisenden mit Nepals atemberaubendsten Gipfeln, Pfaden und Menschen zu verbinden.",
    "about.years_exp": "25+ Jahre Erfahrung",
    "about.years_excellence": "Jahre der Exzellenz",
    "about.trek_eyebrow": "Mit Vertrauen trekken",
    "about.trek_heading": "Was unsere Trekkingtouren besonders macht",
    "about.feature1_title": "Expertengestützte Routenplanung",
    "about.feature1_desc": "Jeder Weg ist GPS-kartiert und von erfahrenen Sherpa-Guides mit jahrzehntelanger Bergerfahrung überprüft.",
    "about.feature2_title": "Erstklassige Teehausunterkünfte",
    "about.feature2_desc": "Handverlesene Lodges entlang der Route — warme Mahlzeiten, heiße Duschen und unverbaubare Bergpanoramen.",
    "about.feature3_title": "Höhenkrankheit-Versorgung",
    "about.feature3_desc": "Akklimatisierungspläne, Pulsoximeter auf jeder Tour und Notfallevakuierungspläne in großer Höhe.",
    "about.feature4_title": "Fotografie-Trekkingtouren",
    "about.feature4_desc": "Speziell auf Fotografie ausgerichtete Touren mit goldenen Stundenstopps an den besten Himalaya-Aussichtspunkten.",
    "about.values_eyebrow": "Unsere Werte",
    "about.values_heading": "Was uns auf den Berg treibt",
    "about.timeline_eyebrow": "Unsere Reise",
    "about.timeline_heading": "Meilensteine",
    "about.guides_eyebrow": "Unser Gipfelteam",
    "about.guides_heading": "Unsere Tourenleiter",
    "about.guides_desc": "Jedes große Abenteuer beginnt mit einem noch größeren Guide. Unser Team bringt jahrzehntelange Himalaya-Erfahrung auf jede Tour.",
    "about.team_eyebrow": "Das Büro-Team",
    "about.team_heading": "Unser Team",
    "about.team_desc": "Die Menschen hinter jeder Buchung, jedem Reiseplan und jeder Himalaya-Geschichte — Führungskräfte und Mitarbeiter aus unserem Thamel-Büro.",
    "about.cta_eyebrow": "Beginne dein Abenteuer",
    "about.cta_heading": "Bereit für den Gipfel?",
    "about.cta_desc": "Ob Erstbesteiger oder erfahrener Bergsteiger — Ihr nächstes Himalaya-Abenteuer beginnt hier.",
    "about.cta_explore": "Touren erkunden",
    "about.cta_contact": "Kontakt aufnehmen",

    "tours.hero_title": "Alle Tourpakete",
    "tours.hero_subtitle": "Nepal entdecken",
    "tours.hero_desc": "Von Tagesausflügen bis zu mehrtägigen Trekkingtouren – das perfekte Abenteuer für jeden Reisenden.",
    "tours.singular": "Tour",
    "tours.plural": "Touren",
    "tours.no_tours_cat": "Keine Touren in",
    "tours.empty": "Derzeit keine Touren verfügbar. Schau bald wieder vorbei!",
    "tours.show_all": "Alle Touren anzeigen",
    "tours.cta_heading": "Unentschlossen? Wir helfen!",
    "tours.cta_desc": "Unsere Reiseexperten erstellen ein persönliches Reiseprogramm speziell für Sie.",
    "tours.custom_trip": "Individuelle Reise anfragen",
    "tours.regions": "Regionen",

    "events.hero_title": "Kommende Events & Erlebnisse",
    "events.hero_subtitle": "Nichts verpassen",
    "events.hero_desc": "Entdecke Konzerte, Kulturspaziergänge, Festivals, Kochkurse und mehr in Nepal.",
    "events.singular": "Veranstaltung",
    "events.plural": "Veranstaltungen",
    "events.show_all": "Alle Events anzeigen",
    "events.no_events_cat": "Keine Veranstaltungen in",
    "events.empty": "Derzeit keine Events verfügbar. Schau bald wieder vorbei!",
    "events.host_heading": "Möchten Sie ein Event mit uns veranstalten?",
    "events.host_desc": "Kooperieren Sie mit Get Tours, um Ihr Event Tausenden von Reisenden und Einheimischen vorzustellen.",
  },

  // ─── FRENCH ────────────────────────────────
  FR: {
    "nav.home": "Accueil", "nav.about": "À propos", "nav.events": "Événements",
    "nav.tours": "Circuits", "nav.blogs": "Blog", "nav.contact": "Contact",
    "nav.signin": "Connexion",

    "tour.book": "Réserver ce circuit", "tour.book_now": "Réserver",
    "tour.download": "Télécharger les détails",
    "tour.price_from": "À partir de", "tour.per_person": "par personne",
    "tour.about": "À propos de ce circuit", "tour.highlights": "Points forts",
    "tour.gallery": "Galerie", "tour.included": "Ce qui est inclus",
    "tour.guide": "Votre guide", "tour.faq": "Questions fréquentes",
    "tour.back": "Retour aux circuits",
    "tour.destination": "Destination", "tour.duration": "Durée",
    "tour.difficulty": "Difficulté", "tour.activity": "Activité",
    "tour.best_season": "Meilleure saison", "tour.rating": "Évaluation",
    "tour.reviews": "avis",

    "event.book": "Réserver des billets", "event.back": "Retour aux événements",
    "event.about": "À propos de cet événement", "event.highlights": "Points forts",
    "event.download": "Télécharger les détails",
    "event.date": "Date", "event.time": "Heure", "event.venue": "Lieu",
    "event.price": "Prix d'entrée", "event.tickets": "Billets disponibles",

    "common.free": "Gratuit", "common.sold_out": "Complet",
    "common.contact": "Contactez-nous", "common.need_help": "Besoin d'aide pour planifier?",
    "common.select_date": "Choisir une date", "common.travelers": "Voyageurs",
    "common.tickets": "Billets",
    "common.all_categories": "Toutes les catégories",
    "common.explore_tour": "Explorer le circuit",
    "common.view_event": "Voir l'événement",
    "common.showing": "Affichage de",
    "common.in": "dans",

    "trust.certified": "Agence de voyages certifiée",
    "trust.safe": "Sûr & Sécurisé",
    "trust.support": "Support 24h/24",
    "trust.guarantee": "Meilleur prix garanti",

    "home.events_eyebrow": "À l'affiche",
    "home.events_heading": "Événements à venir",
    "home.events_desc": "Festivals, expériences culturelles et événements locaux à découvrir au Népal.",
    "home.events_cta": "Voir tous les événements",

    "home.tours_eyebrow": "Nos coups de cœur",
    "home.tours_heading": "Circuits populaires",
    "home.tours_desc": "Nos aventures les plus réservées au Népal – sélectionnées pour tous les types de voyageurs.",
    "home.tours_cta": "Voir tous les circuits",

    "home.gallery_eyebrow": "Nos aventures",
    "home.gallery_heading": "La vie en montagne",

    "home.adventure_eyebrow": "Styles de voyage",
    "home.adventure_heading": "Trouvez votre aventure",

    "home.why_eyebrow": "Pourquoi Get Tours",
    "home.why_heading": "Voyagez en toute confiance",
    "home.why_desc": "Nous allions connaissance locale, planification transparente et service attentionné pour que votre voyage au Népal soit une aventure inoubliable.",
    "home.trust1_title": "Vérifié & Sûr",
    "home.trust1_desc": "Chaque circuit est contrôlé pour la sécurité. Guides agréés, véhicules assurés et assistance 24h/24 tout au long du voyage.",
    "home.trust1_stat": "200+ guides agréés",
    "home.trust2_title": "Meilleur prix garanti",
    "home.trust2_desc": "Nous nous alignons sur toute offre comparable. Le meilleur rapport qualité-prix sans frais cachés.",
    "home.trust2_stat": "500+ voyages comparés",
    "home.trust3_title": "Expertise locale",
    "home.trust3_desc": "Notre équipe d'experts locaux crée des expériences authentiques. Nous connaissons le Népal sur le bout des doigts.",
    "home.trust3_stat": "15 ans d'ancrage local",

    "home.testimonials_eyebrow": "Témoignages",
    "home.testimonials_heading": "Des voyageurs témoignent de leur Népal",

    "home.contact_eyebrow": "Nous contacter",
    "home.contact_heading": "Planifiez votre voyage au Népal",
    "home.contact_desc": "Partagez vos dates, votre style de voyage ou la taille de votre groupe et notre équipe locale créera l'itinéraire parfait.",
    "home.contact_cta": "Envoyez-nous un message",
    "home.call_us": "Appelez-nous",
    "home.email_us": "Écrivez-nous",
    "home.find_us": "Trouvez-nous",
    "home.hours": "Lun–Sam, 9h–18h",
    "home.reply_time": "Réponse sous 24 h",
    "home.maps_link": "Ouvrir dans Google Maps",
    "home.our_story": "Notre histoire",
    "home.get_in_touch": "Prendre contact",

    "home.partners_eyebrow": "Ils nous font confiance",
    "home.partners_heading": "Certificats & Partenaires",
    "home.newsletter_eyebrow": "Newsletter",
    "home.newsletter_heading": "Inspirations voyage au Népal",
    "home.newsletter_desc": "Abonnez-vous pour recevoir les derniers forfaits, événements, conseils de voyage et offres exclusives directement dans votre boîte mail.",

    // About page
    "about.hero_title": "Notre histoire, nos montagnes",
    "about.hero_subtitle": "Des maisons de thé aux sommets",
    "about.hero_desc": "Né au cœur de l'Himalaya — animé par la passion de connecter chaque voyageur avec les sommets, les sentiers et les habitants les plus époustouflants du Népal.",
    "about.years_exp": "25+ ans d'expérience",
    "about.years_excellence": "Années d'excellence",
    "about.trek_eyebrow": "Trekker en toute confiance",
    "about.trek_heading": "Ce qui rend nos treks différents",
    "about.feature1_title": "Planification d'itinéraires par des experts",
    "about.feature1_desc": "Chaque sentier est cartographié par GPS et contrôlé par des guides Sherpa expérimentés avec des décennies en montagne.",
    "about.feature2_title": "Hébergements premium en maisons de thé",
    "about.feature2_desc": "Lodges soigneusement sélectionnés le long de la route — repas chauds, douches chaudes et vues ininterrompues sur les montagnes.",
    "about.feature3_title": "Prévention du mal des montagnes",
    "about.feature3_desc": "Programmes d'acclimatation, oxymètres sur chaque trek et plans d'évacuation d'urgence en haute altitude.",
    "about.feature4_title": "Treks photographiques",
    "about.feature4_desc": "Treks dédiés à la photographie avec des arrêts à l'heure dorée aux meilleurs points de vue de l'Himalaya.",
    "about.values_eyebrow": "Nos valeurs",
    "about.values_heading": "Ce qui nous pousse vers les sommets",
    "about.timeline_eyebrow": "Notre parcours",
    "about.timeline_heading": "Étapes clés",
    "about.guides_eyebrow": "L'équipe des sommets",
    "about.guides_heading": "Rencontrez nos guides",
    "about.guides_desc": "Chaque grande aventure commence par un guide encore plus grand. Notre équipe apporte des décennies d'expérience himalayenne à chaque trek.",
    "about.team_eyebrow": "L'équipe de bureau",
    "about.team_heading": "Notre équipe",
    "about.team_desc": "Les personnes derrière chaque réservation, itinéraire et histoire himalayenne — direction et personnel de notre bureau de Thamel.",
    "about.cta_eyebrow": "Commencez votre aventure",
    "about.cta_heading": "Prêt pour le sommet ?",
    "about.cta_desc": "Que vous soyez un trekker débutant ou un alpiniste chevronné — votre prochaine aventure himalayenne commence ici.",
    "about.cta_explore": "Explorer les treks",
    "about.cta_contact": "Nous contacter",

    "tours.hero_title": "Tous les circuits",
    "tours.hero_subtitle": "Explorer le Népal",
    "tours.hero_desc": "Des excursions d'une journée aux treks de plusieurs semaines — trouvez l'aventure parfaite pour chaque voyageur.",
    "tours.singular": "circuit",
    "tours.plural": "circuits",
    "tours.no_tours_cat": "Aucun circuit dans",
    "tours.empty": "Aucun circuit disponible pour le moment. Revenez bientôt !",
    "tours.show_all": "Afficher tous les circuits",
    "tours.cta_heading": "Vous hésitez ? Nous vous aidons !",
    "tours.cta_desc": "Nos experts en voyage créeront un itinéraire personnalisé rien que pour vous.",
    "tours.custom_trip": "Demander un voyage sur mesure",
    "tours.regions": "régions",

    "events.hero_title": "Événements & Expériences à venir",
    "events.hero_subtitle": "Ne manquez rien",
    "events.hero_desc": "Concerts, balades culturelles, festivals, cours de cuisine et bien plus au Népal.",
    "events.singular": "événement",
    "events.plural": "événements",
    "events.show_all": "Afficher tous les événements",
    "events.no_events_cat": "Aucun événement dans",
    "events.empty": "Aucun événement disponible pour le moment. Revenez bientôt !",
    "events.host_heading": "Vous souhaitez organiser un événement avec nous ?",
    "events.host_desc": "Associez-vous à Get Tours pour promouvoir votre événement auprès de milliers de voyageurs et de locaux.",
  },

  // ─── SPANISH ───────────────────────────────
  ES: {
    "nav.home": "Inicio", "nav.about": "Nosotros", "nav.events": "Eventos",
    "nav.tours": "Tours", "nav.blogs": "Blog", "nav.contact": "Contacto",
    "nav.signin": "Iniciar sesión",

    "tour.book": "Reservar este tour", "tour.book_now": "Reservar",
    "tour.download": "Descargar detalles",
    "tour.price_from": "Desde", "tour.per_person": "por persona",
    "tour.about": "Sobre este tour", "tour.highlights": "Destacados del tour",
    "tour.gallery": "Galería", "tour.included": "Qué incluye",
    "tour.guide": "Tu guía", "tour.faq": "Preguntas frecuentes",
    "tour.back": "Volver a todos los tours",
    "tour.destination": "Destino", "tour.duration": "Duración",
    "tour.difficulty": "Dificultad", "tour.activity": "Actividad",
    "tour.best_season": "Mejor temporada", "tour.rating": "Calificación",
    "tour.reviews": "reseñas",

    "event.book": "Comprar entradas", "event.back": "Volver a eventos",
    "event.about": "Sobre este evento", "event.highlights": "Destacados",
    "event.download": "Descargar detalles",
    "event.date": "Fecha", "event.time": "Hora", "event.venue": "Lugar",
    "event.price": "Precio de entrada", "event.tickets": "Entradas disponibles",

    "common.free": "Gratis", "common.sold_out": "Agotado",
    "common.contact": "Contáctanos", "common.need_help": "¿Necesitas ayuda para planificar?",
    "common.select_date": "Seleccionar fecha", "common.travelers": "Viajeros",
    "common.tickets": "Entradas",
    "common.all_categories": "Todas las categorías",
    "common.explore_tour": "Explorar tour",
    "common.view_event": "Ver evento",
    "common.showing": "Mostrando",
    "common.in": "en",

    "trust.certified": "Agencia de viajes certificada",
    "trust.safe": "Seguro y protegido",
    "trust.support": "Soporte 24/7",
    "trust.guarantee": "Mejor precio garantizado",

    "home.events_eyebrow": "Qué hay",
    "home.events_heading": "Últimos eventos",
    "home.events_desc": "Próximos festivales, experiencias culturales y eventos locales en todo Nepal.",
    "home.events_cta": "Ver todos los eventos",

    "home.tours_eyebrow": "Lo más popular",
    "home.tours_heading": "Tours más populares",
    "home.tours_desc": "Nuestras aventuras más reservadas en Nepal, seleccionadas para todo tipo de viajeros.",
    "home.tours_cta": "Ver todos los tours",

    "home.gallery_eyebrow": "Nuestras aventuras",
    "home.gallery_heading": "Vida en las montañas",

    "home.adventure_eyebrow": "Estilos de viaje",
    "home.adventure_heading": "Encuentra tu aventura",

    "home.why_eyebrow": "Por qué Get Tours",
    "home.why_heading": "Viaja con confianza",
    "home.why_desc": "Combinamos conocimiento local, planificación transparente y servicio atento para que tu viaje a Nepal sea emocionante desde el primer clic hasta el último día.",
    "home.trust1_title": "Verificado y seguro",
    "home.trust1_desc": "Cada tour está verificado en cuanto a seguridad. Guías con licencia, vehículos asegurados y soporte 24/7 durante todo tu viaje.",
    "home.trust1_stat": "200+ guías con licencia",
    "home.trust2_title": "Mejor precio garantizado",
    "home.trust2_desc": "Igualamos cualquier oferta comparable. Obtén el mejor valor para tu aventura en Nepal sin cargos ocultos.",
    "home.trust2_stat": "500+ viajes comparados",
    "home.trust3_title": "Experiencia local",
    "home.trust3_desc": "Nuestro equipo de expertos locales crea experiencias auténticas. Conocemos Nepal como la palma de nuestra mano.",
    "home.trust3_stat": "15 años de raíces locales",

    "home.testimonials_eyebrow": "Testimonios",
    "home.testimonials_heading": "Historias reales de viajeros en Nepal",

    "home.contact_eyebrow": "Contáctanos",
    "home.contact_heading": "Planifica tu viaje a Nepal",
    "home.contact_desc": "Comparte tus fechas, estilo de viaje o tamaño del grupo y nuestro equipo local diseñará el itinerario perfecto.",
    "home.contact_cta": "Envíanos un mensaje",
    "home.call_us": "Llámanos",
    "home.email_us": "Escríbenos",
    "home.find_us": "Encuéntranos",
    "home.hours": "Lun–Sáb, 9–18 h",
    "home.reply_time": "Respuesta en 24 horas",
    "home.maps_link": "Abrir en Google Maps",
    "home.our_story": "Nuestra historia",
    "home.get_in_touch": "Contáctanos",

    "home.partners_eyebrow": "Con la confianza de",
    "home.partners_heading": "Certificados y Socios",
    "home.newsletter_eyebrow": "Newsletter",
    "home.newsletter_heading": "Inspírate para viajar a Nepal",
    "home.newsletter_desc": "Suscríbete para recibir los últimos paquetes, eventos, consejos de viaje y ofertas exclusivas en tu bandeja de entrada.",

    // About page
    "about.hero_title": "Nuestra historia, nuestras montañas",
    "about.hero_subtitle": "De las casas de té a las cumbres",
    "about.hero_desc": "Nacido en el corazón del Himalaya — impulsado por la pasión de conectar a cada viajero con los picos, senderos y personas más impresionantes de Nepal.",
    "about.years_exp": "25+ años de experiencia",
    "about.years_excellence": "Años de excelencia",
    "about.trek_eyebrow": "Trekking con confianza",
    "about.trek_heading": "Lo que hace únicos nuestros treks",
    "about.feature1_title": "Planificación experta de rutas",
    "about.feature1_desc": "Cada sendero está mapeado por GPS y revisado por guías Sherpa experimentados con décadas en las montañas.",
    "about.feature2_title": "Alojamiento premium en casas de té",
    "about.feature2_desc": "Alojamientos seleccionados a mano a lo largo de la ruta — comidas calientes, duchas calientes y vistas ininterrumpidas a las montañas.",
    "about.feature3_title": "Atención al mal de altura",
    "about.feature3_desc": "Programas de aclimatación, oxímetros en cada trek y planes de evacuación de emergencia en alta montaña.",
    "about.feature4_title": "Treks fotográficos",
    "about.feature4_desc": "Treks dedicados a la fotografía con paradas en la hora dorada en los mejores miradores del Himalaya.",
    "about.values_eyebrow": "Nuestros valores",
    "about.values_heading": "Lo que nos impulsa a la cima",
    "about.timeline_eyebrow": "Nuestro viaje",
    "about.timeline_heading": "Hitos del camino",
    "about.guides_eyebrow": "El equipo de cumbre",
    "about.guides_heading": "Conoce a nuestros líderes de ruta",
    "about.guides_desc": "Cada gran aventura comienza con un guía aún mayor. Nuestro equipo aporta décadas de experiencia himalaya a cada trek.",
    "about.team_eyebrow": "El equipo de oficina",
    "about.team_heading": "Conoce nuestro equipo",
    "about.team_desc": "Las personas detrás de cada reserva, itinerario e historia himalaya — liderazgo y personal desde nuestra oficina de Thamel.",
    "about.cta_eyebrow": "Comienza tu aventura",
    "about.cta_heading": "¿Listo para la cumbre?",
    "about.cta_desc": "Ya seas un trekker primerizo o un montañista experimentado — tu próxima aventura himalaya comienza aquí.",
    "about.cta_explore": "Explorar treks",
    "about.cta_contact": "Contáctanos",

    "tours.hero_title": "Todos los tours",
    "tours.hero_subtitle": "Explorar Nepal",
    "tours.hero_desc": "Desde excursiones de un día hasta treks de varias semanas — encuentra la aventura perfecta para cada viajero.",
    "tours.singular": "tour",
    "tours.plural": "tours",
    "tours.no_tours_cat": "No se encontraron tours en",
    "tours.empty": "No hay tours disponibles ahora mismo. ¡Vuelve pronto!",
    "tours.show_all": "Mostrar todos los tours",
    "tours.cta_heading": "¿No sabes qué elegir? ¡Te ayudamos!",
    "tours.cta_desc": "Nuestros expertos en viajes diseñarán un itinerario personalizado solo para ti.",
    "tours.custom_trip": "Solicitar viaje personalizado",
    "tours.regions": "regiones",

    "events.hero_title": "Próximos Eventos y Experiencias",
    "events.hero_subtitle": "No te lo pierdas",
    "events.hero_desc": "Descubre conciertos, paseos culturales, festivales, clases de cocina y más en Nepal.",
    "events.singular": "evento",
    "events.plural": "eventos",
    "events.show_all": "Mostrar todos los eventos",
    "events.no_events_cat": "No se encontraron eventos en",
    "events.empty": "No hay eventos disponibles ahora mismo. ¡Vuelve pronto!",
    "events.host_heading": "¿Quieres organizar un evento con nosotros?",
    "events.host_desc": "Asóciate con Get Tours para promocionar tu evento ante miles de viajeros y locales.",
  },

  // ─── ITALIAN ───────────────────────────────
  IT: {
    "nav.home": "Home", "nav.about": "Chi siamo", "nav.events": "Eventi",
    "nav.tours": "Tour", "nav.blogs": "Blog", "nav.contact": "Contatti",
    "nav.signin": "Accedi",

    "tour.book": "Prenota questo tour", "tour.book_now": "Prenota",
    "tour.download": "Scarica i dettagli",
    "tour.price_from": "A partire da", "tour.per_person": "a persona",
    "tour.about": "Informazioni sul tour", "tour.highlights": "Punti salienti",
    "tour.gallery": "Galleria", "tour.included": "Cosa è incluso",
    "tour.guide": "La tua guida", "tour.faq": "Domande frequenti",
    "tour.back": "Torna a tutti i tour",
    "tour.destination": "Destinazione", "tour.duration": "Durata",
    "tour.difficulty": "Difficoltà", "tour.activity": "Attività",
    "tour.best_season": "Stagione migliore", "tour.rating": "Valutazione",
    "tour.reviews": "recensioni",

    "event.book": "Acquista biglietti", "event.back": "Torna agli eventi",
    "event.about": "Informazioni sull'evento", "event.highlights": "Punti salienti",
    "event.download": "Scarica i dettagli",
    "event.date": "Data", "event.time": "Orario", "event.venue": "Luogo",
    "event.price": "Prezzo d'ingresso", "event.tickets": "Biglietti disponibili",

    "common.free": "Gratuito", "common.sold_out": "Esaurito",
    "common.contact": "Contattaci", "common.need_help": "Hai bisogno di aiuto?",
    "common.select_date": "Seleziona data", "common.travelers": "Viaggiatori",
    "common.tickets": "Biglietti",
    "common.all_categories": "Tutte le categorie",
    "common.explore_tour": "Esplora tour",
    "common.view_event": "Vedi evento",
    "common.showing": "Visualizzando",
    "common.in": "in",

    "trust.certified": "Agenzia di viaggi certificata",
    "trust.safe": "Sicuro e protetto",
    "trust.support": "Supporto 24/7",
    "trust.guarantee": "Miglior prezzo garantito",

    "home.events_eyebrow": "In corso",
    "home.events_heading": "Ultimi eventi",
    "home.events_desc": "Prossimi festival, esperienze culturali ed eventi locali in tutto il Nepal.",
    "home.events_cta": "Vedi tutti gli eventi",

    "home.tours_eyebrow": "I più scelti",
    "home.tours_heading": "Tour più popolari",
    "home.tours_desc": "Le nostre avventure più prenotate in Nepal, selezionate per ogni tipo di viaggiatore.",
    "home.tours_cta": "Vedi tutti i tour",

    "home.gallery_eyebrow": "Le nostre avventure",
    "home.gallery_heading": "La vita in montagna",

    "home.adventure_eyebrow": "Stili di viaggio",
    "home.adventure_heading": "Trova la tua avventura",

    "home.why_eyebrow": "Perché Get Tours",
    "home.why_heading": "Viaggia con fiducia",
    "home.why_desc": "Uniamo conoscenza locale, pianificazione trasparente e servizio attento affinché il tuo viaggio in Nepal sia entusiasmante dal primo clic all'ultimo giorno.",
    "home.trust1_title": "Verificato e sicuro",
    "home.trust1_desc": "Ogni tour è verificato per la sicurezza. Guide autorizzate, veicoli assicurati e supporto 24/7 durante tutto il viaggio.",
    "home.trust1_stat": "200+ guide autorizzate",
    "home.trust2_title": "Miglior prezzo garantito",
    "home.trust2_desc": "Pareggiamo qualsiasi offerta comparabile. Il miglior rapporto qualità-prezzo senza costi nascosti.",
    "home.trust2_stat": "500+ viaggi abbinati",
    "home.trust3_title": "Esperienza locale",
    "home.trust3_desc": "Il nostro team di esperti locali crea esperienze autentiche. Conosciamo il Nepal come le nostre tasche.",
    "home.trust3_stat": "15 anni di radici locali",

    "home.testimonials_eyebrow": "Testimonianze",
    "home.testimonials_heading": "Storie vere di viaggiatori in Nepal",

    "home.contact_eyebrow": "Contattaci",
    "home.contact_heading": "Pianifica il tuo viaggio in Nepal",
    "home.contact_desc": "Condividi le tue date, lo stile di viaggio o la dimensione del gruppo e il nostro team locale creerà l'itinerario perfetto.",
    "home.contact_cta": "Inviaci un messaggio",
    "home.call_us": "Chiamaci",
    "home.email_us": "Scrivici",
    "home.find_us": "Trovaci",
    "home.hours": "Lun–Sab, 9–18",
    "home.reply_time": "Risposta entro 24 ore",
    "home.maps_link": "Apri in Google Maps",
    "home.our_story": "La nostra storia",
    "home.get_in_touch": "Contattaci",

    "home.partners_eyebrow": "La fiducia di",
    "home.partners_heading": "Certificati e Partner",
    "home.newsletter_eyebrow": "Newsletter",
    "home.newsletter_heading": "Ispirazioni per viaggiare in Nepal",
    "home.newsletter_desc": "Iscriviti per ricevere gli ultimi pacchetti tour, eventi in arrivo, consigli di viaggio e offerte esclusive direttamente nella tua casella di posta.",

    // About page
    "about.hero_title": "La nostra storia, le nostre montagne",
    "about.hero_subtitle": "Dalle case da tè alle vette",
    "about.hero_desc": "Nati nel cuore dell'Himalaya — mossi dalla passione di connettere ogni viaggiatore con le cime, i sentieri e le persone più mozzafiato del Nepal.",
    "about.years_exp": "25+ anni di esperienza",
    "about.years_excellence": "Anni di eccellenza",
    "about.trek_eyebrow": "Trekking in tutta sicurezza",
    "about.trek_heading": "Cosa rende i nostri trek diversi",
    "about.feature1_title": "Pianificazione esperta dei percorsi",
    "about.feature1_desc": "Ogni sentiero è mappato con GPS e verificato da guide Sherpa esperte con decenni sulle montagne.",
    "about.feature2_title": "Soggiorni premium nelle teahouse",
    "about.feature2_desc": "Lodges selezionati con cura lungo il percorso — pasti caldi, docce calde e viste ininterrotte sulle montagne.",
    "about.feature3_title": "Gestione del mal di montagna",
    "about.feature3_desc": "Programmi di acclimatazione, ossimetri su ogni trek e piani di evacuazione di emergenza in alta quota.",
    "about.feature4_title": "Trek fotografici",
    "about.feature4_desc": "Trek dedicati alla fotografia con soste all'ora d'oro nei migliori punti panoramici dell'Himalaya.",
    "about.values_eyebrow": "I nostri valori",
    "about.values_heading": "Cosa ci spinge sulla montagna",
    "about.timeline_eyebrow": "Il nostro percorso",
    "about.timeline_heading": "Tappe fondamentali",
    "about.guides_eyebrow": "Il team della vetta",
    "about.guides_heading": "Incontra i nostri leader di percorso",
    "about.guides_desc": "Ogni grande avventura inizia con una guida ancora più grande. Il nostro team porta decenni di esperienza himalayana in ogni trek.",
    "about.team_eyebrow": "Il team d'ufficio",
    "about.team_heading": "Il nostro team",
    "about.team_desc": "Le persone dietro ogni prenotazione, itinerario e storia himalayana — leadership e staff dal nostro ufficio di Thamel.",
    "about.cta_eyebrow": "Inizia la tua avventura",
    "about.cta_heading": "Pronto per la vetta?",
    "about.cta_desc": "Che tu sia un trekker alle prime armi o un alpinista esperto — la tua prossima avventura himalayana inizia qui.",
    "about.cta_explore": "Esplora i trek",
    "about.cta_contact": "Contattaci",

    "tours.hero_title": "Tutti i tour",
    "tours.hero_subtitle": "Esplora il Nepal",
    "tours.hero_desc": "Dalle escursioni di un giorno ai trekking di più settimane — trova l'avventura perfetta per ogni viaggiatore.",
    "tours.singular": "tour",
    "tours.plural": "tour",
    "tours.no_tours_cat": "Nessun tour trovato in",
    "tours.empty": "Nessun tour disponibile al momento. Torna presto!",
    "tours.show_all": "Mostra tutti i tour",
    "tours.cta_heading": "Non sai scegliere? Ti aiutiamo!",
    "tours.cta_desc": "I nostri esperti di viaggio creeranno un itinerario personalizzato apposta per te.",
    "tours.custom_trip": "Richiedi viaggio personalizzato",
    "tours.regions": "regioni",

    "events.hero_title": "Prossimi eventi ed esperienze",
    "events.hero_subtitle": "Non perderti niente",
    "events.hero_desc": "Concerti, passeggiate culturali, festival, corsi di cucina e molto altro in Nepal.",
    "events.singular": "evento",
    "events.plural": "eventi",
    "events.show_all": "Mostra tutti gli eventi",
    "events.no_events_cat": "Nessun evento trovato in",
    "events.empty": "Nessun evento disponibile al momento. Torna presto!",
    "events.host_heading": "Vuoi organizzare un evento con noi?",
    "events.host_desc": "Collabora con Get Tours per promuovere il tuo evento a migliaia di viaggiatori e locali.",
  },

  // ─── JAPANESE ──────────────────────────────
  JA: {
    "nav.home": "ホーム", "nav.about": "私たちについて", "nav.events": "イベント",
    "nav.tours": "ツアー", "nav.blogs": "ブログ", "nav.contact": "お問い合わせ",
    "nav.signin": "サインイン",

    "tour.book": "このツアーを予約", "tour.book_now": "今すぐ予約",
    "tour.download": "ツアー詳細をダウンロード",
    "tour.price_from": "料金", "tour.per_person": "お一人様あたり",
    "tour.about": "このツアーについて", "tour.highlights": "ツアーのハイライト",
    "tour.gallery": "ギャラリー", "tour.included": "含まれるもの",
    "tour.guide": "あなたのガイド", "tour.faq": "よくある質問",
    "tour.back": "全ツアーに戻る",
    "tour.destination": "目的地", "tour.duration": "期間",
    "tour.difficulty": "難易度", "tour.activity": "アクティビティ",
    "tour.best_season": "ベストシーズン", "tour.rating": "評価",
    "tour.reviews": "レビュー",

    "event.book": "チケットを購入", "event.back": "全イベントに戻る",
    "event.about": "このイベントについて", "event.highlights": "ハイライト",
    "event.download": "イベント詳細をダウンロード",
    "event.date": "日付", "event.time": "時間", "event.venue": "会場",
    "event.price": "入場料", "event.tickets": "残席",

    "common.free": "無料", "common.sold_out": "売り切れ",
    "common.contact": "お問い合わせ", "common.need_help": "旅のご相談はこちら",
    "common.select_date": "日付を選択", "common.travelers": "旅行者",
    "common.tickets": "チケット",
    "common.all_categories": "全カテゴリ",
    "common.explore_tour": "ツアーを見る",
    "common.view_event": "イベントを見る",
    "common.showing": "表示中",
    "common.in": "の",

    "trust.certified": "認定旅行代理店",
    "trust.safe": "安全・安心",
    "trust.support": "24時間サポート",
    "trust.guarantee": "最低価格保証",

    "home.events_eyebrow": "開催中",
    "home.events_heading": "最新イベント",
    "home.events_desc": "ネパール各地で開催される祭り、文化体験、地域イベントをご紹介。",
    "home.events_cta": "全イベントを見る",

    "home.tours_eyebrow": "人気のツアー",
    "home.tours_heading": "人気のツアーパッケージ",
    "home.tours_desc": "あらゆる旅行者に向けて厳選した、ネパールで最も予約の多い冒険コース。",
    "home.tours_cta": "全ツアーを見る",

    "home.gallery_eyebrow": "私たちの冒険",
    "home.gallery_heading": "山での生活",

    "home.adventure_eyebrow": "旅のスタイル",
    "home.adventure_heading": "あなたの冒険を見つけよう",

    "home.why_eyebrow": "Get Toursを選ぶ理由",
    "home.why_heading": "安心して旅しよう",
    "home.why_desc": "現地の知識、透明な計画、心のこもったサービスで、最初のクリックから最終日まで、ネパール旅行をワクワクするものにします。",
    "home.trust1_title": "認定・安全",
    "home.trust1_desc": "すべてのツアーは安全性を確認済み。ライセンス取得ガイド、保険付き車両、旅行中の24時間サポート。",
    "home.trust1_stat": "200人以上のライセンスガイド",
    "home.trust2_title": "最低価格保証",
    "home.trust2_desc": "同等のオファーに対応します。隠れた費用なしでネパールの冒険を最高の価格でお届け。",
    "home.trust2_stat": "500件以上の旅行を比較",
    "home.trust3_title": "現地の専門知識",
    "home.trust3_desc": "現地専門家チームが本物の体験を提供。ネパールを知り尽くしています。",
    "home.trust3_stat": "15年の現地実績",

    "home.testimonials_eyebrow": "お客様の声",
    "home.testimonials_heading": "ネパール旅行者のリアルな声",

    "home.contact_eyebrow": "お問い合わせ",
    "home.contact_heading": "ネパール旅行を計画しよう",
    "home.contact_desc": "旅行日程・スタイル・グループ人数をお知らせください。現地チームが最適な旅程をご提案します。",
    "home.contact_cta": "メッセージを送る",
    "home.call_us": "電話する",
    "home.email_us": "メールする",
    "home.find_us": "場所を確認",
    "home.hours": "月〜土 9:00〜18:00",
    "home.reply_time": "24時間以内に返信",
    "home.maps_link": "Google マップで開く",
    "home.our_story": "私たちのストーリー",
    "home.get_in_touch": "お問い合わせ",

    "home.partners_eyebrow": "信頼のパートナー",
    "home.partners_heading": "認定証・パートナー",
    "home.newsletter_eyebrow": "ニュースレター",
    "home.newsletter_heading": "ネパール旅行のインスピレーション",
    "home.newsletter_desc": "最新のツアーパッケージ、イベント、旅行情報、お得な情報をメールでお届けします。",

    // About page
    "about.hero_title": "私たちの物語、私たちの山々",
    "about.hero_subtitle": "ティーハウスから山頂へ",
    "about.hero_desc": "ヒマラヤの中心で生まれ、すべての旅人とネパールの息をのむような峰々、トレイル、人々をつなぐ情熱に突き動かされています。",
    "about.years_exp": "25年以上の経験",
    "about.years_excellence": "年間の実績",
    "about.trek_eyebrow": "安心してトレッキング",
    "about.trek_heading": "私たちのトレッキングが違う理由",
    "about.feature1_title": "専門家によるルート計画",
    "about.feature1_desc": "すべてのトレイルはGPSでマッピングされ、山岳経験豊富なシェルパガイドが確認しています。",
    "about.feature2_title": "プレミアムティーハウス滞在",
    "about.feature2_desc": "厳選されたロッジ — 温かい食事、シャワー、そして遮るもののない山の景色。",
    "about.feature3_title": "高山病ケア",
    "about.feature3_desc": "順応スケジュール、トレッキングごとの酸素測定器、高地での緊急避難計画を完備。",
    "about.feature4_title": "写真撮影トレッキング",
    "about.feature4_desc": "最高のヒマラヤ展望台でのゴールデンアワー停止を含む、写真撮影に特化したトレッキング。",
    "about.values_eyebrow": "私たちの価値観",
    "about.values_heading": "山を登る原動力",
    "about.timeline_eyebrow": "私たちの歩み",
    "about.timeline_heading": "主要な節目",
    "about.guides_eyebrow": "サミットクルー",
    "about.guides_heading": "トレイルリーダーを紹介",
    "about.guides_desc": "すべての素晴らしい冒険は、さらに偉大なガイドから始まります。私たちのチームは数十年のヒマラヤ経験を各トレッキングに活かします。",
    "about.team_eyebrow": "オフィスクルー",
    "about.team_heading": "チームを紹介",
    "about.team_desc": "すべての予約、旅程、ヒマラヤストーリーを支える人々 — タメルオフィスで働くリーダーシップとスタッフ。",
    "about.cta_eyebrow": "冒険を始めよう",
    "about.cta_heading": "山頂への準備はできていますか？",
    "about.cta_desc": "初めてのトレッカーでも経験豊富な登山家でも — あなたの次のヒマラヤ冒険はここから始まります。",
    "about.cta_explore": "トレッキングを探す",
    "about.cta_contact": "お問い合わせ",

    "tours.hero_title": "全ツアーパッケージ",
    "tours.hero_subtitle": "ネパールを探索",
    "tours.hero_desc": "日帰りから数週間のトレッキングまで — あらゆる旅行者に最適な冒険を見つけよう。",
    "tours.singular": "ツアー",
    "tours.plural": "ツアー",
    "tours.no_tours_cat": "ツアーが見つかりません：",
    "tours.empty": "現在利用可能なツアーはありません。また後でご確認ください！",
    "tours.show_all": "全ツアーを表示",
    "tours.cta_heading": "迷っていますか？お手伝いします！",
    "tours.cta_desc": "旅行の専門家があなただけのオリジナル旅程を作成します。",
    "tours.custom_trip": "カスタム旅行を相談",
    "tours.regions": "地域",

    "events.hero_title": "今後のイベント＆体験",
    "events.hero_subtitle": "お見逃しなく",
    "events.hero_desc": "ネパール各地で開催されるコンサート、文化散策、フェスティバル、料理教室などをご紹介。",
    "events.singular": "イベント",
    "events.plural": "イベント",
    "events.show_all": "全イベントを表示",
    "events.no_events_cat": "イベントが見つかりません：",
    "events.empty": "現在利用可能なイベントはありません。また後でご確認ください！",
    "events.host_heading": "私たちとイベントを開催しませんか？",
    "events.host_desc": "Get Toursと提携して、あなたのイベントを何千人もの旅行者や地元の人々にアピールしましょう。",
  },

  // ─── RUSSIAN ───────────────────────────────
  RU: {
    "nav.home": "Главная", "nav.about": "О нас", "nav.events": "События",
    "nav.tours": "Туры", "nav.blogs": "Блог", "nav.contact": "Контакты",
    "nav.signin": "Войти",

    "tour.book": "Забронировать тур", "tour.book_now": "Забронировать",
    "tour.download": "Скачать детали тура",
    "tour.price_from": "От", "tour.per_person": "на человека",
    "tour.about": "О туре", "tour.highlights": "Основные моменты",
    "tour.gallery": "Галерея", "tour.included": "Что включено",
    "tour.guide": "Ваш гид", "tour.faq": "Часто задаваемые вопросы",
    "tour.back": "Ко всем турам",
    "tour.destination": "Направление", "tour.duration": "Продолжительность",
    "tour.difficulty": "Сложность", "tour.activity": "Активность",
    "tour.best_season": "Лучший сезон", "tour.rating": "Рейтинг",
    "tour.reviews": "отзывов",

    "event.book": "Купить билеты", "event.back": "Ко всем событиям",
    "event.about": "О мероприятии", "event.highlights": "Основные моменты",
    "event.download": "Скачать детали",
    "event.date": "Дата", "event.time": "Время", "event.venue": "Место",
    "event.price": "Цена входа", "event.tickets": "Доступно билетов",

    "common.free": "Бесплатно", "common.sold_out": "Распродано",
    "common.contact": "Связаться с нами", "common.need_help": "Нужна помощь в планировании?",
    "common.select_date": "Выбрать дату", "common.travelers": "Путешественники",
    "common.tickets": "Билеты",
    "common.all_categories": "Все категории",
    "common.explore_tour": "Изучить тур",
    "common.view_event": "Посмотреть событие",
    "common.showing": "Показано",
    "common.in": "в",

    "trust.certified": "Сертифицированное турагентство",
    "trust.safe": "Безопасно и надёжно",
    "trust.support": "Поддержка 24/7",
    "trust.guarantee": "Гарантия лучшей цены",

    "home.events_eyebrow": "Что происходит",
    "home.events_heading": "Последние события",
    "home.events_desc": "Предстоящие фестивали, культурные мероприятия и местные события по всему Непалу.",
    "home.events_cta": "Все события",

    "home.tours_eyebrow": "Популярные",
    "home.tours_heading": "Популярные туры",
    "home.tours_desc": "Наши самые популярные приключения в Непале — тщательно подобранные для любого путешественника.",
    "home.tours_cta": "Все туры",

    "home.gallery_eyebrow": "Наши приключения",
    "home.gallery_heading": "Жизнь в горах",

    "home.adventure_eyebrow": "Стили путешествий",
    "home.adventure_heading": "Найдите своё приключение",

    "home.why_eyebrow": "Почему Get Tours",
    "home.why_heading": "Путешествуй с уверенностью",
    "home.why_desc": "Мы сочетаем местные знания, прозрачное планирование и внимательный сервис, чтобы ваша поездка в Непал была захватывающей с первого клика до последнего дня.",
    "home.trust1_title": "Проверено и безопасно",
    "home.trust1_desc": "Каждый тур проверен на безопасность. Лицензированные гиды, застрахованные автомобили и поддержка 24/7 на протяжении всей поездки.",
    "home.trust1_stat": "200+ лицензированных гидов",
    "home.trust2_title": "Гарантия лучшей цены",
    "home.trust2_desc": "Мы соответствуем любому сопоставимому предложению. Лучшая стоимость вашего непальского приключения без скрытых платежей.",
    "home.trust2_stat": "500+ поездок сравнено",
    "home.trust3_title": "Местная экспертиза",
    "home.trust3_desc": "Наша команда местных экспертов создаёт аутентичные впечатления. Мы знаем Непал как свои пять пальцев.",
    "home.trust3_stat": "15 лет местных корней",

    "home.testimonials_eyebrow": "Отзывы",
    "home.testimonials_heading": "Реальные истории путешественников по Непалу",

    "home.contact_eyebrow": "Связаться с нами",
    "home.contact_heading": "Спланируйте путешествие в Непал",
    "home.contact_desc": "Поделитесь датами, стилем путешествия или размером группы, и наша местная команда составит идеальный маршрут.",
    "home.contact_cta": "Написать нам",
    "home.call_us": "Позвонить",
    "home.email_us": "Написать письмо",
    "home.find_us": "Найти нас",
    "home.hours": "Пн–Сб, 9:00–18:00",
    "home.reply_time": "Ответ в течение 24 часов",
    "home.maps_link": "Открыть в Google Maps",
    "home.our_story": "Наша история",
    "home.get_in_touch": "Связаться",

    "home.partners_eyebrow": "Нам доверяют",
    "home.partners_heading": "Сертификаты и партнёры",
    "home.newsletter_eyebrow": "Рассылка",
    "home.newsletter_heading": "Вдохновение для путешествий в Непал",
    "home.newsletter_desc": "Подпишитесь, чтобы получать последние туры, предстоящие события, советы путешественника и эксклюзивные предложения прямо на почту.",

    // About page
    "about.hero_title": "Наша история, наши горы",
    "about.hero_subtitle": "От чайных домиков до вершин",
    "about.hero_desc": "Рождённые в сердце Гималаев — движимые страстью связывать каждого путешественника с самыми захватывающими пиками, тропами и людьми Непала.",
    "about.years_exp": "25+ лет опыта",
    "about.years_excellence": "Лет превосходства",
    "about.trek_eyebrow": "Трекинг с уверенностью",
    "about.trek_heading": "Что делает наши треки особенными",
    "about.feature1_title": "Экспертное планирование маршрутов",
    "about.feature1_desc": "Каждая тропа GPS-картирована и проверена опытными гидами-шерпами с десятилетиями горного опыта.",
    "about.feature2_title": "Премиальное проживание в чайных домиках",
    "about.feature2_desc": "Тщательно отобранные lodge вдоль маршрута — горячее питание, горячие душевые и непрерывные виды на горы.",
    "about.feature3_title": "Помощь при горной болезни",
    "about.feature3_desc": "Графики акклиматизации, пульсоксиметры на каждом треке и планы экстренной эвакуации на большой высоте.",
    "about.feature4_title": "Фотографические треки",
    "about.feature4_desc": "Специализированные треки с остановками в «золотой час» на лучших смотровых площадках Гималаев.",
    "about.values_eyebrow": "Наши ценности",
    "about.values_heading": "Что движет нами в горы",
    "about.timeline_eyebrow": "Наш путь",
    "about.timeline_heading": "Вехи пути",
    "about.guides_eyebrow": "Команда вершины",
    "about.guides_heading": "Познакомьтесь с нашими лидерами",
    "about.guides_desc": "Каждое великое приключение начинается с ещё более великого гида. Наша команда привносит десятилетия гималайского опыта в каждый трек.",
    "about.team_eyebrow": "Офисная команда",
    "about.team_heading": "Наша команда",
    "about.team_desc": "Люди, стоящие за каждым бронированием, маршрутом и гималайской историей — руководство и сотрудники нашего офиса в Тамеле.",
    "about.cta_eyebrow": "Начните своё приключение",
    "about.cta_heading": "Готовы к вершине?",
    "about.cta_desc": "Будь вы начинающим туристом или опытным альпинистом — ваше следующее гималайское приключение начинается здесь.",
    "about.cta_explore": "Исследовать треки",
    "about.cta_contact": "Связаться",

    "tours.hero_title": "Все туры",
    "tours.hero_subtitle": "Исследуй Непал",
    "tours.hero_desc": "От однодневных поездок до многонедельных треккингов — найдите идеальное приключение для каждого путешественника.",
    "tours.singular": "тур",
    "tours.plural": "туров",
    "tours.no_tours_cat": "Туры не найдены в",
    "tours.empty": "Туров пока нет. Загляните позже!",
    "tours.show_all": "Показать все туры",
    "tours.cta_heading": "Не можете определиться? Мы поможем!",
    "tours.cta_desc": "Наши эксперты составят персональный маршрут специально для вас.",
    "tours.custom_trip": "Запросить индивидуальный тур",
    "tours.regions": "регионов",

    "events.hero_title": "Предстоящие события и впечатления",
    "events.hero_subtitle": "Не пропустите",
    "events.hero_desc": "Концерты, культурные прогулки, фестивали, кулинарные классы и многое другое по всему Непалу.",
    "events.singular": "событие",
    "events.plural": "событий",
    "events.show_all": "Показать все события",
    "events.no_events_cat": "События не найдены в",
    "events.empty": "Событий пока нет. Загляните позже!",
    "events.host_heading": "Хотите провести мероприятие с нами?",
    "events.host_desc": "Сотрудничайте с Get Tours, чтобы продвигать ваше мероприятие среди тысяч путешественников и местных жителей.",
  },

  // ─── CHINESE (Simplified) ──────────────────
  ZH: {
    "nav.home": "首页", "nav.about": "关于我们", "nav.events": "活动",
    "nav.tours": "旅游", "nav.blogs": "博客", "nav.contact": "联系我们",
    "nav.signin": "登录",

    "tour.book": "预订此行程", "tour.book_now": "立即预订",
    "tour.download": "下载行程详情",
    "tour.price_from": "起价", "tour.per_person": "每人",
    "tour.about": "关于此行程", "tour.highlights": "行程亮点",
    "tour.gallery": "图库", "tour.included": "包含内容",
    "tour.guide": "您的导游", "tour.faq": "常见问题",
    "tour.back": "返回所有行程",
    "tour.destination": "目的地", "tour.duration": "行程时长",
    "tour.difficulty": "难度", "tour.activity": "活动类型",
    "tour.best_season": "最佳季节", "tour.rating": "评分",
    "tour.reviews": "条评价",

    "event.book": "购买门票", "event.back": "返回所有活动",
    "event.about": "关于此活动", "event.highlights": "活动亮点",
    "event.download": "下载活动详情",
    "event.date": "日期", "event.time": "时间", "event.venue": "地点",
    "event.price": "门票价格", "event.tickets": "可用票数",

    "common.free": "免费", "common.sold_out": "已售罄",
    "common.contact": "联系我们", "common.need_help": "需要旅行规划帮助？",
    "common.select_date": "选择日期", "common.travelers": "旅行者",
    "common.tickets": "票",
    "common.all_categories": "所有分类",
    "common.explore_tour": "浏览行程",
    "common.view_event": "查看活动",
    "common.showing": "显示",
    "common.in": "在",

    "trust.certified": "认证旅行社",
    "trust.safe": "安全可靠",
    "trust.support": "24/7全天支持",
    "trust.guarantee": "最低价格保证",

    "home.events_eyebrow": "正在进行",
    "home.events_heading": "最新活动",
    "home.events_desc": "尼泊尔各地即将举办的节日、文化体验和本地活动。",
    "home.events_cta": "查看所有活动",

    "home.tours_eyebrow": "热门推荐",
    "home.tours_heading": "热门旅游套餐",
    "home.tours_desc": "我们在尼泊尔最受欢迎的冒险旅程——专为各类旅行者精心挑选。",
    "home.tours_cta": "查看所有行程",

    "home.gallery_eyebrow": "我们的冒险",
    "home.gallery_heading": "山间生活",

    "home.adventure_eyebrow": "旅行风格",
    "home.adventure_heading": "寻找您的冒险",

    "home.why_eyebrow": "为什么选择Get Tours",
    "home.why_heading": "放心出行",
    "home.why_desc": "我们融合本地知识、透明规划和贴心服务，让您的尼泊尔之旅从第一次点击到最后一天都充满期待。",
    "home.trust1_title": "认证 & 安全",
    "home.trust1_desc": "每条路线均经过安全审核。持证导游、保险车辆及全程24/7支持。",
    "home.trust1_stat": "200+名持证导游",
    "home.trust2_title": "最低价格保证",
    "home.trust2_desc": "我们匹配任何同类报价。最优价值，无任何隐藏费用。",
    "home.trust2_stat": "500+次行程比价",
    "home.trust3_title": "本地专业知识",
    "home.trust3_desc": "我们的本地专家团队打造真实体验，对尼泊尔了如指掌。",
    "home.trust3_stat": "15年本地根基",

    "home.testimonials_eyebrow": "旅客评价",
    "home.testimonials_heading": "尼泊尔旅行者的真实故事",

    "home.contact_eyebrow": "联系我们",
    "home.contact_heading": "规划您的尼泊尔之旅",
    "home.contact_desc": "告诉我们您的日期、旅行风格或团队规模，我们的本地团队将为您量身定制完美行程。",
    "home.contact_cta": "发送消息",
    "home.call_us": "致电我们",
    "home.email_us": "发送邮件",
    "home.find_us": "找到我们",
    "home.hours": "周一至周六，上午9点–下午6点",
    "home.reply_time": "24小时内回复",
    "home.maps_link": "在Google地图中打开",
    "home.our_story": "我们的故事",
    "home.get_in_touch": "联系我们",

    "home.partners_eyebrow": "信任我们",
    "home.partners_heading": "证书与合作伙伴",
    "home.newsletter_eyebrow": "新闻订阅",
    "home.newsletter_heading": "获取尼泊尔旅行灵感",
    "home.newsletter_desc": "订阅获取最新旅游套餐、即将举办的活动、旅行贴士及专属优惠，直达您的邮箱。",

    // About page
    "about.hero_title": "我们的故事，我们的山脉",
    "about.hero_subtitle": "从茶馆到山顶",
    "about.hero_desc": "诞生于喜马拉雅山的心脏地带——我们怀着连接每位旅行者与尼泊尔最壮观山峰、小径和人民的热情前行。",
    "about.years_exp": "25年以上经验",
    "about.years_excellence": "年卓越历史",
    "about.trek_eyebrow": "放心徒步",
    "about.trek_heading": "我们的徒步有何不同",
    "about.feature1_title": "专家路线规划",
    "about.feature1_desc": "每条步道均经GPS测绘，并由具有数十年山地经验的夏尔巴向导审查。",
    "about.feature2_title": "高端茶馆住宿",
    "about.feature2_desc": "精心挑选的沿途旅馆——热腾腾的饭菜、热水淋浴和无遮挡的山景。",
    "about.feature3_title": "高原反应护理",
    "about.feature3_desc": "科学的高原适应计划、每次徒步配备血氧仪，以及高海拔紧急疏散预案。",
    "about.feature4_title": "摄影徒步",
    "about.feature4_desc": "专为摄影爱好者设计的徒步路线，在最佳喜马拉雅观景点安排黄金时段拍摄。",
    "about.values_eyebrow": "我们的价值观",
    "about.values_heading": "驱动我们攀登的力量",
    "about.timeline_eyebrow": "我们的历程",
    "about.timeline_heading": "里程碑",
    "about.guides_eyebrow": "登顶团队",
    "about.guides_heading": "认识我们的向导领队",
    "about.guides_desc": "每次伟大的冒险都从一位更伟大的向导开始。我们的团队将数十年的喜马拉雅经验带入每次徒步。",
    "about.team_eyebrow": "办公室团队",
    "about.team_heading": "认识我们的团队",
    "about.team_desc": "每一次预订、行程和喜马拉雅故事背后的人——在我们塔美尔办公室工作的领导层和员工。",
    "about.cta_eyebrow": "开始您的探险",
    "about.cta_heading": "准备好登顶了吗？",
    "about.cta_desc": "无论您是初次徒步者还是经验丰富的登山者——您的下一次喜马拉雅探险从这里开始。",
    "about.cta_explore": "探索徒步路线",
    "about.cta_contact": "联系我们",

    "tours.hero_title": "全部旅游套餐",
    "tours.hero_subtitle": "探索尼泊尔",
    "tours.hero_desc": "从一日游到多周徒步——为每位旅行者找到完美的冒险体验。",
    "tours.singular": "条行程",
    "tours.plural": "条行程",
    "tours.no_tours_cat": "未找到行程：",
    "tours.empty": "暂无可用行程，请稍后查看！",
    "tours.show_all": "显示所有行程",
    "tours.cta_heading": "无法决定？让我们帮您！",
    "tours.cta_desc": "我们的旅行专家将为您量身打造个性化行程。",
    "tours.custom_trip": "获取定制行程",
    "tours.regions": "个地区",

    "events.hero_title": "即将举办的活动与体验",
    "events.hero_subtitle": "不要错过",
    "events.hero_desc": "发现尼泊尔各地举办的音乐会、文化漫步、节日、烹饪课等活动。",
    "events.singular": "项活动",
    "events.plural": "项活动",
    "events.show_all": "显示所有活动",
    "events.no_events_cat": "未找到活动：",
    "events.empty": "暂无可用活动，请稍后查看！",
    "events.host_heading": "想与我们合办活动？",
    "events.host_desc": "与Get Tours合作，向数千名旅行者和当地人推广您的活动。",
  },

  // ─── HINDI ─────────────────────────────────
  HI: {
    "nav.home": "होम", "nav.about": "हमारे बारे में", "nav.events": "कार्यक्रम",
    "nav.tours": "टूर", "nav.blogs": "ब्लॉग", "nav.contact": "संपर्क करें",
    "nav.signin": "साइन इन",

    "tour.book": "यह टूर बुक करें", "tour.book_now": "अभी बुक करें",
    "tour.download": "टूर विवरण डाउनलोड करें",
    "tour.price_from": "शुरुआती कीमत", "tour.per_person": "प्रति व्यक्ति",
    "tour.about": "इस टूर के बारे में", "tour.highlights": "टूर की खासियतें",
    "tour.gallery": "गैलरी", "tour.included": "क्या शामिल है",
    "tour.guide": "आपका गाइड", "tour.faq": "अक्सर पूछे जाने वाले प्रश्न",
    "tour.back": "सभी टूर पर वापस जाएं",
    "tour.destination": "गंतव्य", "tour.duration": "अवधि",
    "tour.difficulty": "कठिनाई", "tour.activity": "गतिविधि",
    "tour.best_season": "सर्वश्रेष्ठ मौसम", "tour.rating": "रेटिंग",
    "tour.reviews": "समीक्षाएं",

    "event.book": "टिकट बुक करें", "event.back": "सभी कार्यक्रमों पर वापस जाएं",
    "event.about": "इस कार्यक्रम के बारे में", "event.highlights": "कार्यक्रम की खासियतें",
    "event.download": "कार्यक्रम विवरण डाउनलोड करें",
    "event.date": "तारीख", "event.time": "समय", "event.venue": "स्थान",
    "event.price": "प्रवेश मूल्य", "event.tickets": "उपलब्ध टिकट",

    "common.free": "मुफ़्त", "common.sold_out": "बिक चुका है",
    "common.contact": "हमसे संपर्क करें", "common.need_help": "यात्रा योजना में मदद चाहिए?",
    "common.select_date": "तारीख चुनें", "common.travelers": "यात्री",
    "common.tickets": "टिकट",
    "common.all_categories": "सभी श्रेणियां",
    "common.explore_tour": "टूर देखें",
    "common.view_event": "कार्यक्रम देखें",
    "common.showing": "दिखा रहे हैं",
    "common.in": "में",

    "trust.certified": "प्रमाणित ट्रैवल एजेंसी",
    "trust.safe": "सुरक्षित और भरोसेमंद",
    "trust.support": "24/7 सहायता",
    "trust.guarantee": "सर्वश्रेष्ठ मूल्य गारंटी",

    "home.events_eyebrow": "क्या हो रहा है",
    "home.events_heading": "नवीनतम कार्यक्रम",
    "home.events_desc": "नेपाल भर में आने वाले त्योहार, सांस्कृतिक अनुभव और स्थानीय आयोजन।",
    "home.events_cta": "सभी कार्यक्रम देखें",

    "home.tours_eyebrow": "सर्वश्रेष्ठ चुनाव",
    "home.tours_heading": "लोकप्रिय टूर पैकेज",
    "home.tours_desc": "नेपाल में हमारे सबसे बुक किए गए साहसिक टूर — हर यात्री के लिए सावधानीपूर्वक चुने गए।",
    "home.tours_cta": "सभी टूर देखें",

    "home.gallery_eyebrow": "हमारे साहसिक कार्य",
    "home.gallery_heading": "पहाड़ों में जीवन",

    "home.adventure_eyebrow": "यात्रा शैली",
    "home.adventure_heading": "अपना साहसिक कार्य खोजें",

    "home.why_eyebrow": "Get Tours क्यों चुनें",
    "home.why_heading": "विश्वास के साथ यात्रा करें",
    "home.why_desc": "हम स्थानीय ज्ञान, पारदर्शी योजना और विचारशील सेवा को मिलाकर आपकी नेपाल यात्रा को पहले क्लिक से अंतिम दिन तक रोमांचक बनाते हैं।",
    "home.trust1_title": "सत्यापित और सुरक्षित",
    "home.trust1_desc": "हर टूर की सुरक्षा जांच की जाती है। लाइसेंसधारी गाइड, बीमाकृत वाहन और पूरी यात्रा में 24/7 सहायता।",
    "home.trust1_stat": "200+ लाइसेंसधारी गाइड",
    "home.trust2_title": "सर्वश्रेष्ठ मूल्य गारंटी",
    "home.trust2_desc": "हम किसी भी तुलनीय प्रस्ताव से मेल खाते हैं। बिना किसी छुपे शुल्क के नेपाल यात्रा का सर्वोत्तम मूल्य।",
    "home.trust2_stat": "500+ यात्राएं मिलान की गईं",
    "home.trust3_title": "स्थानीय विशेषज्ञता",
    "home.trust3_desc": "हमारी स्थानीय विशेषज्ञों की टीम प्रामाणिक अनुभव तैयार करती है। हम नेपाल को अपनी हथेली की तरह जानते हैं।",
    "home.trust3_stat": "15 साल की स्थानीय जड़ें",

    "home.testimonials_eyebrow": "प्रशंसापत्र",
    "home.testimonials_heading": "नेपाल यात्रियों की वास्तविक कहानियां",

    "home.contact_eyebrow": "संपर्क करें",
    "home.contact_heading": "अपनी नेपाल यात्रा की योजना बनाएं",
    "home.contact_desc": "अपनी तारीखें, यात्रा शैली या समूह का आकार साझा करें और हमारी स्थानीय टीम आपके लिए सही यात्रा कार्यक्रम तैयार करेगी।",
    "home.contact_cta": "हमें संदेश भेजें",
    "home.call_us": "हमें कॉल करें",
    "home.email_us": "हमें ईमेल करें",
    "home.find_us": "हमें खोजें",
    "home.hours": "सोम–शनि, सुबह 9 बजे – शाम 6 बजे",
    "home.reply_time": "24 घंटे में जवाब",
    "home.maps_link": "Google Maps में खोलें",
    "home.our_story": "हमारी कहानी",
    "home.get_in_touch": "संपर्क करें",

    "home.partners_eyebrow": "हम पर भरोसा",
    "home.partners_heading": "प्रमाण पत्र और साझेदार",
    "home.newsletter_eyebrow": "न्यूज़लेटर",
    "home.newsletter_heading": "नेपाल यात्रा की प्रेरणा पाएं",
    "home.newsletter_desc": "नवीनतम टूर पैकेज, आगामी कार्यक्रम, यात्रा टिप्स और विशेष ऑफर सीधे अपने इनबॉक्स में पाने के लिए सदस्यता लें।",

    // About page
    "about.hero_title": "हमारी कहानी, हमारे पहाड़",
    "about.hero_subtitle": "चाय के घरों से चोटियों तक",
    "about.hero_desc": "हिमालय के दिल में जन्मे — हर यात्री को नेपाल की सबसे खूबसूरत चोटियों, ट्रेल्स और लोगों से जोड़ने के जुनून से प्रेरित।",
    "about.years_exp": "25+ वर्षों का अनुभव",
    "about.years_excellence": "वर्षों की उत्कृष्टता",
    "about.trek_eyebrow": "विश्वास के साथ ट्रेक करें",
    "about.trek_heading": "हमारे ट्रेक क्यों अलग हैं",
    "about.feature1_title": "विशेषज्ञ रूट प्लानिंग",
    "about.feature1_desc": "हर ट्रेल GPS-मैप्ड है और दशकों के अनुभव वाले शेरपा गाइड द्वारा समीक्षा की गई है।",
    "about.feature2_title": "प्रीमियम टी-हाउस स्टे",
    "about.feature2_desc": "रूट के साथ हाथ से चुने गए लॉज — गर्म भोजन, गर्म शॉवर, और बेरोक पहाड़ी नज़ारे।",
    "about.feature3_title": "ऊंचाई की बीमारी की देखभाल",
    "about.feature3_desc": "हर ट्रेक पर एक्लिमेटाइजेशन शेड्यूल, ऑक्सीमीटर, और उच्च ऊंचाई पर आपातकालीन निकासी योजनाएं।",
    "about.feature4_title": "फोटोग्राफी ट्रेक",
    "about.feature4_desc": "सर्वश्रेष्ठ हिमालय व्यूपॉइंट पर गोल्डन आवर स्टॉप के साथ फोटोग्राफी-केंद्रित ट्रेक।",
    "about.values_eyebrow": "हमारे मूल्य",
    "about.values_heading": "जो हमें पहाड़ पर ले जाता है",
    "about.timeline_eyebrow": "हमारी यात्रा",
    "about.timeline_heading": "ट्रेल माइलस्टोन",
    "about.guides_eyebrow": "समिट क्रू",
    "about.guides_heading": "हमारे ट्रेल लीडर से मिलें",
    "about.guides_desc": "हर महान साहसिक यात्रा एक और भी महान गाइड से शुरू होती है। हमारी टीम हर ट्रेक में दशकों का हिमालय अनुभव लाती है।",
    "about.team_eyebrow": "ऑफिस क्रू",
    "about.team_heading": "हमारी टीम से मिलें",
    "about.team_desc": "हर बुकिंग, यात्रा कार्यक्रम और हिमालय की कहानी के पीछे के लोग — हमारे थमेल ऑफिस से काम करने वाले नेतृत्व और कर्मचारी।",
    "about.cta_eyebrow": "अपना साहसिक कार्य शुरू करें",
    "about.cta_heading": "शिखर के लिए तैयार?",
    "about.cta_desc": "चाहे आप पहली बार ट्रेकर हों या अनुभवी पर्वतारोही — आपकी अगली हिमालय साहसिक यात्रा यहाँ से शुरू होती है।",
    "about.cta_explore": "ट्रेक खोजें",
    "about.cta_contact": "संपर्क करें",

    "tours.hero_title": "सभी टूर पैकेज",
    "tours.hero_subtitle": "नेपाल को एक्सप्लोर करें",
    "tours.hero_desc": "एक दिन की यात्राओं से लेकर बहु-सप्ताह के ट्रेक तक — हर यात्री के लिए सही साहसिक कार्य खोजें।",
    "tours.singular": "टूर",
    "tours.plural": "टूर",
    "tours.no_tours_cat": "इसमें कोई टूर नहीं मिला",
    "tours.empty": "अभी कोई टूर उपलब्ध नहीं है। जल्द वापस जांचें!",
    "tours.show_all": "सभी टूर दिखाएं",
    "tours.cta_heading": "निर्णय नहीं कर पा रहे? हम मदद करेंगे!",
    "tours.cta_desc": "हमारे यात्रा विशेषज्ञ आपके लिए एक व्यक्तिगत यात्रा कार्यक्रम तैयार करेंगे।",
    "tours.custom_trip": "कस्टम यात्रा पाएं",
    "tours.regions": "क्षेत्र",

    "events.hero_title": "आगामी कार्यक्रम और अनुभव",
    "events.hero_subtitle": "कुछ न छोड़ें",
    "events.hero_desc": "नेपाल भर में होने वाले संगीत समारोह, सांस्कृतिक सैर, त्योहार, कुकिंग क्लास और बहुत कुछ खोजें।",
    "events.singular": "कार्यक्रम",
    "events.plural": "कार्यक्रम",
    "events.show_all": "सभी कार्यक्रम दिखाएं",
    "events.no_events_cat": "इसमें कोई कार्यक्रम नहीं मिला",
    "events.empty": "अभी कोई कार्यक्रम उपलब्ध नहीं है। जल्द वापस जांचें!",
    "events.host_heading": "हमारे साथ कार्यक्रम आयोजित करना चाहते हैं?",
    "events.host_desc": "हजारों यात्रियों और स्थानीय लोगों को अपने कार्यक्रम से परिचित कराने के लिए Get Tours के साथ साझेदारी करें।",
  },
};

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
interface TranslationContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: string) => string;
  geoCurrency: CurrencyCode | null;
}

const TranslationContext = createContext<TranslationContextValue>({
  lang: "EN",
  setLang: () => {},
  t: (k) => T.EN[k] ?? k,
  geoCurrency: null,
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("EN");
  const [geoCurrency, setGeoCurrency] = useState<CurrencyCode | null>(null);

  useEffect(() => {
    const savedLang = (() => {
      try { return localStorage.getItem("gt_lang") as LangCode | null; } catch { return null; }
    })();
    const savedCurrency = (() => {
      try { return localStorage.getItem("gt_currency"); } catch { return null; }
    })();

    // 1. Apply saved language preference immediately
    if (savedLang && SUPPORTED_LANGS.has(savedLang)) {
      setLangState(savedLang);
    } else {
      // 2. Fall back to browser language instantly (no async wait)
      const browserLang = getBrowserLang();
      if (browserLang !== "EN") setLangState(browserLang);
    }

    // 3. Skip IP call only if both preferences are already saved
    if (savedLang && savedCurrency) return;

    // 4. IP-based geo-detection for missing preferences
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const country: string = data?.country_code ?? "";
        if (!country) return;

        if (!savedLang) {
          const detectedLang = countryToLang(country);
          setLangState(detectedLang);
          try { localStorage.setItem("gt_lang", detectedLang); } catch {}
        }

        if (!savedCurrency) {
          const detectedCurrency = countryToCurrency(country);
          setGeoCurrency(detectedCurrency);
          try { localStorage.setItem("gt_currency", detectedCurrency); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem("gt_lang", code); } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    return T[lang]?.[key] ?? T.EN[key] ?? key;
  }, [lang]);

  return (
    <TranslationContext.Provider value={{ lang, setLang, t, geoCurrency }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
