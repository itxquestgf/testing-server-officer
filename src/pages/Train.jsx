import { ref, onValue, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  TrainIcon,
  PlayIcon,
  ClockIcon,
  StatusActiveIcon,
  StatusIdleIcon,
  StatusReadyIcon,
} from "../components/Icons";
import Footer from "../components/Footer";

/**
 * Train Mapping Koreksi:
 * wahana3 = Train 1
 * wahana6 = Train 2
 */
const TRAINS = {
  wahana3: "Train 1",
  wahana6: "Train 2",
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

export default function Train() {
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

    Object.keys(TRAINS).forEach((key) => {
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

  const calcDuration = (start) => {
    const diff = Math.floor((Date.now() - start) / 1000);
    return {
      minutes: Math.floor(diff / 60),
      seconds: diff % 60,
    };
  };

  const getStatusIcon = (step) => {
    if (step === 2) return <StatusReadyIcon className="w-5 h-5 text-white" />;
    if (step === 1) return <StatusActiveIcon className="w-5 h-5 text-black" />;
    return <StatusIdleIcon className="w-5 h-5" />;
  };

  /* =========================
      MAIN BUTTON FLOW
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
      MAINTENANCE
  ========================== */
  const handleMaintenance = (key) => {
    const data = allWahana[key];
    if (!data) return;

    const now = Date.now();

    if (!data.maintenance) {
      set(ref(db, `wahana/${key}`), {
        ...data,
        maintenance: true,
        maintenanceStart: now,
      });
    } else {
      const durationInSeconds = Math.floor(
        (now - data.maintenanceStart) / 1000
      );
      const h = Math.floor(durationInSeconds / 3600);
      const m = Math.floor((durationInSeconds % 3600) / 60);
      const s = durationInSeconds % 60;

      set(ref(db, `maintenance/${key}/${data.maintenanceStart}-${now}`), {
        duration: `${h}-${m}-${s}`,
      });

      set(ref(db, `wahana/${key}`), {
        ...data,
        maintenance: false,
        maintenanceStart: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2">
          <TrainIcon className="w-8 h-8 text-yellow-400" />
          <h1 className="text-2xl font-bold text-yellow-400">Monitor Train</h1>
        </div>
        <p className="text-sm text-gray-400">Train 1 & Train 2</p>
      </div>

      {/* STATUS BULATAN */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const data = allWahana[`wahana${i}`];
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full ${getColor(data?.step)}
                flex items-center justify-center
                ${data?.maintenance ? "ring-2 ring-red-500" : ""}`}
              >
                {getStatusIcon(data?.step)}
              </div>

              <span className="text-[11px] mt-1 opacity-80 text-center">
                {WAHANA_NAME[i]}
              </span>

              {data && (
                <span className="text-[10px] text-gray-400">
                  B{data.batch}-G{data.group}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* TRAIN PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {Object.keys(TRAINS).map((key) => {
          const data = allWahana[key];
          const time = liveTimers[key] || { minutes: 0, seconds: 0 };

          return (
            <div key={key} className="bg-gray-800 rounded-xl p-6 text-center">
              <h2 className="text-lg font-bold text-yellow-400 mb-1">
                {TRAINS[key]}
              </h2>

              {data && (
                <p className="text-sm mb-4 text-gray-300">
                  Batch {data.batch} • Group {data.group}
                </p>
              )}

              <button
                onClick={() => handleClick(key)}
                className={`w-32 h-32 rounded-full mx-auto mb-4
                flex items-center justify-center shadow-xl
                ${getColor(data?.step)}
                active:scale-95`}
              >
                {data?.step === 1 || data?.step === 2 ? (
                  <div className="flex flex-col items-center">
                    <ClockIcon className="w-6 h-6" />
                    <span className="text-xl font-mono font-bold">
                      {String(time.minutes).padStart(2, "0")}:
                      {String(time.seconds).padStart(2, "0")}
                    </span>
                  </div>
                ) : (
                  <PlayIcon className="w-10 h-10 text-gray-600" />
                )}
              </button>

              <button
                onClick={() => handleMaintenance(key)}
                className={`w-full py-2 rounded-lg font-bold
                ${
                  data?.maintenance
                    ? "bg-red-700 animate-pulse"
                    : "bg-gray-700"
                }`}
              >
                {data?.maintenance ? "STOP MAINTENANCE" : "MAINTENANCE"}
              </button>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}