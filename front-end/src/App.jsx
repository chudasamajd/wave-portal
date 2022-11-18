import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

// For random avatar
import { BigHead } from '@bigheads/core'
import {
  generateDiceBearGridy,
  generateDiceBearAvataaars,
  generateDiceBearBottts
} from "./utils";
import { getRandomOptions } from "./utils/bigheads";

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [userMessage, setuserMessage] = useState("");

  const contractAddress = "0x4654F51E67F502dc2346EcdDcf309838016D0C5e";

  const contractABI = abi.abi;
  
  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(userMessage);
        setuserMessage("");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
  },[]);

  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  const updateInput = (e) => {
    setuserMessage(e.target.value);
  }
  
  return (
    
    <div className="mainContainer">
      <div className="headerContainer">
        <div className="dataContainer">
          <div className="header">
           Hey there!
          </div>
  
          <div className="bio">
            I am JD and I working as web3 UI/UX Developer at AssetMantle. Connect your Ethereum wallet and wave at me!
          </div>

          <div className="messageInputBox">
            <textarea onChange={updateInput} placeholder="write me a message.."></textarea>
          </div>
          
          <div className="buttonContainer">
            <button className="waveButton" onClick={wave}>
              <span>👋</span> Wave at Me
            </button>
    
            {!currentAccount && (
              <button className="waveButton" onClick={connectWallet}>
                <span>💼</span> Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

        <div className="waveMessageContainer">
          {allWaves.map((wave, index) => {
            return (
              <div key={index} className="waveMessageBox">
                <div className="boxHeader">
                  <img
                    src={generateDiceBearBottts(Math.random())}
                    width="40"
                    alt="bottts_avatar"/>
                  <div className="userData">
                    <span className="userAddress">{wave.address}</span>
                    <div className="dateTime">
                      <span>{wave.timestamp.toLocaleTimeString() +" - " +wave.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="data">
                  <span className="fieldValue">{wave.message}</span>
                </div>
                
              </div>)
          })}
        </div>
      </div>
  );
}

export default App;