const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const AUTH_SCOPE_HEADER = "X-Auth-Scope";
const AUTH_TOKENS_UPDATED_EVENT = "auth:tokens-updated";
const AUTH_TOKENS_CLEARED_EVENT = "auth:tokens-cleared";

type AuthScope = "auto" | "user" | "admin";
type ResolvedAuthScope = Exclude<AuthScope, "auto">;

type StoredAuthTokens = {
  access: string;
  refresh: string;
};

type StoredAuthSession = {
  access: string | null;
  refresh: string | null;
};

type AuthEventDetail = {
  scope: ResolvedAuthScope;
  access: string | null;
  refresh: string | null;
};

function extractErrorMessage(payload: unknown): string | null {
  if (payload == null) {
    return null;
  }

  if (typeof payload === "string") {
    return payload.trim() || null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const message = extractErrorMessage(item);
      if (message) {
        return message;
      }
    }
    return null;
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const preferredKeys = ["detail", "error", "message", "non_field_errors", "errors"];

    for (const key of preferredKeys) {
      const message = extractErrorMessage(record[key]);
      if (message) {
        return message;
      }
    }

    for (const value of Object.values(record)) {
      const message = extractErrorMessage(value);
      if (message) {
        return message;
      }
    }
  }

  return null;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emitAuthEvent(name: string, detail: AuthEventDetail) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent<AuthEventDetail>(name, { detail }));
}

function readUserTokens(): StoredAuthTokens | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = localStorage.getItem("auth_tokens");
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthTokens>;
    if (!parsed.access || !parsed.refresh) {
      return null;
    }
    return { access: parsed.access, refresh: parsed.refresh };
  } catch {
    return null;
  }
}

function readStoredSession(scope: ResolvedAuthScope): StoredAuthSession {
  if (!isBrowser()) {
    return { access: null, refresh: null };
  }

  if (scope === "user") {
    const tokens = readUserTokens();
    return {
      access: tokens?.access || null,
      refresh: tokens?.refresh || null,
    };
  }

  return {
    access: localStorage.getItem("admin_token"),
    refresh: localStorage.getItem("admin_refresh"),
  };
}

function persistStoredSession(scope: ResolvedAuthScope, tokens: StoredAuthTokens) {
  if (!isBrowser()) {
    return;
  }

  if (scope === "user") {
    localStorage.setItem("auth_tokens", JSON.stringify(tokens));
  } else {
    localStorage.setItem("admin_token", tokens.access);
    localStorage.setItem("admin_refresh", tokens.refresh);
  }

  emitAuthEvent(AUTH_TOKENS_UPDATED_EVENT, {
    scope,
    access: tokens.access,
    refresh: tokens.refresh,
  });
}

function clearStoredSession(scope: ResolvedAuthScope) {
  if (!isBrowser()) {
    return;
  }

  if (scope === "user") {
    localStorage.removeItem("auth_tokens");
  } else {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh");
  }

  emitAuthEvent(AUTH_TOKENS_CLEARED_EVENT, {
    scope,
    access: null,
    refresh: null,
  });
}

function resolveAuthScope(scopeHint: AuthScope, providedToken: string | null): ResolvedAuthScope | null {
  if (!isBrowser()) {
    return null;
  }

  if (scopeHint !== "auto") {
    return scopeHint;
  }

  const userSession = readStoredSession("user");
  const adminSession = readStoredSession("admin");

  if (providedToken && adminSession.access === providedToken) {
    return "admin";
  }

  if (providedToken && userSession.access === providedToken) {
    return "user";
  }

  if (!adminSession.access && userSession.access) {
    return "user";
  }

  if (!userSession.access && adminSession.access) {
    return "admin";
  }

  return null;
}

