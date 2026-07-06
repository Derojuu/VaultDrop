import {
  ScaledScreen,
  ShareCard,
  UnlockCard,
  WebDashboard,
} from "@/components/mock/mocks";

const CARDS = [
  {
    key: "web",
    Mock: WebDashboard,
    w: 940,
    h: 560,
    scale: 0.7,
    title: "Vault dashboard",
    sub: "seal · share · revoke",
  },
  {
    key: "share",
    Mock: ShareCard,
    w: 340,
    h: 540,
    scale: 0.7,
    title: "Share",
    sub: "link · QR · rules",
  },
  {
    key: "unlock",
    Mock: UnlockCard,
    w: 320,
    h: 540,
    scale: 0.68,
    title: "Unlock",
    sub: "recipient · proof",
  },
];

const GLOW =
  "rounded-[18px] transition-[border-color,box-shadow] duration-300 group-hover:border-white/40 group-hover:shadow-[0_34px_80px_-30px_rgba(94,124,250,0.55),0_60px_120px_-50px_#000]";

/**
 * Product-mockup showcase at the base of the hero band. Native-size mockups
 * scaled down (crisp screenshots), floating up on hover with an accent glow.
 */
export function DeviceShowcase() {
  return (
    <div
      aria-label="VaultDrop dashboard, share and unlock views"
      className="relative z-[1] mx-auto mt-11 flex w-full flex-wrap items-end justify-center gap-4"
    >
      {CARDS.map((card) => {
        const { Mock } = card;
        return (
          <article
            key={card.key}
            className="group flex translate-y-5 flex-col gap-3 transition-transform duration-500 ease-[cubic-bezier(0.22,0.9,0.3,1)] hover:-translate-y-2"
          >
            <ScaledScreen
              w={card.w}
              h={card.h}
              scale={card.scale}
              className={GLOW}
            >
              <Mock />
            </ScaledScreen>
            <div className="flex items-baseline justify-center gap-2">
              <strong className="text-vd-tx text-[14px] font-extrabold transition-colors group-hover:text-white">
                {card.title}
              </strong>
              <span className="text-vd-tx3 font-mono text-[10px] tracking-[0.08em] uppercase">
                {card.sub}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
