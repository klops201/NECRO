'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CoinProposal {
  id: number;
  name: string;
  ticker: string;
  description: string;
  voteCount: number;
  techStack: string[];
  features: string[];
  category: 'AI' | 'DeFi' | 'GameFi';
}

const coinProposals: CoinProposal[] = [
  {
    id: 1,
    name: "NeuroCraft Protocol",
    ticker: "$SYNTH",
    description: "Advanced neural synthesis platform enabling direct brain-to-chain interactions and memory crystallization through quantum computing interfaces.",
    voteCount: 0,
    techStack: ["Quantum Gates", "Neural Networks", "Zero-Knowledge Proofs"],
    features: ["Mind Staking", "Thought NFTs", "Neural Rewards"],
    category: "AI"
  },
  {
    id: 2,
    name: "Nexus Finance",
    ticker: "$VOID",
    description: "Revolutionary DeFi protocol utilizing dark matter algorithms for yield optimization and cross-dimensional liquidity pooling.",
    voteCount: 0,
    techStack: ["Dark Matter Engine", "Quantum Routing", "Anti-Matter Vaults"],
    features: ["Void Staking", "Dark Pools", "Quantum Yields"],
    category: "DeFi"
  },
  {
    id: 3,
    name: "MetaVerse Runners",
    ticker: "$SURGE",
    description: "First-ever metacognitive gaming platform where players earn by completing neural challenges and building quantum realms.",
    voteCount: 0,
    techStack: ["Neural Rendering", "Quantum Physics", "AI Generation"],
    features: ["Mind Racing", "Neural Crafting", "Quantum Battles"],
    category: "GameFi"
  }
];

