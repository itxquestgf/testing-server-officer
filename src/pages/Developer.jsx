import { ref, onValue, update, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  SettingsIcon,
  ResetIcon,
  ClockIcon,
  AlertIcon,
} from "../components/Icons";
import Footer from "../components/Footer";

// UPDATE: List wahana lengkap 1-9 sesuai urutan terbaru
const WAHANA_LIST = {
  wahana1: "Hologram",
  wahana2: "Totem",
  wahana3: "Train 1",
  wahana4: "Dream Farm",
  wahana5: "Space-X",
  wahana6: "Train 2",
  wahana7: "Tunel",
  wahana8: "Chamber AI",
  wahana9: "B.Gondola & Gondola",
};

export default function Developer() {
  const [allWahana, setAllWahana] = useState({});
  const [selected, setSelected] = useState("wahana1");
  const [batch, setBatch] = useState(1);
  const [group, setGroup] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  /* =========================
      LOAD DATA
  ========================== */
  useEffect(() => {
    const unsub = onValue(ref(db, "wahana"), (snap) => {
      setAllWahana(snap.val() || {});
    });
    return () => unsub();
  }, []);

  /* =========================
      SET POSISI MANUAL (RESET STEP)
  ========================== */
  const setPosition = () => {
    if (!window.confirm(`Set ${WAHANA_LIST[selected]} ke Batch ${batch} Group ${group}?`)) return;
    
    set(ref(db, `wahana/${selected}`), {
      batch: Number(batch),
      group: Number(group),
      step: 0,
      startTime: null,
    });
  };

  /* =========================
      HAPUS DATA BATCH & GROUP
  ========================== */
  const deleteBatchGroup = () => {
    if (!window.confirm(`Hapus data waktu ${WAHANA_LIST[selected]} Batch ${batch} Group ${group}?`)) return;

    // Menghapus data durasi di node logs
    const pathToDuration = `logs/${selected}/batch${batch}/group${group}`;

    set(ref(db, pathToDuration), null)
      .then(() => {
        alert('Data waktu berhasil dihapus');
      })
      .catch((error) => {
        console.error('Gagal menghapus data waktu:', error);
      });
  };

  /* =========================
      SET MENIT & DETIK MANUAL
  ========================== */
  const setManualTime = () => {
    const pathToDuration = `logs/${selected}/batch${batch}/group${group}/duration`;
    
    update(ref(db, pathToDuration), {
      minutes: Number(minutes),
      seconds: Number(seconds),
    }).then(() => {
        alert(`Waktu ${WAHANA_LIST[selected]} berhasil diupdate!`);
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 md:px-6 py-6 md:py-10 safe-top safe-bottom">
      {/* Header */}
      <div className="text-center mb-8 md:mb-10 fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400">
            Developer Mode
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-400">
          Kontrol Manual Database Wahana
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl border border-gray-700/50">
        
        {/* PILIH WAHANA */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-300 uppercase tracking-wider">
            <AlertIcon className="w-4 h-4 text-yellow-400" />
            Wahana Target
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-700 border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 text-white transition-all shadow-inner"
          >
            {Object.keys(WAHANA_LIST).map((key) => (
              <option key={key} value={key}>
                {key.toUpperCase()} - {WAHANA_LIST[key]}
              </option>
            ))}
          </select>
        </div>

        {/* SET BATCH & GROUP */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs font-bold mb-2 text-gray-400 uppercase">
              Target Batch
            </label>
            <input
              type="number"
              min="1"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-700 border border-gray-600 focus:border-blue-500 text-center text-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 text-gray-400 uppercase">
              Target Group
            </label>
            <input
              type="number"
              min="1"
              max="3"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-700 border border-gray-600 focus:border-blue-500 text-center text-xl font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
            onClick={setPosition}
            className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
            <SettingsIcon className="w-5 h-5" />
            SET POSISI
            </button>

            <button
            onClick={deleteBatchGroup}
            className="py-4 rounded-xl bg-red-600 hover:bg-red-500 font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
            <ResetIcon className="w-5 h-5" />
            HAPUS LOG
            </button>
        </div>

        {/* SET WAKTU */}
        <div className="border-t border-gray-700 pt-8 mt-4">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <ClockIcon className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-yellow-400 uppercase tracking-widest">
              Koreksi Waktu Manual
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-400 mb-2">MENIT</label>
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-center text-2xl font-mono text-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">DETIK</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-center text-2xl font-mono text-yellow-400"
              />
            </div>
          </div>

          <button
            onClick={setManualTime}
            className="w-full py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black shadow-lg active:scale-95 transition-all"
          >
            UPDATE DURASI LOG
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}