async function refreshStoredAccessToken(scope: ResolvedAuthScope): Promise<string | null> {
  const session = readStoredSession(scope);
  if (!session.refresh) {
    clearStoredSession(scope);
    return null;
  }

  const response = await fetch(`${API_URL}/users/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.refresh }),
  });

  const contentType = response.headers.get("content-type") || "";
  const payload =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

  if (!response.ok || !payload || typeof payload !== "object" || !("access" in payload)) {
    clearStoredSession(scope);
    return null;
  }

  const parsed = payload as Partial<StoredAuthTokens>;
  if (!parsed.access) {
    clearStoredSession(scope);
    return null;
  }

  const nextTokens = {
    access: parsed.access,
    refresh: parsed.refresh || session.refresh,
  };

  if (!nextTokens.refresh) {
    clearStoredSession(scope);
    return null;
  }

  persistStoredSession(scope, nextTokens);
  return nextTokens.access;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = new Headers({ "Content-Type": "application/json", ...options?.headers });
  const scopeHint = (headers.get(AUTH_SCOPE_HEADER) as AuthScope | null) || "auto";
  headers.delete(AUTH_SCOPE_HEADER);

  const authHeader = headers.get("Authorization");
  const providedToken = authHeader?.replace(/^Bearer\s+/i, "") || null;
  const authScope = resolveAuthScope(scopeHint, providedToken);

  if (providedToken && authScope) {
    const currentSession = readStoredSession(authScope);
    if (currentSession.access && currentSession.access !== providedToken) {
      headers.set("Authorization", `Bearer ${currentSession.access}`);
    }
  }

  const requestInit: RequestInit = {
    cache: "no-store",
    ...options,
    headers,
  };

  let res = await fetch(url, requestInit);

  if (res.status === 401 && authScope) {
    const refreshedAccess = await refreshStoredAccessToken(authScope);
    if (refreshedAccess) {
      headers.set("Authorization", `Bearer ${refreshedAccess}`);
      res = await fetch(url, requestInit);
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const body =
    res.status === 204
      ? null
      : contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null);

  if (!res.ok) {
    const message = extractErrorMessage(body) || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return body as T;
}

/**
 * Like fetchAPI but for FormData uploads. Does NOT set Content-Type
 * so the browser can set the multipart boundary automatically.
 * Includes token refresh on 401 and proper error extraction.
 */
async function fetchFormData<T>(
  endpoint: string,
  method: string,
  data: FormData,
  token: string,
  scope: AuthScope = "admin"
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const resolvedScope = scope === "auto" ? resolveAuthScope(scope, token) : (scope as ResolvedAuthScope);

  // Use the latest stored access token if available
  let currentToken = token;
  if (resolvedScope) {
    const session = readStoredSession(resolvedScope);
    if (session.access) {
      currentToken = session.access;
    }
  }

  let res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${currentToken}` },
    body: data,
  });

  if (res.status === 401 && resolvedScope) {
    const refreshedAccess = await refreshStoredAccessToken(resolvedScope);
    if (refreshedAccess) {
      res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${refreshedAccess}` },
        body: data,
      });
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const body =
    res.status === 204
      ? null
      : contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null);

  if (!res.ok) {
    const message = extractErrorMessage(body) || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return body as T;
}

/**
 * Like fetchAPI but for DELETE requests that need auth with token refresh.
 */
async function fetchDelete(
  endpoint: string,
  token: string,
  scope: AuthScope = "admin"
): Promise<void> {
  const url = `${API_URL}${endpoint}`;
  const resolvedScope = scope === "auto" ? resolveAuthScope(scope, token) : (scope as ResolvedAuthScope);

  let currentToken = token;
  if (resolvedScope) {
    const session = readStoredSession(resolvedScope);
    if (session.access) {
      currentToken = session.access;
    }
  }

  let res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    },
  });

  if (res.status === 401 && resolvedScope) {
    const refreshedAccess = await refreshStoredAccessToken(resolvedScope);
    if (refreshedAccess) {
      res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshedAccess}`,
        },
      });
    }
  }

  if (!res.ok && res.status !== 204) {
    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);
    const message = extractErrorMessage(body) || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }
}

/* ──────────────── Tour API ──────────────── */

export interface APITourGuideLanguage {
  id: number;
  language: string;
  rating: number;
}

export interface APITourFAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface APITourGuide {
  id: number;
  name: string;
  bio: string;
  photo: string | null;
  languages: APITourGuideLanguage[];
}

export interface APITour {
  id: number;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  destination: string;
  image: string | null;
  gallery: string[];
  base_price: string;
  currency: string;
  duration_days: number;
  category: string;
  subcategory?: string;
  difficulty: string;
  rating: string;
  badge: string;
  best_season: string;
  highlights: string[];
  includes: string[];
  max_capacity: number;
  is_active: boolean;
  is_latest: boolean;
  booking_count?: number;
  guide?: APITourGuide | null;
  faqs?: APITourFAQ[];
  created_at: string;
  updated_at: string;
}

export async function getTours(params?: {
  search?: string;
  destination?: string;
  category?: string;
  subcategory?: string;
  ordering?: string;
  is_latest?: boolean;
}): Promise<APITour[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.destination) searchParams.set("destination", params.destination);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.subcategory) searchParams.set("subcategory", params.subcategory);
  if (params?.ordering) searchParams.set("ordering", params.ordering);
  if (params?.is_latest !== undefined) searchParams.set("is_latest", String(params.is_latest));
  const qs = searchParams.toString();
  return fetchAPI<APITour[]>(`/tours/${qs ? `?${qs}` : ""}`);
}

export async function getTourBySlug(slug: string): Promise<APITour> {
  return fetchAPI<APITour>(`/tours/${slug}/`);
}

