import { ref, onValue, update, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { MonitorIcon, DownloadIcon, ResetIcon, ClockIcon, StatusActiveIcon, StatusIdleIcon, StatusReadyIcon } from "../components/Icons";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

// NAMA WAHANA (DIUPDATE SESUAI URUTAN TERBARU)
const WAHANA = {
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

// TARGET MENIT (DIUPDATE SESUAI URUTAN TERBARU)
const TARGET_MINUTES = {
  1: 23, // Hologram
  2: 23, // Totem
  3: 5,  // Train 1
  4: 13, // Dream Farm
  5: 14, // Space-X
  6: 4,  // Train 2
  7: 15, // Tunel
  8: 3,  // Chamber AI
  9: 13, // B.Gondola & Gondola
};

export default function Monitor() {
  const [logs, setLogs] = useState({});
  const [wahana, setWahana] = useState({});
  const navigate = useNavigate();
  const [maintenance, setmaintenance] = useState({});

  useEffect(() => {
    onValue(ref(db, "maintenance"), (snap) => {
      const data = snap.val() || {};
      setmaintenance(data);
    });
  }, []);

  useEffect(() => {
    onValue(ref(db, "logs"), (snap) => {
      setLogs(snap.val() || {});
    });

    onValue(ref(db, "wahana"), (snap) => {
      setWahana(snap.val() || {});
    });
  }, []);

  const getColor = (step) => {
    if (step === 2) return "bg-blue-500";   // READY
    if (step === 1) return "bg-yellow-400"; // PROSES
    return "bg-gray-400";                  // IDLE
  };

  // RESET SEMUA (DITINGKATKAN MENJADI 9 WAHANA)
  const resetAll = () => {
    if (!window.confirm("Apakah Anda yakin ingin mereset semua data?")) return;
    const updates = {};
    for (let i = 1; i <= 9; i++) {
      updates[`wahana/wahana${i}`] = {
        ...wahana[`wahana${i}`],
        batch: 1,
        group: 1,
        step: 0,
        startTime: null,
      };
    }
    update(ref(db), updates);
    remove(ref(db, "logs"));
    remove(ref(db, "maintenance"));
  };

  // DOWNLOAD CSV
  const downloadCSV = () => {
    let csv = "Wahana,Batch,Group,Menit,Detik\n";

    // Log Wahana
    Object.keys(logs).forEach((wahanaKey) => {
      const idx = wahanaKey.replace("wahana", "");
      const name = WAHANA[idx];

      Object.keys(logs[wahanaKey] || {}).forEach((batchKey) => {
        Object.keys(logs[wahanaKey][batchKey] || {}).forEach((groupKey) => {
          const d = logs[wahanaKey][batchKey][groupKey]?.duration;
          if (d) {
            csv += `${name},${batchKey.replace("batch", "")},${groupKey.replace("group", "")},${d.minutes},${d.seconds}\n`;
          }
        });
      });
    });

    // Log Maintenance
    Object.keys(maintenance).forEach((wahanaKey) => {
      const name = WAHANA[wahanaKey.replace("wahana", "")];
      Object.keys(maintenance[wahanaKey] || {}).forEach((entryKey) => {
          const d = maintenance[wahanaKey][entryKey]?.duration;
          if (d) {
            csv += `${name} (Maintenance),-,-,${entryKey},${d}\n`;
          }
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "monitor_wahana.csv";
    link.click();
  };

  const getStatusIcon = (step) => {
    if (step === 2) return <StatusReadyIcon className="w-5 h-5 text-white" />;
    if (step === 1) return <StatusActiveIcon className="w-5 h-5 text-black" />;
    return <StatusIdleIcon className="w-5 h-5" />;
  };

  // HITUNG SELISIH TARGET
  const getDiff = (wahanaId, minutes) => {
    const target = TARGET_MINUTES[wahanaId];
    if (minutes == null) return null;
    return minutes - target; // (+) lebih lama, (-) lebih cepat
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6 safe-top safe-bottom">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MonitorIcon className="w-8 h-8 text-yellow-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Monitor Progress Wahana
          </h1>
        </div>
        <p className="text-sm text-gray-400">
          Perbandingan waktu aktual vs target
        </p>
      </div>

      {/* STATUS BULATAN (UPDATE KE 9) */}
      <div className="grid grid-cols-3 md:grid-cols-9 gap-4 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const data = wahana[`wahana${i}`];
          return (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full ${getColor(data?.step)} flex items-center justify-center shadow-lg`}>
                {getStatusIcon(data?.step)}
              </div>
              <span className="text-[10px] text-yellow-400 mt-2 font-semibold uppercase">{WAHANA[i]}</span>
              {data && (
                <span className="text-[10px] text-yellow-300">
                  B{data.batch} • G{data.group}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* LIST TIMING (UPDATE KE 9) */}
      <div className="space-y-6 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const wahanaLogs = logs[`wahana${i}`] || {};
          return (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h2 className="text-yellow-400 font-bold mb-4 flex justify-between">
                <span>{WAHANA[i]}</span>
                <span className="text-gray-500 text-sm">Target {TARGET_MINUTES[i]} m</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((batch) => (
                  <div key={batch} className="bg-gray-700 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold mb-2">
                      Batch {batch}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[1, 2, 3].map((group) => {
                        const d = wahanaLogs?.[`batch${batch}`]?.[`group${group}`]?.duration;
                        const m = d?.minutes;
                        const s = d?.seconds;
                        const diff = getDiff(i, m);

                        return (
                          <div key={group} className="bg-gray-600 rounded-md p-2 text-center">
                            <div className="text-gray-400 mb-1 font-mono">G{group}</div>

                            {d ? (
                              <div className="flex flex-col font-mono font-bold">
                                <span className="text-yellow-300">
                                  {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                                </span>
                                <div className="text-[9px]">
                                  {diff < 0 && <span className="text-green-400">{diff}m</span>}
                                  {diff > 0 && <span className="text-red-400">+{diff}m</span>}
                                  {diff === 0 && <span className="text-blue-400">OK</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">--:--</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MAINTENANCE LOG */}
      <div className="space-y-6 mt-12">
        <h2 className="text-xl font-bold text-red-400 text-center uppercase tracking-widest">
          Maintenance Log
        </h2>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const m = maintenance[`wahana${i}`];
          if (!m || Object.keys(m).length === 0) return null;

          return (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border-l-4 border-red-600">
              <h3 className="text-red-400 font-bold mb-3 uppercase text-sm">
                {WAHANA[i]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.keys(m).map((logKey) => (
                  <div key={logKey} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-mono italic">{logKey.split('-')[0].slice(-5)}</span>
                    <div className="font-mono text-red-300 font-bold">
                      {m[logKey].duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTION */}
      <div className="flex gap-4 max-w-md mx-auto mt-10">
        <button
          onClick={downloadCSV}
          className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold shadow-lg transition-colors"
        >
          Unduh Data
        </button>
        <button
          onClick={resetAll}
          className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold shadow-lg transition-colors"
        >
          Reset Semua
        </button>
      </div>
      <Footer />
    </div>
  );
}