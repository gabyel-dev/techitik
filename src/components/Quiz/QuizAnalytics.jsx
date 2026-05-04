import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetQuizAnalytics } from "../../api/attempt";
import ReactECharts from "echarts-for-react";
import { Loader } from "../loader";
import toast from "react-hot-toast";
import { PiArrowLeftDuotone } from "react-icons/pi";

export default function QuizAnalytics() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [quizId]);

  const fetchAnalytics = async () => {
    try {
      const response = await GetQuizAnalytics(quizId);
      setAnalytics(response.data);
    } catch (err) {
      toast.error("Failed to load analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreDistributionOption = () => {
    if (!analytics?.submissions) return {};

    const scores = analytics.submissions.map((s) => s.final_score);
    const maxScore = analytics.submissions[0]?.max_score || 100;

    // Create bins for score ranges
    const bins = {};
    const binSize = Math.ceil(maxScore / 10);

    for (let i = 0; i <= maxScore; i += binSize) {
      bins[`${i}-${Math.min(i + binSize - 1, maxScore)}`] = 0;
    }

    scores.forEach((score) => {
      const binIndex = Math.floor(score / binSize) * binSize;
      const binKey = `${binIndex}-${Math.min(binIndex + binSize - 1, maxScore)}`;
      if (bins[binKey] !== undefined) bins[binKey]++;
    });

    return {
      title: {
        text: "Score Distribution",
        left: "center",
        textStyle: { fontSize: 18, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "category",
        data: Object.keys(bins),
        name: "Score Range",
        nameLocation: "middle",
        nameGap: 30,
      },
      yAxis: {
        type: "value",
        name: "Number of Students",
        nameLocation: "middle",
        nameGap: 40,
      },
      series: [
        {
          data: Object.values(bins),
          type: "bar",
          itemStyle: {
            color: "#10b981",
            borderRadius: [8, 8, 0, 0],
          },
          label: {
            show: true,
            position: "top",
          },
        },
      ],
      grid: {
        left: "10%",
        right: "5%",
        bottom: "15%",
        top: "15%",
      },
    };
  };

  const getQuestionSuccessOption = () => {
    if (!analytics?.questionStats) return {};

    const sortedQuestions = [...analytics.questionStats].sort((a, b) => {
      const rateA = a.total > 0 ? (a.correct / a.total) * 100 : 0;
      const rateB = b.total > 0 ? (b.correct / b.total) * 100 : 0;
      return rateA - rateB;
    });

    const questionLabels = sortedQuestions.map((q, i) =>
      q.question_text.length > 30
        ? `Q${i + 1}: ${q.question_text.substring(0, 30)}...`
        : `Q${i + 1}: ${q.question_text}`,
    );

    const successRates = sortedQuestions.map((q) =>
      q.total > 0 ? ((q.correct / q.total) * 100).toFixed(1) : 0,
    );

    return {
      title: {
        text: "Question Success Rate",
        left: "center",
        textStyle: { fontSize: 18, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const index = params[0].dataIndex;
          const q = sortedQuestions[index];
          return `${params[0].name}<br/>Success Rate: ${params[0].value}%<br/>Correct: ${q.correct}/${q.total}`;
        },
      },
      xAxis: {
        type: "value",
        name: "Success Rate (%)",
        nameLocation: "middle",
        nameGap: 30,
        max: 100,
      },
      yAxis: {
        type: "category",
        data: questionLabels,
        axisLabel: {
          interval: 0,
          fontSize: 11,
        },
      },
      series: [
        {
          data: successRates,
          type: "bar",
          itemStyle: {
            color: (params) => {
              const value = params.value;
              if (value >= 70) return "#10b981";
              if (value >= 50) return "#f59e0b";
              return "#ef4444";
            },
            borderRadius: [0, 8, 8, 0],
          },
          label: {
            show: true,
            position: "right",
            formatter: "{c}%",
          },
        },
      ],
      grid: {
        left: "35%",
        right: "10%",
        bottom: "10%",
        top: "15%",
      },
    };
  };

  const getStatsSummary = () => {
    if (!analytics?.submissions || analytics.submissions.length === 0) {
      return { avg: 0, highest: 0, lowest: 0, median: 0 };
    }

    const scores = analytics.submissions
      .map((s) => s.final_score)
      .sort((a, b) => a - b);
    const avg = (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(
      1,
    );
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const median =
      scores.length % 2 === 0
        ? (
            (scores[scores.length / 2 - 1] + scores[scores.length / 2]) /
            2
          ).toFixed(1)
        : scores[Math.floor(scores.length / 2)];

    return { avg, highest, lowest, median };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const stats = getStatsSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <PiArrowLeftDuotone size={20} />
            Back to Submissions
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Quiz Analytics</h1>
          <p className="text-slate-500 mt-1">
            {analytics?.submissions?.length || 0} submission
            {analytics?.submissions?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-blue-600">{stats.avg}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Highest Score</p>
            <p className="text-3xl font-bold text-emerald-600">
              {stats.highest}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Lowest Score</p>
            <p className="text-3xl font-bold text-red-600">{stats.lowest}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Median Score</p>
            <p className="text-3xl font-bold text-amber-600">{stats.median}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <ReactECharts
              option={getScoreDistributionOption()}
              style={{ height: "400px" }}
              opts={{ renderer: "svg" }}
            />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <ReactECharts
              option={getQuestionSuccessOption()}
              style={{ height: "400px" }}
              opts={{ renderer: "svg" }}
            />
          </div>
        </div>

        {/* Question Details Table */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Question Performance Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Question
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Correct
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.questionStats?.map((q, index) => {
                  const successRate =
                    q.total > 0 ? ((q.correct / q.total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {q.question_text}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700">{q.points}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-700 font-semibold">
                          {q.correct}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700">{q.total}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[200px]">
                            <div
                              className={`h-2 rounded-full ${
                                successRate >= 70
                                  ? "bg-emerald-500"
                                  : successRate >= 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-900 min-w-[50px]">
                            {successRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
