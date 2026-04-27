import { useState } from "react";
import { CreateRoom } from "../../api/rooms";

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
  // State for the Terms and Conditions checkbox
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setRoomPayload((prev) => ({ ...prev, [name]: value }));
  };

  const createRoom = async () => {
    // Validation: Added check for agreedToTerms
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

    try {
      await CreateRoom({
        room_name: roomPayload.room_name,
        subject: roomPayload.subject,
        section: `${sectionState.course} - ${sectionState.year}${sectionState.section}`,
      });
      setRoomPayload({ subject: "", room_name: "" });
      setSectionState({ course: "", year: "", section: "" });
      setAgreedToTerms(false);
      setError("");
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message);
      setTimeout(() => setError(""), 4000);
      console.error("Room creation error: ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="p-8 shadow-2xl flex flex-col gap-5 rounded-2xl bg-white text-slate-900 w-full max-w-md">
        <header>
          <h2 className="text-xl font-bold">Create Room</h2>
          <p className="text-sm text-slate-500">
            Set up a new space for your students.
          </p>
        </header>

        <hr className="border-slate-100" />
        {error && (
          <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Room Name Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Classroom Name
          </label>
          <input
            type="text"
            name="room_name"
            value={roomPayload?.room_name}
            placeholder="e.g., Intro to Web Development (Sec A)"
            onChange={onChange}
            className="px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Subject Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Select Subject
          </label>
          <select
            name="subject"
            value={roomPayload?.subject}
            onChange={onChange}
            className="px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none bg-white"
          >
            <option value="">Choose a subject...</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="literature">Literature</option>
          </select>
        </div>

        {/* Section Grid */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Class Details
          </label>
          <div className="flex w-full gap-3">
            <select
              name="course"
              value={sectionState.course}
              onChange={(e) =>
                setSectionState({ ...sectionState, course: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">Course</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSHM">BSHM</option>
            </select>
            <select
              name="year"
              value={sectionState.year}
              onChange={(e) =>
                setSectionState({ ...sectionState, year: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">Year</option>
              <option value="1">1st</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
              <option value="4">4th</option>
            </select>
            <select
              name="section"
              value={sectionState.section}
              onChange={(e) =>
                setSectionState({ ...sectionState, section: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">Sec</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <label
            htmlFor="terms"
            className="text-xs text-slate-600 leading-tight"
          >
            I have read and agree to the Techlitik{" "}
            <span className="text-emerald-600 font-semibold cursor-pointer underline">
              Terms & Conditions
            </span>{" "}
            and Student Privacy Policy.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => createRoom()}
            disabled={!agreedToTerms}
            className={`flex-[2] px-4 py-2.5 rounded-lg font-semibold transition-colors ${
              agreedToTerms
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