export async function tourPdfLead(email: string, tourId: number): Promise<void> {
  await fetchAPI("/tours/pdf-lead/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, tour_id: tourId }),
  });
}

/* ──────────────── Event API ──────────────── */

export interface APIEvent {
  id: number;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  venue: string;
  image: string | null;
  event_date: string;
  base_price: string;
  currency: string;
  category: string;
  highlights: string[];
  gallery: string[];
  total_tickets: number;
  available_tickets: number;
  is_active: boolean;
  is_latest: boolean;
  booking_count?: number;
  created_at: string;
  updated_at: string;
}

export async function eventPdfLead(email: string, eventId: number): Promise<void> {
  await fetchAPI("/events/pdf-lead/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, event_id: eventId }),
  });
}

export async function getEvents(params?: {
  search?: string;
  is_latest?: boolean;
}): Promise<APIEvent[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.is_latest !== undefined) searchParams.set("is_latest", String(params.is_latest));
  const qs = searchParams.toString();
  return fetchAPI<APIEvent[]>(`/events/${qs ? `?${qs}` : ""}`);
}

export async function getEventBySlug(slug: string): Promise<APIEvent> {
  return fetchAPI<APIEvent>(`/events/${slug}/`);
}

/* ──────────────── Auth API ──────────────── */

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthSuccessResponse extends AuthTokens {
  user: UserProfile;
  created?: boolean;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  return fetchAPI<AuthTokens>("/users/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle(credential: string): Promise<AuthSuccessResponse> {
  return fetchAPI<AuthSuccessResponse>("/users/auth/google/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export async function refreshToken(refresh: string): Promise<RefreshTokenResponse> {
  return fetchAPI<RefreshTokenResponse>("/users/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

/* ──────────────── User API ──────────────── */

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/users/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/users/auth/verify-email/", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/users/auth/resend-verification/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/users/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/users/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });
}

export async function changePassword(old_password: string, new_password: string, token: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/users/auth/change-password/", {
    method: "POST",
    headers: authHeaders(token, "user"),
    body: JSON.stringify({ old_password, new_password }),
  });
}

export async function getMe(token: string, scope: AuthScope = "auto"): Promise<UserProfile> {
  return fetchAPI<UserProfile>("/users/me/", {
    headers: authHeaders(token, scope),
  });
}

/* ──────────────── Booking API ──────────────── */

export interface CreateTourBookingPayload {
  tour_id: number;
  travel_date: string;
  persons: number;
  success_url?: string;
  cancel_url?: string;
  gateway?: "MPG";
  special_requests?: string;
}

export interface TourBookingResponse {
  message: string;
  booking: {
    id: number;
    booking_reference: string;
    tour: number;
    user: number | null;
    customer_name: string;
    customer_email: string;
    travel_date: string;
    persons: number;
    total_amount: string;
    currency: string;
    status: string;
    payment_reference: string | null;
    is_refunded: boolean;
  };
  payment_url: string;
}

export async function createTourBooking(
  payload: CreateTourBookingPayload,
  token: string
): Promise<TourBookingResponse> {
  return fetchAPI<TourBookingResponse>("/bookings/tours/create/", {
    method: "POST",
    headers: authHeaders(token, "user"),
    body: JSON.stringify(payload),
  });
}

export interface GuestCreateTourBookingPayload extends CreateTourBookingPayload {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
}

export async function guestCreateTourBooking(
  payload: GuestCreateTourBookingPayload
): Promise<TourBookingResponse> {
  return fetchAPI<TourBookingResponse>("/bookings/tours/guest-create/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ──────────────── Admin API ──────────────── */

function authHeaders(token: string, scope: AuthScope = "auto") {
  return {
    Authorization: `Bearer ${token}`,
    [AUTH_SCOPE_HEADER]: scope,
  };
}

export interface AdminDashboardStats {
  tours_count: number;
  events_count: number;
  tour_bookings: number;
  event_bookings: number;
  tour_revenue: string;
  event_revenue: string;
  // This week
  tour_bookings_week: number;
  event_bookings_week: number;
  tour_revenue_week: string;
  event_revenue_week: string;
  // This month
  tour_bookings_month: number;
  event_bookings_month: number;
  tour_revenue_month: string;
  event_revenue_month: string;
  // Pending
  pending_tour_bookings: number;
  pending_event_bookings: number;
}

export async function getAdminStats(token: string): Promise<AdminDashboardStats> {
  return fetchAPI<AdminDashboardStats>("/bookings/admin/stats/", {
    headers: authHeaders(token),
  });
}

export interface AdminRecentBooking {
  id: number;
  booking_type: "tour" | "event";
  title: string;
  user_email: string;
  amount: string;
  currency: string;
  status: string;
  persons?: number;
  tickets?: number;
  travel_date?: string;
  created_at: string;
  is_new: boolean;
}

export async function getAdminRecentBookings(token: string, limit = 20): Promise<AdminRecentBooking[]> {
  return fetchAPI<AdminRecentBooking[]>(`/bookings/admin/recent-bookings/?limit=${limit}`, {
    headers: authHeaders(token),
  });
}

export interface AdminTourBooking {
  id: number;
  booking_reference: string;
  user: number | null;
  user_email: string | null;
  tour: number;
  tour_title: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  customer_name: string | null;
  customer_email: string | null;
  travel_date: string;
  persons: number;
  total_amount: string;
  currency: string;
  special_requests: string | null;
  status: string;
  payment_reference: string | null;
  is_refunded: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAdminTourBookings(token: string): Promise<AdminTourBooking[]> {
  const data = await fetchAPI<AdminTourBooking[] | { results: AdminTourBooking[] }>("/bookings/admin/tour-bookings/", {
    headers: authHeaders(token),
  });
  return Array.isArray(data) ? data : (data.results ?? []);
}

export interface AdminEventBooking {
  id: number;
  booking_reference: string;
  user: number | null;
  user_email: string | null;
  event: number;
  event_title: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  customer_name: string | null;
  customer_email: string | null;
  tickets: number;
  total_amount: string;
  currency: string;
  special_requests: string | null;
  status: string;
  payment_reference: string | null;
  is_refunded: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAdminEventBookings(token: string): Promise<AdminEventBooking[]> {
  const data = await fetchAPI<AdminEventBooking[] | { results: AdminEventBooking[] }>("/bookings/admin/event-bookings/", {
    headers: authHeaders(token),
  });
  return Array.isArray(data) ? data : (data.results ?? []);
}

// Tour CRUD (admin) — uses FormData to support image file uploads
export async function createTour(data: FormData, token: string): Promise<APITour> {
  return fetchFormData<APITour>("/tours/", "POST", data, token);
}

export async function updateTour(slug: string, data: FormData, token: string): Promise<APITour> {
  return fetchFormData<APITour>(`/tours/${slug}/`, "PATCH", data, token);
}

export async function deleteTour(slug: string, token: string): Promise<void> {
  return fetchDelete(`/tours/${slug}/`, token);
}

// Tour Guide CRUD (admin)
export async function getTourGuide(tourSlug: string): Promise<APITourGuide | null> {
  const results = await fetchAPI<APITourGuide[]>(`/tours/guides/?tour_slug=${tourSlug}`);
  return results.length > 0 ? results[0] : null;
}

export async function createTourGuide(data: FormData, token: string): Promise<APITourGuide> {
  return fetchFormData<APITourGuide>("/tours/guides/", "POST", data, token);
}

export async function updateTourGuide(id: number, data: FormData, token: string): Promise<APITourGuide> {
  return fetchFormData<APITourGuide>(`/tours/guides/${id}/`, "PATCH", data, token);
}

export async function deleteTourGuide(id: number, token: string): Promise<void> {
  return fetchDelete(`/tours/guides/${id}/`, token);
}

export async function addGuideLanguage(data: { guide: number; language: string; rating: number }, token: string): Promise<APITourGuideLanguage> {
  return fetchAPI<APITourGuideLanguage>("/tours/guide-languages/", { method: "POST", body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } });
}

export async function updateGuideLanguage(id: number, data: { language?: string; rating?: number }, token: string): Promise<APITourGuideLanguage> {
  return fetchAPI<APITourGuideLanguage>(`/tours/guide-languages/${id}/`, { method: "PATCH", body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } });
}

export async function deleteGuideLanguage(id: number, token: string): Promise<void> {
  return fetchDelete(`/tours/guide-languages/${id}/`, token);
}

// Event CRUD (admin) — uses FormData to support image file uploads
export async function createEvent(data: FormData, token: string): Promise<APIEvent> {
  return fetchFormData<APIEvent>("/events/", "POST", data, token);
}

export async function updateEvent(slug: string, data: FormData, token: string): Promise<APIEvent> {
  return fetchFormData<APIEvent>(`/events/${slug}/`, "PATCH", data, token);
}

export async function deleteEvent(slug: string, token: string): Promise<void> {
  return fetchDelete(`/events/${slug}/`, token);
}

// Booking status updates (admin)
export async function updateTourBookingStatus(
  id: number, newStatus: string, token: string
): Promise<AdminTourBooking> {
  return fetchAPI<AdminTourBooking>(`/bookings/admin/tour-bookings/${id}/status/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status: newStatus }),
  });
}

export async function updateEventBookingStatus(
  id: number, newStatus: string, token: string
): Promise<AdminEventBooking> {
  return fetchAPI<AdminEventBooking>(`/bookings/admin/event-bookings/${id}/status/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status: newStatus }),
  });
}

