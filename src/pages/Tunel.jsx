import { ref, onValue, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  PlayIcon,
  ClockIcon,
  StatusActiveIcon,
  StatusIdleIcon,
  StatusReadyIcon,
} from "../components/Icons";
import Footer from "../components/Footer";

/**
 * Tunel:
 * wahana6 = Main Tunel
 * wahana7 = Chamber AI
 */

const TUNELS = {
  wahana7: "Main Tunel",
  wahana8: "Chamber AI",
};

const WAHANA_NAME = {
  1: "Hologram",
  2: "Totem",
  3: "Train 1",
  4: "Dream Farm",
  5: "Space-X",
  6: "Train 2",
  7: "Tunel",
  8: "Chamber AI",
  9: "B.Gondola & Gondola",
};

export default function Tunel() {
  const [allWahana, setAllWahana] = useState({});
  const [liveTimers, setLiveTimers] = useState({});

  /* =========================
      REALTIME LISTENER
  ========================== */
  useEffect(() => {
    const unsub = onValue(ref(db, "wahana"), (snap) => {
      setAllWahana(snap.val() || {});
    });
    return () => unsub();
  }, []);

  /* =========================
      LIVE TIMER
  ========================== */
  useEffect(() => {
    const intervals = {};

    Object.keys(TUNELS).forEach((key) => {
      const data = allWahana[key];

      if ((data?.step === 1 || data?.step === 2) && data.startTime) {
        intervals[key] = setInterval(() => {
          const diff = Math.floor((Date.now() - data.startTime) / 1000);
          setLiveTimers((prev) => ({
            ...prev,
            [key]: {
              minutes: Math.floor(diff / 60),
              seconds: diff % 60,
            },
          }));
        }, 1000);
      } else {
        setLiveTimers((prev) => ({
          ...prev,
          [key]: { minutes: 0, seconds: 0 },
        }));
      }
    });

    return () => Object.values(intervals).forEach(clearInterval);
  }, [allWahana]);

  /* =========================
      UTIL
  ========================== */
  const getColor = (step) => {
    if (step === 2) return "bg-blue-500";
    if (step === 1) return "bg-yellow-400";
    return "bg-gray-400";
  };

  const getStatusIcon = (step) => {
    if (step === 2) return <StatusReadyIcon className="w-5 h-5 text-white" />;
    if (step === 1) return <StatusActiveIcon className="w-5 h-5 text-black" />;
    return <StatusIdleIcon className="w-5 h-5" />;
  };

  const calcDuration = (start) => {
    const diff = Math.floor((Date.now() - start) / 1000);
    return {
      minutes: Math.floor(diff / 60),
      seconds: diff % 60,
    };
  };

  /* =========================
      MAIN FLOW
  ========================== */
  const handleClick = (key) => {
    const data = allWahana[key];
    if (!data) return;

    let { batch, group, step, startTime = null } = data;
    const now = Date.now();

    if (step === 0) {
      step = 1;
      startTime = now;
    } else if (step === 1) {
      step = 2;
    } else if (step === 2) {
      if (startTime) {
        const duration = calcDuration(startTime);
        set(ref(db, `logs/${key}/batch${batch}/group${group}`), { duration });
      }

      step = 0;
      startTime = null;
      group++;

      if (group > 3) {
        group = 1;
        batch++;
      }
    }

    set(ref(db, `wahana/${key}`), {
      ...data,
      batch,
      group,
      step,
      startTime,
    });
  };

  /* =========================
      UI
  ========================== */
  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6">

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">
          Monitor Tunel
        </h1>
        <p className="text-sm text-gray-400">
          Main Tunel & Chamber AI
        </p>
      </div>

      {/* STATUS 9 WAHANA */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[1,2,3,4,5,6,7,8,9].map((i) => {
          const data = allWahana[`wahana${i}`];
          return (
            <div key={i} className="flex flex-col items-center text-center">
              {data && (
                <div className="text-[10px] text-yellow-400 mb-1">
                  B{data.batch} • G{data.group}
                </div>
              )}

              <div
                className={`w-10 h-10 rounded-full ${getColor(data?.step)}
                flex items-center justify-center
                ${data?.maintenance ? "ring-2 ring-red-500" : ""}`}
              >
                {getStatusIcon(data?.step)}
              </div>

              <span className="text-[11px] mt-1 opacity-80">
                {WAHANA_NAME[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* MAIN PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {Object.keys(TUNELS).map((key) => {
          const data = allWahana[key];
          const time = liveTimers[key] || { minutes: 0, seconds: 0 };

          return (
            <div key={key} className="bg-gray-800 rounded-xl p-6 text-center">

              <h2 className="text-lg font-bold text-yellow-400 mb-1">
                {TUNELS[key]}
              </h2>

              {data && (
                <p className="text-sm mb-6 text-gray-300">
                  Batch {data.batch} • Group {data.group}
                </p>
              )}

              <button
                onClick={() => handleClick(key)}
                className={`w-32 h-32 rounded-full mx-auto mb-4
                flex items-center justify-center shadow-xl
                ${getColor(data?.step)}`}
              >
                {(data?.step === 1 || data?.step === 2) ? (
                  <div className="flex flex-col items-center">
                    <ClockIcon
                      className={`w-6 h-6 ${
                        data.step === 2 ? "text-white" : "text-black"
                      }`}
                    />
                    <span
                      className={`text-xl font-mono font-bold ${
                        data.step === 2 ? "text-white" : "text-black"
                      }`}
                    >
                      {String(time.minutes).padStart(2,"0")}:
                      {String(time.seconds).padStart(2,"0")}
                    </span>
                  </div>
                ) : (
                  <PlayIcon className="w-10 h-10 text-gray-600" />
                )}
              </button>

            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
