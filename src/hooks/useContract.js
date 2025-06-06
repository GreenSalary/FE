import { useEffect, useState } from 'react';
import AdContract from '../contracts/AdContract.json';

const useContract = (web3) => {
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContract = async () => {
      if (!web3) return;

      try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = AdContract.networks[networkId];
        
        if (!deployedNetwork || !deployedNetwork.address) {
          const envContractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
          if (!envContractAddress) {
            throw new Error(`네트워크 ID ${networkId}에 배포된 컨트랙트를 찾을 수 없습니다.`);
          }
          setContractAddress(envContractAddress);
        } else {
          setContractAddress(deployedNetwork.address);
        }

        const contractInstance = new web3.eth.Contract(
          AdContract.abi,
          contractAddress || deployedNetwork.address
        );
        
        setContract(contractInstance);
        console.log('컨트랙트 로드 성공:', contractAddress || deployedNetwork.address);
        
      } catch (error) {
        console.error('컨트랙트 로드 실패:', error);
        setError(error.message);
      }
    };

    loadContract();
  }, [web3, contractAddress]);

  return { contract, contractAddress, error };
};

export default useContract;
