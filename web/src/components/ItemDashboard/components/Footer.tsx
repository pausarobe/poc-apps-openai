import { HiSparkles, HiChevronRight } from "react-icons/hi";

interface FooterProps {
  config: any;
  hiddenItemsCount: number;
  onShowAll: () => void;
}

export default function Footer({ config, hiddenItemsCount, onShowAll }: FooterProps) {
  return (
    <div className={`bg-gradient-to-r rounded-[2.5rem] p-6 text-center shadow-xl border-b-4 transition-all duration-500 ${config.gradient}`}>
      <button
        onClick={onShowAll}
        className="w-full bg-white/10 hover:bg-white/20 text-white font-black text-base uppercase tracking-wide px-8 py-4 rounded-2xl border border-white/20 backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-3 group"
      >
        <HiSparkles className="w-5 h-5 group-hover:animate-pulse" />
        Ver {hiddenItemsCount} opciones más
        <HiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}