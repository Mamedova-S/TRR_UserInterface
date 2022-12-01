import React, { useEffect, useState } from "react";
import Web3 from 'web3';
import Navbar from './components/Navbar';
import { AbiItem } from 'web3-utils';
import PosterABI from '../abis/poster.json';


declare var window: any;

export default function Home() {
    const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [events, setEvents] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<string[]>([]);
    const [requestCount, setRequestCount] = useState<number>(0);
    const [currentTag, setCurrentTag] = useState<string>("");

    const postMessage = async () => {
        if (web3 == undefined) return;

        let network = 0;
        network = await web3.eth.net.getId();
        let netID = network.toString();
        if (netID !== '80001') {
            setSuccessMessage("");
            setErrorMessage("Wrong network detected, please make sure you are switched to the correct network, and try again.");
            return;
        }

        let content = document.getElementById("contentInput") as HTMLInputElement;
        if (content == null || content.value == "") {
            setSuccessMessage("");
            setErrorMessage("Field \"Content\" is empty.");
            return;
        }
        let tag = document.getElementById("tagInput") as HTMLInputElement;
        if (tag == null || tag.value == "") {
            setSuccessMessage("");
            setErrorMessage("Field \"Tag\" is empty.");
            return;
        }

        try {
            const poster = new web3.eth.Contract(PosterABI as AbiItem[], process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
            await poster.methods.post(content.value, tag.value).send({ "from": web3.eth.defaultAccount, "payableParam": "" })
                .on('transactionHash', function (hash: any) { setSuccessMessage(`Success! TxnHash - ${hash}`); setErrorMessage("") })
                .on('error', function (error: any) { setSuccessMessage(""); setErrorMessage(error.message) });;
        }
        catch (e) {
            console.log(e);
        }
    };

    const loadTableData = async () => {
        if (web3 == undefined) return;
        setEvents([]);

        let network = 0;
        network = await web3.eth.net.getId();
        let netID = network.toString();
        if (netID !== '80001') {
            setSuccessMessage("");
            setErrorMessage("Wrong network detected, please make sure you are switched to the correct network, and try again.");
            return;
        }
        try {
            const poster = new web3.eth.Contract(PosterABI as AbiItem[], process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
            
            const latest = await web3.eth.getBlockNumber();
            
            const min_block_number = 29436142;
            let timeout = 0;
            for(let i = latest; i >= min_block_number; i -= 1000)
            {
                const from = i - 1000 < min_block_number ? min_block_number : i - 1000;
                const to = i;

                setTimeout(getPastEvents , timeout, poster, from, to);
                setRequestCount((count) => count + 1);
                timeout += 27;
            }
            setRequestCount((count) => count - 1);
        } catch (e) {
            console.log(e);
        }
    };

    const getPastEvents = async (poster, from, to) => {
        await poster.getPastEvents(
            "NewPost", 
            {fromBlock: from , toBlock: to}, 
            (error, _events) => { 
                console.log(error);
                if (_events) {
                    const addressList = [];
                    _events.forEach(event => {
                        const address = web3.eth.abi.decodeParameter('address', event.raw.topics[1]);
                        if (!addressList.includes(address))
                            addressList.push(address);
                    });
                    setAddresses((_addresses) => [..._addresses, ...addressList]);
                    setEvents((eventList) => [...eventList, ..._events]); 
                }
            })
        setRequestCount((count) => count - 1);
};

    const onLoginHandler = () => {
        setWeb3(window.web3);
        setIsAuthorized(true);
    };

    const onChangeTag = (event: any) => {
        setCurrentTag(event.target.value);
    };

    useEffect(() => {
        loadTableData();
    }, [web3]);

    return (
        <>
            <Navbar
                onLogin={onLoginHandler}
            />
            <main className="container ">
                <div className="text-center mx-auto" style={{ maxWidth: 350 }}>
                    <h2 className="mt-5 mb-3">Post message:</h2>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control form-control-dark text-bg-dark" id="contentInput" placeholder="Content" />
                        <label className="text-white" htmlFor="contentInput">Content</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control form-control-dark text-bg-dark" id="tagInput" placeholder="Tag" />
                        <label className="text-white" htmlFor="tagInput">Tag</label>
                    </div>
                    <button className="w-100 btn btn-lg btn-primary mb-3" onClick={postMessage} disabled={!isAuthorized}>Post</button>
                    {successMessage != "" && (<div className="alert alert-success" role="alert" style={{"word-break": "break-word"}}>{successMessage}</div>)}
                    {errorMessage != "" && (<div className="alert alert-danger" role="alert" style={{"word-break": "break-word"}}>{errorMessage}</div>)}
                </div>
                
                {web3 && addresses.includes(web3.eth.defaultAccount) && 
                <div className="text-center mx-auto mt-3">
                    <form className="d-flex flex-row-reverse">
                        <div className="py-2 col-auto">
                            <label htmlFor="inputTag" className="visually-hidden text-white">Tag</label>
                            <input type="text" className="form-control form-control-dark text-bg-dark" id="inputTag" placeholder="Tag" onChange={onChangeTag}/>
                        </div>
                    </form>
                    {requestCount >= 0 ? 
                        (<div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>)
                        : (<table className="table table-dark table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">User Address</th>
                                    <th scope="col">Tag</th>
                                    <th scope="col">Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event, index) => {
                                    const address = web3.eth.abi.decodeParameter('address', event.raw.topics[1]);

                                    const data = web3.eth.abi.decodeParameters([{
                                        type: 'string',
                                        name: 'content'
                                    },{
                                        type: 'string',
                                        name: 'tag'
                                    }], event.raw.data)

                                    if (data.tag.toLowerCase().includes(currentTag.toLowerCase()))
                                        return (
                                        <tr key={`event_${index}`}>
                                            <td>{index + 1}</td>
                                            <td>{address}</td>
                                            <td>{data.tag}</td>
                                            <td>{data.content}</td>
                                        </tr>)
                                })}
                            </tbody>
                        </table>)
                    }
                </div>}
            </main>
        </>
    )
}