/* ──────────────── Site Config API ──────────────── */

export interface SiteConfig {
  site_name: string;
  site_tagline: string;
  site_description: string;
  home_about_heading: string;
  home_about_eyebrow: string;
  home_about_paragraph_1: string;
  home_about_paragraph_2: string;
  about_eyebrow: string;
  about_title: string;
  about_paragraph_1: string;
  about_paragraph_2: string;
  logo: string | null;
  logo_dark: string | null;
  footer_logo: string | null;
  home_portfolio_link_label: string;
  home_portfolio_link_url: string;
  home_portfolio_image_1: string | null;
  home_portfolio_image_2: string | null;
  home_portfolio_image_3: string | null;
  home_portfolio_image_4: string | null;
  home_portfolio_image_5: string | null;
  home_gallery_image_1: string | null;
  home_gallery_image_2: string | null;
  home_gallery_image_3: string | null;
  home_gallery_image_4: string | null;
  home_gallery_image_5: string | null;
  home_gallery_image_6: string | null;
  home_gallery_image_7: string | null;
  home_gallery_image_8: string | null;
  home_gallery_image_9: string | null;
  home_gallery_image_10: string | null;
  home_gallery_image_11: string | null;
  home_gallery_image_12: string | null;
  footer_text: string;
  phone: string;
  email: string;
  address: string;
  google_map_url: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  tiktok_url: string;
  privacy_policy_url: string;
  terms_of_service_url: string;
  updated_at: string;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return fetchAPI<SiteConfig>("/common/config/");
}

