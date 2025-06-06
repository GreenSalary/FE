import { useEffect, useState } from 'react';
import Web3 from 'web3';

const useWeb3 = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  const GANACHE_CHAIN_ID = '0x539'; // 1337 in hex
  const GANACHE_RPC_URL = process.env.REACT_APP_WEB3_PROVIDER_URL || 'http://127.0.0.1:8545';

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const requestedAccounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (currentChainId !== GANACHE_CHAIN_ID) {
          await switchToGanache();
        }
        
        setAccounts(requestedAccounts);
        setIsConnected(true);
        return requestedAccounts[0];
      } catch (error) {
        setError('지갑 연결 실패');
        throw error;
      }
    } else {
      if (accounts.length > 0) {
        setIsConnected(true);
        return accounts[0];
      } else {
        throw new Error('MetaMask를 설치해주세요');
      }
    }
  };

  const switchToGanache = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: GANACHE_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await addGanacheNetwork();
      } else {
        throw switchError;
      }
    }
  };

  const addGanacheNetwork = async () => {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: GANACHE_CHAIN_ID,
        chainName: 'Ganache Local',
        rpcUrls: [GANACHE_RPC_URL],
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      }],
    });
  };

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        let web3Instance;
        
        if (typeof window.ethereum !== 'undefined') {
          web3Instance = new Web3(window.ethereum);
          
          window.ethereum.on('chainChanged', (chainId) => {
            setChainId(chainId);
            window.location.reload();
          });
          
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccounts(accounts);
            setIsConnected(accounts.length > 0);
          });
        } else {
          web3Instance = new Web3(GANACHE_RPC_URL);
          const ganacheAccounts = await web3Instance.eth.getAccounts();
          setAccounts(ganacheAccounts);
        }

        setWeb3(web3Instance);
        
        const currentChainId = await web3Instance.eth.getChainId();
        setChainId('0x' + currentChainId.toString(16));
        
      } catch (error) {
        console.error('Web3 초기화 실패:', error);
        setError('Web3 연결 실패');
      }
    };

    initWeb3();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  return {
    web3,
    accounts,
    isConnected,
    chainId,
    error,
    connectWallet,
    currentAccount: accounts[0] || null
  };
};

export default useWeb3;