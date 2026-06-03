"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CurrencyCode } from "./CurrencyContext";

export type LangCode = "EN" | "DE" | "FR" | "ES" | "IT";

export const LANGUAGES = [
  { code: "EN" as LangCode, label: "English",  flag: "🇬🇧" },
  { code: "DE" as LangCode, label: "Deutsch",  flag: "🇩🇪" },
  { code: "FR" as LangCode, label: "Français", flag: "🇫🇷" },
  { code: "ES" as LangCode, label: "Español",  flag: "🇪🇸" },
  { code: "IT" as LangCode, label: "Italiano", flag: "🇮🇹" },
];

// Countries whose primary language is DE/FR/ES/IT
const LANG_MAP: Record<string, LangCode> = {
  DE: "DE", AT: "DE", LI: "DE",
  FR: "FR", BE: "FR", LU: "FR", MC: "FR",
  ES: "ES", MX: "ES", AR: "ES", CO: "ES", PE: "ES", CL: "ES", VE: "ES", EC: "ES",
  IT: "IT", SM: "IT", VA: "IT",
};

// Countries whose default currency should be EUR
const EUR_COUNTRIES = new Set([
  "DE","AT","FR","ES","IT","BE","NL","PT","FI","IE","LU","SK","SI","LT","LV","EE","CY","MT","MC","SM","VA","LI",
]);
// Countries with specific currencies
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

// --- Translation dictionary ---
type Dict = Record<string, string>;
const T: Record<LangCode, Dict> = {
  EN: {
    "nav.home": "Home", "nav.about": "About", "nav.events": "Events",
    "nav.tours": "Tours", "nav.blogs": "Blogs", "nav.contact": "Contact",
    "nav.signin": "Sign In",
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
    "event.book": "Book Tickets", "event.back": "Back to All Events",
    "event.about": "About This Event", "event.highlights": "Event Highlights",
    "event.download": "Download Event Details",
    "event.date": "Date", "event.time": "Time", "event.venue": "Venue",
    "event.price": "Entry Price", "event.tickets": "Tickets Available",
    "common.free": "Free", "common.sold_out": "Sold Out",
    "common.contact": "Contact Us", "common.need_help": "Need help planning your trip?",
    "common.select_date": "Select Date", "common.travelers": "Travelers",
    "common.tickets": "Tickets",
    "trust.certified": "Certified Travel Agency",
    "trust.safe": "Safe & Secure",
    "trust.support": "24/7 Support",
    "trust.guarantee": "Best Price Guarantee",
  },
  DE: {
    "nav.home": "Startseite", "nav.about": "Über uns", "nav.events": "Veranstaltungen",
    "nav.tours": "Touren", "nav.blogs": "Blog", "nav.contact": "Kontakt",
    "nav.signin": "Anmelden",
    "tour.book": "Jetzt buchen", "tour.book_now": "Buchen",
    "tour.download": "Details herunterladen",
    "tour.price_from": "Ab", "tour.per_person": "pro Person",
    "tour.about": "Über diese Tour", "tour.highlights": "Tour-Highlights",
    "tour.gallery": "Galerie", "tour.included": "Im Preis enthalten",
    "tour.guide": "Ihr Reiseleiter", "tour.faq": "Häufige Fragen",
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
    "common.contact": "Kontakt", "common.need_help": "Hilfe bei der Planung?",
    "common.select_date": "Datum wählen", "common.travelers": "Reisende",
    "common.tickets": "Tickets",
    "trust.certified": "Zertifiziertes Reisebüro",
    "trust.safe": "Sicher & Geschützt",
    "trust.support": "24/7 Unterstützung",
    "trust.guarantee": "Bestpreis-Garantie",
  },
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
    "trust.certified": "Agence de voyages certifiée",
    "trust.safe": "Sûr & Sécurisé",
    "trust.support": "Support 24h/24",
    "trust.guarantee": "Meilleur prix garanti",
  },
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
    "common.contact": "Contáctanos", "common.need_help": "¿Necesitas ayuda?",
    "common.select_date": "Seleccionar fecha", "common.travelers": "Viajeros",
    "common.tickets": "Entradas",
    "trust.certified": "Agencia de viajes certificada",
    "trust.safe": "Seguro y protegido",
    "trust.support": "Soporte 24/7",
    "trust.guarantee": "Mejor precio garantizado",
  },
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
    "trust.certified": "Agenzia di viaggi certificata",
    "trust.safe": "Sicuro e protetto",
    "trust.support": "Supporto 24/7",
    "trust.guarantee": "Miglior prezzo garantito",
  },
};

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

  // Load saved language preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gt_lang") as LangCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLangState(saved);
        return;
      }
    } catch {}

    // Geo-detect language and currency
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const country: string = data?.country_code ?? "";
        const detectedLang = countryToLang(country);
        const detectedCurrency = countryToCurrency(country);
        setLangState(detectedLang);
        setGeoCurrency(detectedCurrency);
        try { localStorage.setItem("gt_lang", detectedLang); } catch {}
        try {
          if (!localStorage.getItem("gt_currency")) {
            localStorage.setItem("gt_currency", detectedCurrency);
          }
        } catch {}
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