export async function updateSiteConfig(data: FormData, token: string): Promise<SiteConfig> {
  return fetchFormData<SiteConfig>("/common/config/update/", "PATCH", data, token);
}

export async function clearSiteConfigImage(field: string, token: string): Promise<void> {
  await fetchAPI("/common/config/clear-image/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ field }),
  });
}

/* ──────────────── Page Banners API ──────────────── */

export interface PageBanner {
  id: number;
  page: string;
  title: string;
  subtitle: string;
  description: string;
  updated_at: string;
}

export async function getPageBanners(): Promise<PageBanner[]> {
  return fetchAPI<PageBanner[]>("/common/banners/");
}

export async function getPageBanner(page: string): Promise<PageBanner | null> {
  const data = await fetchAPI<PageBanner | Record<string, never>>(`/common/banners/${page}/`);
  if (!data || !("id" in data)) return null;
  return data as PageBanner;
}

export async function updatePageBanner(
  page: string,
  data: Partial<Pick<PageBanner, "title" | "subtitle" | "description">>,
  token: string
): Promise<PageBanner> {
  return fetchAPI<PageBanner>(`/common/banners/${page}/update/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

/* ──────────────── Contact Submissions API ──────────────── */

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function submitContact(data: {
  name: string; email: string; phone: string; subject: string; message: string;
}): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/common/contact/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getContactSubmissions(token: string): Promise<ContactSubmission[]> {
  return fetchAPI<ContactSubmission[]>("/common/contact/submissions/", {
    headers: authHeaders(token),
  });
}

export async function markContactRead(id: number, is_read: boolean, token: string): Promise<ContactSubmission> {
  return fetchAPI<ContactSubmission>(`/common/contact/submissions/${id}/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ is_read }),
  });
}

export async function deleteContactSubmission(id: number, token: string): Promise<void> {
  return fetchDelete(`/common/contact/submissions/${id}/`, token);
}

/* ──────────────── Newsletter API ──────────────── */

