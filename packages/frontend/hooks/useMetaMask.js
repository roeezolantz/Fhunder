import { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

export const useMetaMask = () => {
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initMetaMask = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        setProvider(provider);
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.requestAccounts();
        setAccount(accounts[0]);
      } else {
        console.error('Please install MetaMask!');
      }
    };
    initMetaMask();
  }, []);

  return { provider, web3, account };
};