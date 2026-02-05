import { useEffect, useState } from "react";
import { socket } from "../socket";
import { MonitorIcon, DownloadIcon, ResetIcon, ClockIcon, StatusActiveIcon, StatusIdleIcon, StatusReadyIcon } from "../components/Icons";
import Footer from "../components/Footer";

// NAMA WAHANA
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

// TARGET MENIT
const TARGET_MINUTES = {
  1: 23, 2: 23, 3: 5, 4: 13, 5: 14, 6: 4, 7: 15, 8: 3, 9: 13,
};

export default function Monitor() {
  const [logs, setLogs] = useState({});
  const [wahana, setWahana] = useState({});
  const [maintenance, setmaintenance] = useState({});

  /* =========================
      REALTIME LISTENER (SOCKET)
  ========================== */
  useEffect(() => {
    // Ambil data awal (Wahana, Logs, Maintenance sekaligus dalam satu objek db)
    socket.on("initData", (db) => {
      setWahana(db.wahana || {});
      setLogs(db.logs || {});
      setmaintenance(db.maintenance || {});
    });

    // Update tiap ada perubahan
    socket.on("dataChanged", (db) => {
      setWahana(db.wahana || {});
      setLogs(db.logs || {});
      setmaintenance(db.maintenance || {});
    });

    return () => {
      socket.off("initData");
      socket.off("dataChanged");
    };
  }, []);

  const getColor = (step) => {
    if (step === 2) return "bg-blue-500";   // READY
    if (step === 1) return "bg-yellow-400"; // PROSES
    return "bg-gray-400";                  // IDLE
  };

  const getStatusIcon = (step) => {
    if (step === 2) return <StatusReadyIcon className="w-5 h-5 text-white" />;
    if (step === 1) return <StatusActiveIcon className="w-5 h-5 text-black" />;
    return <StatusIdleIcon className="w-5 h-5" />;
  };

  /* =========================
      RESET SEMUA DATA
  ========================== */
  const resetAll = () => {
    if (!window.confirm("Apakah Anda yakin ingin mereset semua data di PC Server?")) return;
    
    // Kita kirim instruksi ke server untuk mengosongkan folder logs dan maintenance
    // Serta mengembalikan wahana ke batch 1
    const newWahanaState = {};
    for (let i = 1; i <= 9; i++) {
      newWahanaState[`wahana${i}`] = {
        batch: 1,
        group: 1,
        step: 0,
        startTime: null,
      };
    }

    // Reset via socket (mengirim path kosong untuk menghapus data di server)
    socket.emit("updateData", { path: "wahana", value: newWahanaState });
    socket.emit("updateData", { path: "logs", value: {} });
    socket.emit("updateData", { path: "maintenance", value: {} });
  };

  /* =========================
      DOWNLOAD CSV (LOGIKA LOKAL)
  ========================== */
  const downloadCSV = () => {
    let csv = "Wahana,Batch,Group,Menit,Detik\n";

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

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Report_Wahana_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const getDiff = (wahanaId, minutes) => {
    const target = TARGET_MINUTES[wahanaId];
    if (minutes == null) return null;
    return minutes - target;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6 safe-top safe-bottom">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MonitorIcon className="w-8 h-8 text-yellow-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 uppercase tracking-tight">
            Monitor Progress Wahana
          </h1>
        </div>
        <p className="text-sm text-gray-400">Terhubung ke Database Lokal PC Wahana</p>
      </div>

      {/* STATUS BULATAN 9 WAHANA */}
      <div className="grid grid-cols-3 md:grid-cols-9 gap-4 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const data = wahana[`wahana${i}`];
          return (
            <div key={i} className="flex flex-col items-center text-center p-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className={`w-10 h-10 rounded-full ${getColor(data?.step)} flex items-center justify-center shadow-lg transition-all duration-500`}>
                {getStatusIcon(data?.step)}
              </div>
              <span className="text-[9px] text-gray-400 mt-2 font-bold uppercase truncate w-full">{WAHANA[i]}</span>
              {data && (
                <span className="text-[10px] text-yellow-400 font-mono">
                  B{data.batch} G{data.group}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* LIST TIMING DETAIL */}
      <div className="space-y-6 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const wahanaLogs = logs[`wahana${i}`] || {};
          return (
            <div key={i} className="bg-gray-800/80 backdrop-blur rounded-2xl p-5 border border-gray-700 shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h2 className="text-yellow-400 font-black text-lg uppercase tracking-wide">{WAHANA[i]}</h2>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400 text-xs font-bold uppercase">Target {TARGET_MINUTES[i]} Menit</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((batch) => (
                  <div key={batch} className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
                    <div className="text-blue-400 text-[10px] font-black mb-2 uppercase tracking-tighter">Batch {batch}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((group) => {
                        const d = wahanaLogs?.[`batch${batch}`]?.[`group${group}`]?.duration;
                        const m = d?.minutes;
                        const s = d?.seconds;
                        const diff = getDiff(i, m);

                        return (
                          <div key={group} className="bg-gray-800 rounded-lg py-2 flex flex-col items-center justify-center min-h-[50px]">
                            <div className="text-[8px] text-gray-500 mb-1">G{group}</div>
                            {d ? (
                              <div className="flex flex-col items-center leading-tight">
                                <span className="text-[11px] text-white font-mono font-bold">
                                  {m}:{String(s).padStart(2, "0")}
                                </span>
                                <div className="text-[9px] font-bold">
                                  {diff < 0 && <span className="text-green-400">{diff}m</span>}
                                  {diff > 0 && <span className="text-red-500">+{diff}m</span>}
                                  {diff === 0 && <span className="text-blue-400">OK</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-700 text-[10px]">--:--</span>
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

      {/* FOOTER ACTIONS */}
      <div className="sticky bottom-6 flex gap-4 max-w-md mx-auto z-50">
        <button
          onClick={downloadCSV}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <DownloadIcon className="w-5 h-5" /> UNDUH
        </button>
        <button
          onClick={resetAll}
          className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <ResetIcon className="w-5 h-5" /> RESET
        </button>
      </div>
      
      <div className="h-20"></div>
      <Footer />
    </div>
  );
}