export async function subscribeNewsletter(email: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/common/newsletter/subscribe/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/* ──────────────── About API ──────────────── */

export interface APIAboutStat {
  id: number;
  value: string;
  label: string;
  order: number;
}

export interface APIValue {
  id: number;
  title: string;
  description: string;
  icon_svg_path: string | null;
  order: number;
}

export interface APILeader {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string | null;
  category: "guide" | "team";
  order: number;
}

export interface APIMilestone {
  id: number;
  year: string;
  text: string;
  order: number;
}

export async function getAboutStats(): Promise<APIAboutStat[]> {
  return fetchAPI<APIAboutStat[]>("/common/about/stats/");
}

export async function createAboutStat(data: Omit<APIAboutStat, "id">, token: string): Promise<APIAboutStat> {
  return fetchAPI<APIAboutStat>("/common/about/stats/create/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateAboutStat(id: number, data: Partial<APIAboutStat>, token: string): Promise<APIAboutStat> {
  return fetchAPI<APIAboutStat>(`/common/about/stats/${id}/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteAboutStat(id: number, token: string): Promise<void> {
  return fetchDelete(`/common/about/stats/${id}/`, token);
}

export async function getValues(): Promise<APIValue[]> {
  return fetchAPI<APIValue[]>("/common/about/values/");
}

export async function createValue(data: Omit<APIValue, "id">, token: string): Promise<APIValue> {
  return fetchAPI<APIValue>("/common/about/values/create/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateValue(id: number, data: Partial<APIValue>, token: string): Promise<APIValue> {
  return fetchAPI<APIValue>(`/common/about/values/${id}/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteValue(id: number, token: string): Promise<void> {
  return fetchDelete(`/common/about/values/${id}/`, token);
}

export async function getLeaders(): Promise<APILeader[]> {
  return fetchAPI<APILeader[]>("/common/about/leaders/");
}

export async function createLeader(data: FormData, token: string): Promise<APILeader> {
  return fetchFormData<APILeader>("/common/about/leaders/create/", "POST", data, token);
}

export async function updateLeader(id: number, data: FormData, token: string): Promise<APILeader> {
  return fetchFormData<APILeader>(`/common/about/leaders/${id}/`, "PATCH", data, token);
}

export async function deleteLeader(id: number, token: string): Promise<void> {
  return fetchDelete(`/common/about/leaders/${id}/`, token);
}

export async function getMilestones(): Promise<APIMilestone[]> {
  return fetchAPI<APIMilestone[]>("/common/about/milestones/");
}

export async function createMilestone(data: Omit<APIMilestone, "id">, token: string): Promise<APIMilestone> {
  return fetchAPI<APIMilestone>("/common/about/milestones/create/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateMilestone(id: number, data: Partial<APIMilestone>, token: string): Promise<APIMilestone> {
  return fetchAPI<APIMilestone>(`/common/about/milestones/${id}/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteMilestone(id: number, token: string): Promise<void> {
  return fetchDelete(`/common/about/milestones/${id}/`, token);
}

/* ──────────────── Newsletter Admin API ──────────────── */

export interface NewsletterSubscriber {
  email: string;
  subscribed_at: string;
}

export async function getNewsletterSubscribers(token: string): Promise<NewsletterSubscriber[]> {
  return fetchAPI<NewsletterSubscriber[]>("/common/newsletter/subscribers/", {
    headers: authHeaders(token),
  });
}

/* ──────────────── Blog API ──────────────── */

export interface APIBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  author: string;
  category: string;
  read_time: string;
  tags: string;
  is_published: boolean;
  publish_date: string;
  created_at: string;
  updated_at: string;
}

export async function getBlogPosts(params?: { search?: string }): Promise<APIBlogPost[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : "";
  return fetchAPI<APIBlogPost[]>(`/blog/${qs}`);
}

export async function getBlogPostBySlug(slug: string): Promise<APIBlogPost> {
  return fetchAPI<APIBlogPost>(`/blog/${slug}/`);
}

export async function createBlogPost(data: FormData, token: string): Promise<APIBlogPost> {
  return fetchFormData<APIBlogPost>("/blog/", "POST", data, token);
}

export async function updateBlogPost(slug: string, data: FormData, token: string): Promise<APIBlogPost> {
  return fetchFormData<APIBlogPost>(`/blog/${slug}/`, "PATCH", data, token);
}

export async function deleteBlogPost(slug: string, token: string): Promise<void> {
  return fetchDelete(`/blog/${slug}/`, token);
}

/* ──────────────── Testimonials API ──────────────── */

export interface APITestimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  image: string | null;
  rating: number;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export async function getTestimonials(): Promise<APITestimonial[]> {
  return fetchAPI<APITestimonial[]>("/testimonials/");
}

export async function createTestimonial(data: FormData, token: string): Promise<APITestimonial> {
  return fetchFormData<APITestimonial>("/testimonials/", "POST", data, token);
}

export async function updateTestimonial(id: number, data: FormData, token: string): Promise<APITestimonial> {
  return fetchFormData<APITestimonial>(`/testimonials/${id}/`, "PATCH", data, token);
}

export async function deleteTestimonial(id: number, token: string): Promise<void> {
  return fetchDelete(`/testimonials/${id}/`, token);
}

/* ──────────────── Partners API ──────────────── */

export interface APIPartner {
  id: number;
  name: string;
  logo: string | null;
  website_url: string;
  order: number;
  is_active: boolean;
}

export async function getPartners(): Promise<APIPartner[]> {
  return fetchAPI<APIPartner[]>("/common/partners/");
}

export async function createPartner(data: FormData, token: string): Promise<APIPartner> {
  return fetchFormData<APIPartner>("/common/partners/create/", "POST", data, token);
}

export async function updatePartner(id: number, data: FormData, token: string): Promise<APIPartner> {
  return fetchFormData<APIPartner>(`/common/partners/${id}/`, "PATCH", data, token);
}

export async function deletePartner(id: number, token: string): Promise<void> {
  return fetchDelete(`/common/partners/${id}/`, token);
}

/* ──────────────── Categories API (Tour & Event taxonomy) ──────────────── */

export interface APICategory {
  id: number;
  kind: "tour" | "event";
  name: string;
  parent: number | null;
  parent_name: string | null;
  order: number;
  is_active: boolean;
  icon?: string;
  image?: string | null;
  description?: string;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getCategories(params?: {
  kind?: "tour" | "event";
  parent?: number | "null";
  is_active?: boolean;
  is_featured?: boolean;
  ordering?: string;
  limit?: number;
}): Promise<APICategory[]> {
  const sp = new URLSearchParams();
  if (params?.kind) sp.set("kind", params.kind);
  if (params?.parent !== undefined) sp.set("parent", String(params.parent));
  if (params?.is_active !== undefined) sp.set("is_active", String(params.is_active));
  if (params?.is_featured !== undefined) sp.set("is_featured", String(params.is_featured));
  if (params?.ordering) sp.set("ordering", params.ordering);
  if (params?.limit !== undefined) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return fetchAPI<APICategory[]>(`/common/categories/${qs ? `?${qs}` : ""}`);
}

export async function createCategory(
  data: { kind: "tour" | "event"; name: string; parent?: number | null; order?: number; is_active?: boolean },
  token: string,
): Promise<APICategory> {
  return fetchAPI<APICategory>("/common/categories/create/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: number,
  data: Partial<{ kind: "tour" | "event"; name: string; parent: number | null; order: number; is_active: boolean }>,
  token: string,
): Promise<APICategory> {
  return fetchAPI<APICategory>(`/common/categories/${id}/`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  return fetchDelete(`/common/categories/${id}/`, token);
}

export async function createCategoryWithImage(
  data: FormData,
  token: string,
): Promise<APICategory> {
  return fetchFormData<APICategory>("/common/categories/create/", "POST", data, token);
}

export async function updateCategoryWithImage(
  id: number,
  data: FormData,
  token: string,
): Promise<APICategory> {
  return fetchFormData<APICategory>(`/common/categories/${id}/`, "PATCH", data, token);
}

/* ──────────────── Deploy (admin only) ──────────────── */

export interface DeployStatus {
  vercel: boolean;
  heroku: boolean;
  github: boolean;
}

export interface DeployResult {
  results: Record<string, { ok: boolean; status: number; message: string }>;
}

export async function getDeployStatus(token: string): Promise<DeployStatus> {
  return fetchAPI<DeployStatus>("/common/admin/deploy/status/", {
    headers: authHeaders(token),
  });
}

export async function triggerDeploy(
  token: string,
  targets: Array<"vercel" | "heroku" | "github">,
): Promise<DeployResult> {
  return fetchAPI<DeployResult>("/common/admin/deploy/", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ targets }),
  });
}

/* ──────────────── User Bookings API ──────────────── */

export interface MyTourBooking {
  id: number;
  user: number;
  tour: number;
  tour_title: string;
  tour_slug: string;
  tour_image: string | null;
  tour_destination: string;
  travel_date: string;
  persons: number;
  total_amount: string;
  currency: string;
  status: string;
  payment_reference: string | null;
  is_refunded: boolean;
  created_at: string;
  updated_at: string;
}

export interface MyEventBooking {
  id: number;
  user: number;
  event: number;
  event_title: string;
  event_slug: string;
  event_image: string | null;
  event_venue: string;
  event_date: string;
  tickets: number;
  total_amount: string;
  currency: string;
  status: string;
  payment_reference: string | null;
  is_refunded: boolean;
  created_at: string;
  updated_at: string;
}

export async function getMyTourBookings(token: string): Promise<MyTourBooking[]> {
  return fetchAPI<MyTourBooking[]>("/bookings/my-tours/", {
    headers: authHeaders(token, "user"),
  });
}

export async function getMyEventBookings(token: string): Promise<MyEventBooking[]> {
  return fetchAPI<MyEventBooking[]>("/bookings/my-events/", {
    headers: authHeaders(token, "user"),
  });
}

export interface CreateEventBookingPayload {
  event_id: number;
  tickets: number;
  success_url?: string;
  cancel_url?: string;
  gateway?: "MPG";
  special_requests?: string;
}

export interface EventBookingResponse {
  message: string;
  booking: {
    id: number;
    booking_reference: string;
    event: number;
    user: number | null;
    customer_name: string;
    customer_email: string;
    tickets: number;
    total_amount: string;
    currency: string;
    status: string;
    payment_reference: string | null;
    is_refunded: boolean;
  };
  payment_url: string;
}

export async function createEventBooking(
  payload: CreateEventBookingPayload,
  token: string
): Promise<EventBookingResponse> {
  return fetchAPI<EventBookingResponse>("/bookings/events/create/", {
    method: "POST",
    headers: authHeaders(token, "user"),
    body: JSON.stringify(payload),
  });
}

export interface GuestCreateEventBookingPayload extends CreateEventBookingPayload {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
}

export async function guestCreateEventBooking(
  payload: GuestCreateEventBookingPayload
): Promise<EventBookingResponse> {
  return fetchAPI<EventBookingResponse>("/bookings/events/guest-create/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ──────────────── Review API ──────────────── */

export interface ReviewData {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  tour: number | null;
  event: number | null;
  rating: number;
  comment: string;
  is_verified_booking: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface CheckBookingResult {
  has_booking: boolean;
  has_review: boolean;
}

export async function getTourReviews(tourId: number): Promise<ReviewData[]> {
  return fetchAPI<ReviewData[]>(`/reviews/tours/${tourId}/`);
}

export async function getEventReviews(eventId: number): Promise<ReviewData[]> {
  return fetchAPI<ReviewData[]>(`/reviews/events/${eventId}/`);
}

export async function createReview(
  data: { tour_id?: number; event_id?: number; rating: number; comment: string },
  token: string
): Promise<ReviewData> {
  return fetchAPI<ReviewData>("/reviews/", {
    method: "POST",
    headers: authHeaders(token, "user"),
    body: JSON.stringify(data),
  });
}

export async function checkBookingStatus(
  params: { tour_id?: number; event_id?: number },
  token: string
): Promise<CheckBookingResult> {
  const sp = new URLSearchParams();
  if (params.tour_id) sp.set("tour_id", String(params.tour_id));
  if (params.event_id) sp.set("event_id", String(params.event_id));
  return fetchAPI<CheckBookingResult>(`/reviews/check-booking/?${sp.toString()}`, {
    headers: authHeaders(token, "user"),
  });
}

/* ──────────────── Admin Review API ──────────────── */

export interface AdminReview {
  id: number;
  user_name: string;
  user_email: string;
  tour_title: string | null;
  tour_id: number | null;
  event_title: string | null;
  event_id: number | null;
  rating: number;
  comment: string;
  is_verified_booking: boolean;
  is_approved: boolean;
  created_at: string;
}

export async function getAdminReviews(token: string): Promise<AdminReview[]> {
  return fetchAPI<AdminReview[]>("/reviews/admin/", {
    headers: authHeaders(token, "admin"),
  });
}

export async function updateAdminReview(
  id: number,
  data: { is_approved: boolean },
  token: string
): Promise<ReviewData> {
  return fetchAPI<ReviewData>(`/reviews/admin/${id}/`, {
    method: "PATCH",
    headers: authHeaders(token, "admin"),
    body: JSON.stringify(data),
  });
}

export async function deleteAdminReview(id: number, token: string): Promise<void> {
  return fetchDelete(`/reviews/admin/${id}/delete/`, token);
}

/* ──────────────── Payment API ──────────────── */

export type PaymentStatus =
  | "PENDING"
  | "INITIATED"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface PaymentStatusResponse {
  order_id: string;
  transaction_id: string | null;
  status: PaymentStatus;
  amount: string;
  currency: string;
  booking_type: "TOUR" | "EVENT";
  booking_id: string;
  gateway: string;
}

export async function getPaymentStatus(
  orderId: string,
  token: string
): Promise<PaymentStatusResponse> {
  return fetchAPI<PaymentStatusResponse>(`/payments/${encodeURIComponent(orderId)}/status/`, {
    headers: authHeaders(token, "user"),
  });
}

export async function getGuestPaymentStatus(
  bookingRef: string
): Promise<PaymentStatusResponse> {
  return fetchAPI<PaymentStatusResponse>(
    `/payments/mpg/guest-status/?ref=${encodeURIComponent(bookingRef)}`
  );
}

export interface InitiateMPGResponse {
  transaction_id: number;
  order_id: string;
  session_id: string;
  payment_url: string;
  amount: string;
  currency: string;
}

export async function initiateMPGPayment(
  payload: { booking_id: number; booking_type: "TOUR" | "EVENT" },
  token: string
): Promise<InitiateMPGResponse> {
  return fetchAPI<InitiateMPGResponse>("/payments/mpg/initiate/", {
    method: "POST",
    headers: authHeaders(token, "user"),
    body: JSON.stringify(payload),
  });
}
