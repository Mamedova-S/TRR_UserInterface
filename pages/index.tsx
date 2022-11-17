import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from "react";
import Web3 from "web3";

declare var window: any;

export default function Home() {
  const [web3, setWeb3] = useState(undefined)

  const [userAddress, setUserAddress] = useState(undefined)

  const handleConnect = async () => {
    //const web3 = new Web3()

    const [address] = await window.ethereum.enable()
    setUserAddress(address)

    setWeb3(web3)
  }

  return (
    <div>
      <button onClick={handleConnect}>Connect</button>
      <address>{userAddress}</address>
    </div>
  )
}