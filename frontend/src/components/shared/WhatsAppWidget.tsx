"use client";

const WHATSAPP_NUMBER = "9779768510607";
const WHATSAPP_MESSAGE = "Hi! I'm interested in booking a tour with Get Tours Nepal.";

export default function WhatsAppWidget() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-[4.5rem] lg:bottom-6 right-4 z-50 flex items-center gap-2 group"
    >
      {/* Tooltip */}
      <span className="pointer-events-none hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap">
        Chat with us
      </span>

      {/* Button */}
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform duration-200 group-hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#25D366" }}>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: "#25D366" }} />
        {/* WhatsApp icon */}
        <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.46.655 4.77 1.797 6.767L2 30l7.42-1.773A13.95 13.95 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2Zm0 25.46a11.42 11.42 0 0 1-5.83-1.598l-.418-.248-4.32 1.033.955-4.208-.272-.433A11.428 11.428 0 0 1 4.54 16.003c0-6.318 5.143-11.46 11.463-11.46 6.318 0 11.46 5.142 11.46 11.46 0 6.32-5.142 11.457-11.46 11.457Zm6.29-8.575c-.345-.173-2.04-1.007-2.355-1.122-.315-.115-.545-.172-.775.173-.23.345-.89 1.122-1.09 1.352-.2.23-.4.26-.745.086-.345-.173-1.455-.536-2.77-1.71-1.023-.913-1.713-2.04-1.913-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.518-.603.172-.2.23-.345.345-.575.115-.23.058-.432-.028-.603-.087-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.775-.59-.2-.01-.43-.012-.66-.012a1.267 1.267 0 0 0-.918.432c-.315.345-1.207 1.18-1.207 2.875 0 1.697 1.235 3.337 1.408 3.567.172.23 2.43 3.712 5.888 5.205.823.355 1.465.567 1.965.726.825.263 1.577.225 2.17.137.663-.1 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.637-.086-.144-.315-.23-.66-.403Z"/>
        </svg>
      </span>
    </a>
  );
}
