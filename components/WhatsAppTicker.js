import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { whatsappUrl, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

const MESSAGES = [
  "Can't find a fragrance? Text us on WhatsApp",
  "Out of stock? Message us and we'll help you find it",
  "Looking for something specific? We're on WhatsApp",
];

/**
 * Scrolling WhatsApp band attached under the header. The header decides when
 * it shows (`show`); it slides open/closed by animating its row height.
 * CSS-only marquee — pauses on hover, static for reduced motion.
 */
export default function WhatsAppTicker({ show }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${show ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      aria-hidden={!show}
    >
      <div className="overflow-hidden">
        <a
          href={whatsappUrl(WHATSAPP_MESSAGES.notFound)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={show ? 0 : -1}
          aria-label="Can't find a fragrance or it's out of stock? Message us on WhatsApp"
          className="group block bg-[#0A0A0A] text-white overflow-hidden mt-1"
        >
          {/* Reduced motion: one static, centred line */}
          <span className="hidden motion-reduce:flex items-center justify-center gap-2 h-8 text-[12px] font-medium">
            {MESSAGES[0]}
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
          </span>

          <span aria-hidden className="ticker-track flex w-max motion-reduce:hidden group-hover:[animation-play-state:paused]">
            {/* Two identical halves so translating by -50% loops seamlessly */}
            {[0, 1].map((half) => (
              <span key={half} className="flex shrink-0">
                {MESSAGES.map((m) => (
                  <span key={m} className="flex items-center gap-2 h-8 px-8 text-[12px] font-medium whitespace-nowrap">
                    {m}
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  </span>
                ))}
              </span>
            ))}
          </span>
        </a>
      </div>
    </div>
  );
}
