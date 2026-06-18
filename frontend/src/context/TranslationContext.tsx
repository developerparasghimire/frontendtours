"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CurrencyCode } from "@/context/CurrencyTypes";

export type LangCode = "EN" | "DE" | "FR" | "ES" | "IT" | "JA" | "RU";

export const LANGUAGES = [
  { code: "EN" as LangCode, label: "English",  flag: "🇬🇧" },
  { code: "DE" as LangCode, label: "Deutsch",  flag: "🇩🇪" },
  { code: "FR" as LangCode, label: "Français", flag: "🇫🇷" },
  { code: "ES" as LangCode, label: "Español",  flag: "🇪🇸" },
  { code: "IT" as LangCode, label: "Italiano", flag: "🇮🇹" },
  { code: "JA" as LangCode, label: "日本語",    flag: "🇯🇵" },
  { code: "RU" as LangCode, label: "Русский",  flag: "🇷🇺" },
];

const SUPPORTED_LANGS = new Set<LangCode>(["EN", "DE", "FR", "ES", "IT", "JA", "RU"]);

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
