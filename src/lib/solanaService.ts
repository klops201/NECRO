import { Connection, PublicKey, Commitment, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, Wallet } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getblock } from '@/config/getblock';
import pumpIdl from '../app/idl/pump_fun_idl.json';
import { TokenMetadata, MetadataResult, HoldersData } from '@/app/components/types'


class NodeWallet implements Wallet {
    constructor() {}
    payer: Keypair = new Keypair;
    async signTransaction(tx: any) { return tx; }
    async signAllTransactions(txs: any[]) { return txs; }
    get publicKey() { return PublicKey.default; }
  }

export class SolanaService {
  private connection: Connection;
  private program: Program;
  private PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
  private TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  constructor() {
    const rpcEndpoint = getblock.shared.sol.mainnet.jsonRpc[0].go();
    const commitment: Commitment = 'confirmed';
    
    const connectionConfig = {
      commitment,
      httpHeaders: {
        'x-api-key': getblock.shared.sol.mainnet.jsonRpc[0].token(),
        'Content-Type': 'application/json',
      }
    };

    this.connection = new Connection(rpcEndpoint, connectionConfig);
    
    // Użyj NodeWallet zamiast null
    const wallet = new NodeWallet();
    const provider = new AnchorProvider(
      this.connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
    
    this.program = new Program(pumpIdl as Idl, this.PROGRAM_ID, provider);
  }
  private async retry<T>(
    operation: () => Promise<T>,
    retries = 10,
    delay = 1000
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying operation, ${retries} attempts left`);
        return this.retry(operation, retries - 1, delay);
      }
      throw error;
    }
  }

  async findMetadataAccount(mint: PublicKey): Promise<PublicKey> {
    const [publicKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        this.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      this.TOKEN_METADATA_PROGRAM_ID
    );
    return publicKey;
  }

  async getTokenAccountsByMint(mintAddress: string): Promise<HoldersData | null> {
    try {
      const mint = new PublicKey(mintAddress);
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        try {
          // Try to get all token accounts
          const accounts = await this.connection.getProgramAccounts(
            TOKEN_PROGRAM_ID,
            {
              filters: [
                {
                  dataSize: 165,
                },
                {
                  memcmp: {
                    offset: 0,
                    bytes: mint.toBase58(),
                  },
                },
              ],
            }
          );

          if (accounts && accounts.length > 0) {
            const tokenAccounts = accounts
              .map(account => {
                const data = Buffer.from(account.account.data);
                const amount = Number(data.readBigUInt64LE(64));
                return {
                  address: account.pubkey.toString(),
                  amount: amount.toString(),
                  percentage: 0
                };
              })
              .filter(acc => Number(acc.amount) > 0);

            const totalSupply = tokenAccounts.reduce((sum, acc) => sum + Number(acc.amount), 0);
            
            const sortedHolders = tokenAccounts
              .sort((a, b) => Number(b.amount) - Number(a.amount))
              .map(holder => ({
                ...holder,
                percentage: (Number(holder.amount) / totalSupply) * 100
              }));

            return {
              count: sortedHolders.length,
              topHolders: sortedHolders.slice(0, 20),
              totalSupply: totalSupply.toString()
            };
          }

          // Try alternative method if no accounts found
          const largestAccounts = await this.connection.getTokenLargestAccounts(mint);
          
          if (largestAccounts && largestAccounts.value.length > 0) {
            const totalSupply = largestAccounts.value.reduce(
              (sum, account) => sum + Number(account.amount),
              0
            );

            const holders = largestAccounts.value
              .filter(account => Number(account.amount) > 0)
              .map(account => ({
                address: account.address.toString(),
                amount: account.amount.toString(),
                percentage: (Number(account.amount) / totalSupply) * 100
              }))
              .sort((a, b) => Number(b.amount) - Number(a.amount));

            return {
              count: holders.length,
              topHolders: holders.slice(0, 20),
              totalSupply: totalSupply.toString()
            };
          }

        } catch (error) {
          console.log(`Attempt ${attempts + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        attempts++;
      }

      // Try to get at least the supply if all else fails
      const supply = await this.connection.getTokenSupply(mint);
      if (supply) {
        return {
          count: 0,
          topHolders: [],
          totalSupply: supply.value.amount
        };
      }

      return null;

    } catch (error) {
      console.error('Error getting token accounts:', error);
      return null;
    }
  }

  async getBondingCurveData(mintAddress: string) {
    try {
      const mint = new PublicKey(mintAddress);
      const [bondingCurveAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('bonding_curve'),
          mint.toBuffer(),
        ],
        this.PROGRAM_ID
      );

      const bondingCurveAccount = await this.program.account.bondingCurve.fetch(bondingCurveAddress);
      
      return {
        realTokenReserves: bondingCurveAccount.realTokenReserves.toString(),
        virtualTokenReserves: bondingCurveAccount.virtualTokenReserves.toString(),
        realSolReserves: bondingCurveAccount.realSolReserves.toString(),
        virtualSolReserves: bondingCurveAccount.virtualSolReserves.toString(),
        tokenTotalSupply: bondingCurveAccount.tokenTotalSupply.toString(),
        complete: bondingCurveAccount.complete
      };
    } catch (error) {
      console.log('No bonding curve data available');
      return null;
    }
  }

  async analyzeCoin(contractAddress: string): Promise<TokenMetadata> {
    try {
      console.log('Analyzing pump token:', contractAddress);
      
      // Get metadata
      const metadata = await this.retry<MetadataResult>(async () => {
        const mintPubkey = new PublicKey(contractAddress);
        const metadataAddress = await this.findMetadataAccount(mintPubkey);
        const metadataAccount = await this.connection.getAccountInfo(metadataAddress);
        
        if (!metadataAccount) {
          throw new Error('Metadata account not found');
        }

        const fullData = new TextDecoder().decode(metadataAccount.data);
        const ipfsMatch = fullData.match(/https:\/\/ipfs\.io\/ipfs\/[a-zA-Z0-9]+/);
        
        if (!ipfsMatch) {
          throw new Error('IPFS URL not found');
        }

        return { url: ipfsMatch[0], mintPubkey };
      });

      console.log('Found IPFS URL:', metadata.url);

      // Get IPFS data
      const tokenData = await this.retry(async () => {
        const response = await fetch(metadata.url);
        if (!response.ok) {
          throw new Error('Failed to fetch IPFS data');
        }
        return response.json();
      });

      // Get bonding curve and holders data in parallel
      const [bondingCurveState, holdersData] = await Promise.all([
        this.getBondingCurveData(contractAddress),
        this.getTokenAccountsByMint(contractAddress)
      ]);

      // Prepare result
      const result: TokenMetadata = {
        mint: contractAddress,
        name: tokenData.name || 'Unknown',
        symbol: tokenData.symbol || 'Unknown',
        description: tokenData.description || '',
        website: tokenData.website || 'X',
        twitter: tokenData.twitter || 'X',
        telegram: tokenData.telegram || 'X',
        image: tokenData.image || '',
      };

      if (bondingCurveState) {
        result.bondingCurveState = bondingCurveState;
      }

      if (holdersData) {
        result.supply = holdersData.totalSupply;
        result.holders = {
          count: holdersData.count,
          topHolders: holdersData.topHolders
        };
      }

      return result;

    } catch (error) {
      console.error('Error analyzing coin:', error);
      throw new Error('Failed to analyze coin');
    }
  }
}
