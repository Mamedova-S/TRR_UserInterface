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
    const [events, setEvents] = useState<any[]>([])

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
            
            await poster.getPastEvents("NewPost", {fromBlock: 29233040 , toBlock: 29233540 }, (error, events) => { console.log(error); if (events) {console.log(`events1 - ${events}`); setEvents(events); }});
            console.log(`events2 - ${events}`);
        } catch (e) {
            console.log(e);
        }
    };

    // useEffect(() => {
    //     loadTableData()
    // });

    return (
        <>
            <Navbar
                onLogin={() => { setWeb3(window.web3); setIsAuthorized(true) }}
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
                    {successMessage != "" && (<div className="alert alert-success" role="alert">{successMessage}</div>)}
                    {errorMessage != "" && (<div className="alert alert-danger" role="alert">{errorMessage}</div>)}
                </div>
                
                <button className="mw-25 btn btn-lg btn-primary mb-3" onClick={loadTableData}>Load Data</button>
                <div className="text-center mx-auto">
                    <table className="table table-dark table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">User Address</th>
                                <th scope="col">Tag</th>
                                <th scope="col">Content</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event, index) => (<tr key={`event_${index}`}>
                                <td>{index + 1}</td>
                                <td>{event.address}</td>
                                <td>{/*web3?.utils.toUtf8(event.raw.topics[2])*/}</td>
                                <td>{/* web3?.utils.toUtf8(event.raw.data)*/}</td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    )
}