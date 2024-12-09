'use client'

import React, { useState, useEffect } from 'react';

interface CoinData {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  holders?: {
    count: number;
    topHolders: {
      address: string;
      amount: string;
      percentage: number;
    }[];
  };
}

const CoinAnalysis: React.FC<{ data: CoinData }> = ({ data }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'holders'>('overview');

  useEffect(() => {
    setIsLoaded(true);
  }, [data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-12 h-12 border-4 border-[#00fff2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="backdrop-blur-xl bg-black/40 border border-[#00fff2]/20 rounded overflow-hidden">
        {/* Token Header */}
        <div className="relative p-8">
          <div className="relative flex items-start gap-8">
            {/* Token Image */}
            <div className="flex-shrink-0">
              {data.image ? (
                <img
                  src={data.image}
                  alt={data.name}
                  className="w-24 h-24 rounded object-cover border border-[#00fff2]/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/fallback-image.png';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded bg-[#00fff2]/10 flex items-center justify-center">
                  <span className="text-3xl text-[#00fff2]">$</span>
                </div>
              )}
            </div>

            {/* Token Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-mono text-[#00fff2] mb-2">
                {data.name}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#00fff2]/10 rounded text-[#00fff2] text-sm font-mono">
                  ${data.symbol}
                </span>
                <span className="text-[#00fff2]/50 text-sm font-mono">
                  {data.mint.slice(0, 8)}...{data.mint.slice(-8)}
                </span>
              </div>
              
              {data.description && (
                <p className="text-[#00fff2]/70 text-sm max-w-2xl font-mono">
                  {data.description}
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { type: 'website', url: data.website, icon: '🌐' },
                { type: 'twitter', url: data.twitter, icon: '𝕏' },
                { type: 'telegram', url: data.telegram, icon: '📱' }
              ].map((link) => (
                link.url ? (
                  <a
                    key={link.type}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded bg-[#00fff2]/10 flex items-center justify-center
                             hover:bg-[#00fff2]/20 transition-all duration-300"
                  >
                    <span className="text-[#00fff2]">{link.icon}</span>
                  </a>
                ) : null
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-[#00fff2]/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-sm font-mono transition-all duration-300 ${
              activeTab === 'overview'
                ? 'text-[#00fff2] bg-[#00fff2]/10'
                : 'text-[#00fff2]/50 hover:text-[#00fff2] hover:bg-[#00fff2]/5'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('holders')}
            className={`flex-1 py-4 text-sm font-mono transition-all duration-300 ${
              activeTab === 'holders'
                ? 'text-[#00fff2] bg-[#00fff2]/10'
                : 'text-[#00fff2]/50 hover:text-[#00fff2] hover:bg-[#00fff2]/5'
            }`}
          >
            HOLDERS
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                icon="💎"
                label="Market Status"
                value="Active"
                metric="24h"
              />
              <MetricCard
                icon="📊"
                label="Liquidity"
                value="Verified"
                metric="100%"
              />
              <MetricCard
                icon="👥"
                label="Holders"
                value={data.holders?.count.toLocaleString() || "0"}
                metric="Total"
              />
            </div>
          )}

          {activeTab === 'holders' && data.holders && (
            <div className="space-y-4">
              <div className="text-[#00fff2] font-mono mb-6">
                Top Holders ({data.holders.count.toLocaleString()} total)
              </div>
              <div className="space-y-3">
                {data.holders.topHolders.map((holder, index) => (
                  <HolderCard
                    key={index}
                    rank={index + 1}
                    address={holder.address}
                    amount={holder.amount}
                    percentage={holder.percentage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  metric: string;
}> = ({ icon, label, value, metric }) => (
  <div className="p-6 rounded bg-[#00fff2]/5 border border-[#00fff2]/20">
    <div className="flex items-start justify-between mb-4">
      <span className="text-[#00fff2]">{icon}</span>
      <div className="text-sm font-mono text-[#00fff2]">
        {metric}
      </div>
    </div>
    <div className="text-sm text-[#00fff2]/70 mb-1 font-mono">{label}</div>
    <div className="text-xl font-mono text-[#00fff2]">{value}</div>
  </div>
);

const HolderCard: React.FC<{
  rank: number;
  address: string;
  amount: string;
  percentage: number;
}> = ({ rank, address, amount, percentage }) => (
  <div className="flex items-center justify-between p-4 rounded bg-[#00fff2]/5 border border-[#00fff2]/20">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded bg-[#00fff2]/10 flex items-center justify-center font-mono text-[#00fff2]">
        {rank}
      </div>
      <div className="font-mono text-[#00fff2]">
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-[#00fff2] font-mono">
        {Number(amount).toLocaleString()}
      </div>
      <div className="px-2 py-1 rounded bg-[#00fff2]/10 text-[#00fff2] text-sm font-mono">
        {percentage.toFixed(2)}%
      </div>
    </div>
  </div>
);

export default CoinAnalysis;
