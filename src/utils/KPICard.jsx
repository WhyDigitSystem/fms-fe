import React from "react";

const KPICard = ({
    title,
    value,
    icon,
    color,
    percent,
    subtitle
}) => {



    return (

        <div
            className="rounded-xl
            border border-slate-300 dark:border-slate-700
            bg-white/10 dark:bg-[#132238]
            p-3
            shadow-lg
            hover:scale-105
            duration-300">

            <div className="flex justify-between">

                <div>

                    <p className="text-gray-700 dark:text-gray-400 text-sm">
                        {title}
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {value}
                    </h2>

                </div>

                <div
                    className={`w-8 h-8 rounded-full
                    flex items-center justify-center
                    ${color}`}>

                    <span className="text-lg">
                        {icon}
                    </span>

                </div>

            </div>

            {/* <div className="mt-6">

                <div className="w-full bg-slate-700 rounded-full h-2">

                    <div
                        style={{
                            width:`${percent}%`
                        }}
                        className="bg-cyan-400 h-2 rounded-full">
                    </div>

                </div>

                <p className="text-green-400 mt-3 text-sm">

                    ↑ {percent}% {subtitle}

                </p>

            </div> */}

        </div>

    )

}

export default KPICard;