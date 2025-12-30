import React from 'react';

export default function StatsCard({ label, value }) {
  return (
    <div className="relative w-48 h-48 border border-white/10 rounded-3xl p-6 bg-gradient-to-br from-[#16161d] to-[#1a1a22] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <p className="text-5xl font-bold mb-4" style={{ color: '#fc5e03' }}>
          {value}
        </p>
        <p className="text-gray-400 text-sm text-center">{label}</p>
      </div>
    </div>
  );
}
