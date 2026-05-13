"use client";

const WHATSAPP_NUMBER = "9779768510607"; // +977 9768510607 in international format
const DEFAULT_MESSAGE = "Hi! I'm interested in booking a tour/event with Get Tours Nepal. Can you help me?";

export default function WhatsAppButton() {
  const handleClick = () => {
    const encodedMsg = encodeURIComponent(DEFAULT_MESSAGE);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.65)] transition-all duration-300 active:scale-90 hover:scale-110"
    >
      {/* Official WhatsApp logo SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-8 h-8"
        aria-hidden="true"
      >
        <path
          fill="#fff"
          d="M4.868 43.303l2.694-9.835a18.87 18.87 0 01-2.528-9.489C5.034 13.514 13.548 5 24.014 5c5.079.002 9.845 1.979 13.43 5.566 3.584 3.588 5.558 8.356 5.556 13.428-.004 10.465-8.522 18.98-18.986 18.98a18.94 18.94 0 01-9.073-2.31L4.868 43.303zm10.733-6.189l.578.342a15.717 15.717 0 008.06 2.216c8.687 0 15.754-7.062 15.757-15.751.002-4.208-1.633-8.163-4.603-11.136a15.658 15.658 0 00-11.148-4.614c-8.694 0-15.761 7.062-15.763 15.751a15.7 15.7 0 002.411 8.373l.376.597-1.595 5.821 5.927-1.599zm9.171-4.535c-.143-.238-.525-.381-1.098-.667-1.049-.525-3.049-1.523-3.525-1.762-.285-.143-.618-.143-.809.333-.238.572-.952 1.191-1.239 1.524-.238.286-.572.334-.953.143-1.049-.524-3.145-1.143-5.955-3.62-2.194-1.919-3.624-4.048-4.002-4.715-.333-.571.048-1.095.429-1.478.286-.286.619-.476.857-.762.238-.286.238-.524.191-.809-.095-.524-1.571-4.19-2.19-5.666-.143-.333-.286-.381-.524-.381-.143 0-.333 0-.572.048-.286.048-.714.143-.809.476-.571 1.524-.429 6.237 3.001 9.711 1.048 1.049 3.524 3.952 8.287 5.952 1.143.476 2.001.762 2.667.952 1.143.333 2.19.286 3.001.191 1.001-.095 3.05-.619 3.572-2.143.19-.619.286-1.238.095-1.475z"
        />
      </svg>
    </button>
  );
}
