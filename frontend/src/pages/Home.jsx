import React from "react";
import {Navbar} from '../components/Navbar';

export function Home(){
    return <>
        <section className="flex w-full divide-x">
            <Navbar/>
            <div className="bg-[#0F172B] w-[500px]"></div>
            <div className="bg-[#020618] flex-1"></div>
        </section>
    </>
}