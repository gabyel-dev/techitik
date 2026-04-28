import { useState } from "react";
import { CreateRoom } from "../../api/rooms";
import toast from "react-hot-toast";

export const CreateRoomModal = ({ onClose }) => {
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

  const createRoom = async () => {
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
      onClose?.();
      toast.success("Room created successfully!");
    } catch (err) {
      toast.error("Failed to create room. Please try again.");
      setError(err.response?.data?.message || "Failed to create room");
      setTimeout(() => setError(""), 4000);
      console.error("Room creation error: ", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <header className="bg-slate-50 px-8 py-6">
          <h2 className="text-2xl font-black text-slate-900">Create Room</h2>
          <p className="text-sm text-slate-500">
            Enter details to set up your new virtual classroom.
          </p>
        </header>

        <div className="space-y-6 p-8">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Classroom Name
              </label>
              <input
                type="text"
                name="room_name"
                value={roomPayload?.room_name}
                placeholder="e.g. Advanced Frontend Engineering"
                onChange={onChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Subject
                </label>
                <select
                  name="subject"
                  value={roomPayload?.subject}
                  onChange={onChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Choose Subject</option>
                  <option value="math">Math</option>
                  <option value="science">Science</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Course
                </label>
                <select
                  value={sectionState.course}
                  onChange={(e) =>
                    setSectionState({ ...sectionState, course: e.target.value })
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">Course</option>
                  <option value="BSIT">BSIT</option>
                  <option value="BSCS">BSCS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Year Level
                </label>
                <select
                  value={sectionState.year}
                  onChange={(e) =>
                    setSectionState({ ...sectionState, year: e.target.value })
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Section
                </label>
                <select
                  value={sectionState.section}
                  onChange={(e) =>
                    setSectionState({
                      ...sectionState,
                      section: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-5 w-5 rounded-md border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-xs leading-relaxed text-slate-600">
              I agree to the{" "}
              <span className="font-bold text-emerald-600 underline">
                Terms of Service
              </span>{" "}
              and understand the data privacy policies.
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3.5 font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => createRoom()}
              disabled={!agreedToTerms || isCreating}
              className={`flex-[2] rounded-xl py-3.5 font-bold text-white shadow-lg transition-all active:scale-95 ${
                agreedToTerms && !isCreating
                  ? "bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-600"
                  : "cursor-not-allowed bg-slate-200 shadow-none text-slate-400"
              }`}
            >
              {isCreating ? "Creating Room..." : "Create Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
