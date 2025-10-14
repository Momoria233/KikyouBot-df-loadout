import React, { useState } from "react";
import GunTable from "./components/GunTable";

export default function App() {
  const [csvUrl, setCsvUrl] = useState("loadout.csv");
  const [ModeType, setModeType] = useState("摸金");
  let Description;
  if (ModeType === "摸金") {
    Description = "大部分摸金改枪码如果未明显标注一般更适用于二号位，后续可能会补上一号位更偏向机动舍弃射程/稳定的改装方法 \n其中有部分重复的思路可能是参考的聪聪，偷的群友理解，或者单纯想一起了（"
  } else {
    Description = "大战场改枪码"
  }

  return (
    <div className="min-h-screen bg-zinc-800 text-slate-100">
      <header className="backdrop-blur-md rounded-2xl shadow-xl border-b border-zinc-800 px-8 pt-10 pb-6 mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-300 tracking-tight mb-2 drop-shadow">
          KikyouBot-df-loadout
        </h1>
        <p className="text-indigo-400 text-lg font-medium opacity-80">
          i改枪tv<br/>纯自用，如果感觉不好用那我只能直接滑轨了
        </p>
      </header>

      <main>
        <div className="bg-zinc-700/90 rounded-2xl shadow-lg p-8 mb-10 text-black">
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 rounded-l bg-indigo-500 text-white font-bold ${csvUrl === "loadout.csv" ? "" : "opacity-60"}`}
              onClick={() => setCsvUrl("loadout.csv")}
              onClickCapture={() => setModeType("摸金")}
            >
              摸金
            </button>
            <button
              className={`px-4 py-2 rounded-r bg-indigo-500 text-white font-bold ml-1 ${csvUrl === "battlefield_loadout.csv" ? "" : "opacity-60"}`}
              onClick={() => setCsvUrl("battlefield_loadout.csv")}
              onClickCapture={() => setModeType("大战场")}
            >
              大战场
            </button>
          </div>
          <p className="text-center text-white border-b pb-4 mb-6 text-lg font-medium whitespace-pre-line">
            {Description}
          </p>
          <GunTable csvUrl={csvUrl} />
        </div>
      </main>

      <footer className="mt-10 text-xs text-zinc-400 border-t border-zinc-800 pt-6 text-center tracking-wide">
        ~ 汐比啾比 ~
      </footer>
    </div>
  );
}