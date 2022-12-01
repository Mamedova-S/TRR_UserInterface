import Image from 'next/image'
import Link from "next/link"
import React, { useEffect, useState } from "react"
import Web3 from 'web3'
import ethPic from '../../public/eth-icon.png'


declare var window: any;

type NavbarProps = {
    onLogin: () => void,
}

const Navbar: React.FunctionComponent<NavbarProps> = ({
    onLogin,
}) => {
    const [userAddress, setUserAddress] = useState(undefined)

    const handleConnect = async () => {

        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            setUserAddress(accounts[0])
            window.web3.eth.defaultAccount = accounts[0]
            onLogin()
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
            onLogin()
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    useEffect(() => {
        handleConnect()
    }, [])

    return <header className="p-3 text-bg-dark">
        <div className="container">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                <Link href="/" className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
                    <Image src={ethPic} alt="ETH-logo" width={40} height={40} />
                    <span className="fs-4">Poster contract</span>
                </Link>
                <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">

                </ul>
                <div className="text-end">
                    {userAddress
                        ? (<span className="fs-6">Account - {userAddress}</span>)
                        : (<button type="button" className="btn btn-primary" onClick={handleConnect}>Connect</button>)}

                </div>
            </div>
        </div>
    </header>
}
export default Navbar;