export default function CoinCreator() {
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [votes, setVotes] = useState<{[key: number]: number}>({});
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchTimestamp, setLaunchTimestamp] = useState<Date | null>(null);

  const calculateTimeLeft = (launchTime: Date) => {
    const now = new Date();
    const difference = launchTime.getTime() - now.getTime();
    
    if (difference <= 0) {
      return 'Launch time!';
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    // Fetch launch time from Supabase
    const fetchLaunchTime = async () => {
      const { data, error } = await supabase
        .from('launch_time')
        .select('launch_timestamp')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLaunchTimestamp(new Date(data.launch_timestamp));
      }
    };

    // Check if user has voted using IP
    const checkVote = async () => {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const userIP = data.ip;

      const { data: voteData } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_ip', userIP)
        .single();
      
      setHasVoted(!!voteData);
    };

    // Get vote counts
    const getVotes = async () => {
      const { data } = await supabase
        .from('votes')
        .select('coin_id');
      
      if (data) {
        const voteCounts = data.reduce((acc: any, curr: any) => {
          acc[curr.coin_id] = (acc[curr.coin_id] || 0) + 1;
          return acc;
        }, {});
        setVotes(voteCounts);
      }
    };

    fetchLaunchTime();
    checkVote();
    getVotes();

    // Set up real-time subscription for votes
    const votesSubscription = supabase
      .channel('votes_channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'votes' }, 
          () => {
            getVotes();
          }
      )
      .subscribe();

    // Update timer
    const timer = setInterval(() => {
      if (launchTimestamp) {
        setTimeLeft(calculateTimeLeft(launchTimestamp));
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      votesSubscription.unsubscribe();
    };
  }, [launchTimestamp]);

  const handleVote = async (coinId: number) => {
    if (hasVoted) return;
    
    setIsSubmitting(true);
    try {
      // Get user's IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const userIP = data.ip;

      const { error } = await supabase
        .from('votes')
        .insert([
          { voter_ip: userIP, coin_id: coinId }
        ]);

      if (error) throw error;

      setHasVoted(true);
      setVotes(prev => ({
        ...prev,
        [coinId]: (prev[coinId] || 0) + 1
      }));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error submitting vote. You may have already voted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-black">
      {/* Quantum Field Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full 
                     filter blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full 
                     filter blur-[120px] animate-float" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <div className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back to Neural Core</span>
            </div>
          </Link>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-500 
                      to-blue-500 bg-clip-text text-transparent mb-4">
            Quantum Token Genesis
          </h1>
          
          <div className="flex items-center justify-center gap-4">

            
            <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="text-purple-300">Total Votes: </span>
              <span className="text-purple-400">
                {Object.values(votes).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Coin Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {coinProposals.map((coin) => (
            <div key={coin.id} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 
                           rounded-2xl blur opacity-25 group-hover:opacity-75 transition 
                           duration-1000 group-hover:duration-200" />
              <div className={`relative h-full p-6 rounded-2xl backdrop-blur-xl border 
                           transition-all duration-300 ${
                             selectedCoin === coin.id
                               ? 'bg-purple-900/30 border-purple-500/50'
                               : 'bg-black/40 border-purple-500/20 hover:border-purple-500/40'
                           }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-purple-200 mb-1">
                      {coin.name}
                    </h3>
                    <div className="text-sm font-mono text-purple-400">
                      {coin.ticker}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-500/10 
                               border border-purple-500/20 text-purple-300">
                    {coin.category}
                  </span>
                </div>

                <p className="text-purple-300/70 text-sm mb-6">
                  {coin.description}
                </p>

                <div className="space-y-4 mb-6">
                  {/* Tech Stack */}
                  <div>
                    <div className="text-sm font-medium text-purple-400 mb-2">
                      Quantum Tech Stack
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coin.techStack.map((tech) => (
                        <span key={tech} className="px-2 py-1 text-xs rounded-lg 
                                                bg-purple-500/10 border border-purple-500/20 
                                                text-purple-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="text-sm font-medium text-purple-400 mb-2">
                      Neural Features
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coin.features.map((feature) => (
                        <span key={feature} className="px-2 py-1 text-xs rounded-lg 
                                                   bg-blue-500/10 border border-blue-500/20 
                                                   text-blue-300">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vote Section */}
                <div className="space-y-4">
                  <div className="h-2 w-full bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full 
                               transition-all duration-1000"
                      style={{
                        width: `${((votes[coin.id] || 0) / 
                               Math.max(...Object.values(votes), 1)) * 100}%`
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300/70">
                      {votes[coin.id] || 0} votes
                    </span>
                    <span className="text-purple-300/70">
                      {Math.round(((votes[coin.id] || 0) / 
                        Math.max(Object.values(votes).reduce((a, b) => a + b, 0), 1)) * 100)}%
                    </span>
                  </div>

                  <button
                    onClick={() => !hasVoted && handleVote(coin.id)}
                    disabled={hasVoted || isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 
                             transition-all duration-300 ${
                               hasVoted
                                 ? 'bg-purple-900/20 cursor-not-allowed'
                                 : 'bg-purple-600 hover:bg-purple-500 hover:scale-[1.02]'
                             }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {hasVoted ? 'check' : 'how_to_vote'}
                    </span>
                    {hasVoted 
                      ? 'Vote Submitted' 
                      : isSubmitting 
                        ? 'Submitting...' 
                        : 'Cast Vote'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Launch Info */}
          <div className="backdrop-blur-xl bg-black/40 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 
                           flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-400">
                  rocket_launch
                </span>
              </div>
              <h3 className="text-lg font-bold text-purple-200">
                Launch Protocol
              </h3>
            </div>
            
            <div className="space-y-4 text-sm text-purple-300/70">
              <p>
                The winning token will be automatically deployed using quantum-secure 
                smart contracts and distributed through our neural network.
              </p>
              <p>
                Initial liquidity will be locked for 6 months in a time-crystal vault.
              </p>
            </div>
          </div>

          {/* Voting Rules */}
          <div className="backdrop-blur-xl bg-black/40 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 
                           flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-400">
                  gavel
                </span>
              </div>
              <h3 className="text-lg font-bold text-purple-200">
                Neural Governance
              </h3>
            </div>
            
            <div className="space-y-4 text-sm text-purple-300/70">
              <p>
                One vote per IP address. Votes are immutable once cast through 
                the quantum bridge.
              </p>
              <p>
                The proposal with the highest neural resonance (votes) at launch time 
                will be automatically selected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

