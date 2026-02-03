import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="relative flex place-items-center flex-col gap-4">
        <div className="absolute -inset-10 bg-gradient-to-r from-purple-600 to-pink-600 blur-3xl opacity-20 animate-pulse rounded-full" />
        <h2 className="text-4xl md:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 z-10">
          Your DeFi Journey <br /> Starts Here
        </h2>
        <p className="text-lg text-slate-400 max-w-lg text-center z-10">
          Adopt a digital pet that evolves as you learn crypto.
          Powered by Stellar & Soroban.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
        {/* Card 1 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-purple-500/50 transition-all cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-2xl">🐾</div>
            <h3 className="mb-2 text-xl font-bold text-white">Adopt a Pet</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mint your unique 3D companion. Feed it, play with it, and keep it healthy to unlock the DeFi world.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-indigo-500/50 transition-all cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-2xl">📚</div>
            <h3 className="mb-2 text-xl font-bold text-white">Learn DeFi</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Master Swaps, Liquidity Pools, and Security. Theory meets practice with real on-chain validations.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-pink-500/50 transition-all cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-2xl">🏆</div>
            <h3 className="mb-2 text-xl font-bold text-white">Earn Badges</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Prove your skills. Earn Soulbound Tokens (SBTs) that certify your knowledge on the Stellar network.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors">
          Start Demo
        </button>
        <a href="https://stellar.org" target="_blank" rel="noreferrer" className="px-8 py-3 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-colors border border-slate-700">
          Why Stellar?
        </a>
      </div>
    </div>
  );
}
