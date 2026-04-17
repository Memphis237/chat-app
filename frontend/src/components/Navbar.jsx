import React from "react";

export function Navbar(){
    return <header>
        <nav className="flex flex-col justify-between bg-[#0F172B] max-w-[100px] items-center h-screen">
            <div className="mt-10 mx-10">
                <ul className="flex flex-col justify-around items-center h-[130px]">
                    <li className="bg-[#00A34A] rounded-md px-3 py-2"><i className="fa fa-comment-o text-3xl text-[#ffff] cursor-pointer" aria-hidden="true"></i></li>
                    <li className="bg-[#00A34A] rounded-md px-3 py-2"><i className="fa fa-user-circle-o text-3xl text-[#ffff] cursor-pointer" aria-hidden="true"></i></li>
                </ul>
            </div>
            <div className="mb-10">
                <ul className="flex flex-col justify-around items-center h-[130px]">
                    <li><i className="fa fa-cog text-3xl text-gray-400 cursor-pointer" aria-hidden="true"></i></li>
                    <li><span className="rounded-full border border-[#00A34A] size-20 px-6 py-3 cursor-pointer"></span></li>
                </ul>
            </div>
        </nav>
    </header>
}