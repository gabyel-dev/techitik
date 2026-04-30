import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GetSubmissions, GetViolations, ReleaseScore, BulkReleaseScores } from "../../api/attempt";
import Loader from "../loader";
import toast from "react-hot-toast";
import {
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiEyeDuotone,
  PiEyeSlashDuotone,
} from "react-icons/pi";

export default function TeacherSubmissions() {
  const { quizId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViolations, setShowViolations] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [quizId]);

  const fetchSubmissions = async () => {
    try {
      const response = await GetSubmissions(quizId);
      setSubmissions(response.data || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewViolations = async (submission) => {
    try {
      setSelectedSubmission(submission);
      const response = await GetViolations(submission.id);
      setViolations(response.data || []);
      setShowViolations(true);
    } catch (err) {
      toast.error("Failed to load violations");
    }
  };

  const handleReleaseScore = async (attemptId) => {
    try {
      await ReleaseScore(attemptId);
      toast.success("Score released");
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to release score");
    }
  };

  const handleBulkRelease = async () => {
    if (!confirm("Release scores for all students?")) return;

    try {
      await BulkReleaseScores(quizId);
      toast.success("All scores released");
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to release scores");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quiz Submissions</h1>
            <p className="text-slate-500 mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={handleBulkRelease}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Release All Scores
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Base Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Violations</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Penalty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Final Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Submitted</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((submission) => {
                  const hasPenalty = (submission.violation_count || 0) > 3;
                  return (
                    <tr key={submission.id} className={`hover:bg-slate-50 transition-colors ${hasPenalty ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{submission.users?.full_name}</p>
                          <p className="text-xs text-slate-500">{submission.users?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'submitted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : submission.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {submission.base_score || 0}/{submission.max_score || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewViolations(submission)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            hasPenalty
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          <PiWarningDuotone size={16} />
                          {submission.violation_count || 0}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${hasPenalty ? 'text-red-600' : 'text-slate-400'}`}>
                          -{submission.penalty_score || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-lg text-slate-900">
                          {submission.final_score || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDate(submission.submitted_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {submission.status === 'submitted' && (
                          <button
                            onClick={() => handleReleaseScore(submission.id)}
                            disabled={submission.score_released}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              submission.score_released
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                          >
                            {submission.score_released ? (
                              <>
                                <PiCheckCircleDuotone size={16} />
                                Released
                              </>
                            ) : (
                              <>
                                <PiEyeDuotone size={16} />
                                Release
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violations Modal */}
        {showViolations && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Focus Violations</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedSubmission.users?.full_name} - {violations.length} event{violations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowViolations(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2">
                  {violations.map((violation, index) => (
                    <div
                      key={violation.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        violation.event_type === 'blur' || violation.event_type === 'hidden'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-slate-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-slate-900 capitalize">{violation.event_type}</p>
                          <p className="text-xs text-slate-500">{formatDate(violation.timestamp)}</p>
                        </div>
                      </div>
                      {(violation.event_type === 'blur' || violation.event_type === 'hidden') && (
                        <PiWarningDuotone size={20} className="text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
