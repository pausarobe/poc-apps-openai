import { HiInformationCircle } from "react-icons/hi";

interface HeaderProps {
  config: any;
  totalItems: number;
}

export default function Header({ config, totalItems }: HeaderProps) {
  const IconHeader = config.icon;

  return (
    <div className={`bg-gradient-to-r rounded-[2.5rem] p-8 text-white shadow-2xl border-b-4 transition-all duration-500 ${config.gradient}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
            <IconHeader className={`w-8 h-8 ${config.accentColor}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight leading-none text-white uppercase italic">
                {config.title}
              </h1>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border bg-white/10 border-white/20">
                {config.badge}
              </span>
            </div>
            <p className="text-white/60 text-sm font-medium italic mt-2 flex items-center gap-2">
              <HiInformationCircle className="w-4 h-4 opacity-70" />
              {config.description}
            </p>
          </div>
        </div>
        <div className="bg-black/20 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 font-mono">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Resultados:</span>
          <span className={`text-2xl font-black ${config.accentColor}`}>{totalItems}</span>
        </div>
      </div>
    </div>
  );
}