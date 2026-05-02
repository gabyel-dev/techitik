import { useEffect, useState } from "react";
import { CreateRoom } from "../../api/rooms";
import {
  PiBooksDuotone,
  PiUsersDuotone,
  PiSparkleDuotone,
  PiXDuotone,
} from "react-icons/pi";

export const CreateRoomModal = ({ onClose, onSuccess }) => {
  const [roomPayload, setRoomPayload] = useState({
    subject: "",
    room_name: "",
  });

  const [sectionState, setSectionState] = useState({
    course: "",
    year: "",
    section: "",
  });
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setRoomPayload((prev) => ({ ...prev, [name]: value }));
  };

  const createRoomHandler = async () => {
    if (
      !roomPayload?.room_name?.trim() ||
      !roomPayload?.subject ||
      !sectionState.course ||
      !sectionState.year ||
      !sectionState.section ||
      !agreedToTerms
    ) {
      setError("Please fill in all fields and agree to the terms.");
      return;
    }

    if (isCreating) return;

    setIsCreating(true);
    setError("");

    try {
      await CreateRoom({
        room_name: roomPayload.room_name,
        subject: roomPayload.subject,
        section: `${sectionState.course} - ${sectionState.year}${sectionState.section}`,
      });
      setRoomPayload({ subject: "", room_name: "" });
      setSectionState({ course: "", year: "", section: "" });
      setAgreedToTerms(false);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to create room");
      setTimeout(() => setError(""), 4000);
      console.error("Room creation error: ", err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/20 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative p-8 shadow-2xl flex flex-col gap-6 rounded-3xl bg-white text-slate-900 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 z-[101]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <PiXDuotone size={20} />
        </button>

        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <PiBooksDuotone className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create Room</h2>
              <p className="text-sm text-slate-500">
                Set up a new learning space for your students
              </p>
            </div>
          </div>
        </header>

        <hr className="border-slate-100" />

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Room Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <PiBooksDuotone className="text-slate-400" size={16} />
            Classroom Name
          </label>
          <input
            type="text"
            name="room_name"
            value={roomPayload?.room_name}
            placeholder="e.g., Intro to Web Development (Sec A)"
            onChange={onChange}
            className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400 text-sm"
          />
          <p className="text-xs text-slate-400">
            Choose a unique name for your room
          </p>
        </div>

        {/* Subject Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <PiSparkleDuotone className="text-slate-400" size={16} />
            Select Subject
          </label>
          <select
            name="subject"
            value={roomPayload?.subject}
            onChange={onChange}
            className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 appearance-none bg-white text-sm cursor-pointer"
          >
            <option value="">Choose a subject...</option>
            <option value="math">📐 Mathematics</option>
            <option value="science">🔬 Science</option>
            <option value="history">📚 History</option>
            <option value="literature">✍️ Literature</option>
          </select>
        </div>

        {/* Section Grid */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <PiUsersDuotone className="text-slate-400" size={16} />
            Class Details
          </label>
          <div className="flex w-full gap-3">
            <div className="flex-1">
              <select
                name="course"
                value={sectionState.course}
                onChange={(e) =>
                  setSectionState({ ...sectionState, course: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white cursor-pointer"
              >
                <option value="" disabled>
                  Course
                </option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSHM">BSHM</option>
              </select>
            </div>
            <div className="flex-1">
              <select
                name="year"
                value={sectionState.year}
                onChange={(e) =>
                  setSectionState({ ...sectionState, year: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white cursor-pointer"
              >
                <option value="" disabled>
                  Year
                </option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="flex-1">
              <select
                name="section"
                value={sectionState.section}
                onChange={(e) =>
                  setSectionState({ ...sectionState, section: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white cursor-pointer"
              >
                <option value="" disabled>
                  Section
                </option>
                {[
                  "A",
                  "B",
                  "C",
                  "D",
                  "E",
                  "F",
                  "G",
                  "H",
                  "I",
                  "J",
                  "K",
                  "L",
                  "M",
                  "N",
                  "O",
                  "P",
                  "Q",
                  "R",
                  "S",
                  "T",
                  "U",
                  "V",
                  "W",
                  "X",
                  "Y",
                  "Z",
                ].map((letter) => (
                  <option key={letter} value={letter}>
                    {letter}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-start gap-3 pt-2 bg-slate-50 p-4 rounded-2xl">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          />
          <label
            htmlFor="terms"
            className="text-xs text-slate-600 leading-relaxed select-none cursor-pointer"
          >
            I have read and agree to the Techlitik{" "}
            <span className="text-emerald-600 font-semibold cursor-pointer underline hover:text-emerald-700 transition-colors">
              Terms & Conditions
            </span>{" "}
            and Student Privacy Policy.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => createRoomHandler()}
            disabled={!agreedToTerms || isCreating}
            className={`flex-[2] px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
              agreedToTerms && !isCreating
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Room"
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
