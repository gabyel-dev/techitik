import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetRoomAnalytics } from "../../api/attempt";
import ReactECharts from "echarts-for-react";
import Loader from "../loader";
import toast from "react-hot-toast";
import { PiArrowLeftDuotone } from "react-icons/pi";

export default function RoomAnalytics() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [roomId]);

  const fetchAnalytics = async () => {
    try {
      const response = await GetRoomAnalytics(roomId);
      setAnalytics(response.data);
    } catch (err) {
      toast.error("Failed to load room analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getQuizComparisonOption = () => {
    if (!analytics || analytics.length === 0) return {};

    const quizData = analytics.map(quiz => {
      const submissions = quiz.quiz_submissions?.filter(s => s.status === 'submitted') || [];
      const avgScore = submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.final_score || 0), 0) / submissions.length
        : 0;
      const maxScore = submissions[0]?.max_score || 100;
      const avgPercentage = maxScore > 0 ? (avgScore / maxScore) * 100 : 0;

      return {
        title: quiz.title.length > 20 ? quiz.title.substring(0, 20) + '...' : quiz.title,
        avgScore: avgScore.toFixed(1),
        avgPercentage: avgPercentage.toFixed(1),
        submissions: submissions.length
      };
    });

    return {
      title: {
        text: 'Quiz Performance Comparison',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const index = params[0].dataIndex;
          const data = quizData[index];
          return `${params[0].name}<br/>Average: ${data.avgScore} (${data.avgPercentage}%)<br/>Submissions: ${data.submissions}`;
        }
      },
      xAxis: {
        type: 'category',
        data: quizData.map(q => q.title),
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: 'Average Score (%)',
        nameLocation: 'middle',
        nameGap: 50,
        max: 100
      },
      series: [{
        data: quizData.map(q => q.avgPercentage),
        type: 'bar',
        itemStyle: {
          color: '#3b82f6',
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }],
      grid: {
        left: '10%',
        right: '5%',
        bottom: '25%',
        top: '15%'
      }
    };
  };

  const getProgressTrendOption = () => {
    if (!analytics || analytics.length === 0) return {};

    const quizData = analytics.map(quiz => {
      const submissions = quiz.quiz_submissions?.filter(s => s.status === 'submitted') || [];
      const avgScore = submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.final_score || 0), 0) / submissions.length
        : 0;
      const maxScore = submissions[0]?.max_score || 100;
      const avgPercentage = maxScore > 0 ? (avgScore / maxScore) * 100 : 0;

      return {
        title: quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title,
        avgPercentage: avgPercentage.toFixed(1),
        submissions: submissions.length
      };
    });

    return {
      title: {
        text: 'Performance Trend Over Time',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const index = params[0].dataIndex;
          const data = quizData[index];
          return `${params[0].name}<br/>Average: ${params[0].value}%<br/>Submissions: ${data.submissions}`;
        }
      },
      xAxis: {
        type: 'category',
        data: quizData.map(q => q.title),
        boundaryGap: false,
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: 'Average Score (%)',
        nameLocation: 'middle',
        nameGap: 50,
        max: 100
      },
      series: [{
        data: quizData.map(q => q.avgPercentage),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }],
      grid: {
        left: '10%',
        right: '5%',
        bottom: '25%',
        top: '15%'
      }
    };
  };

  const getRadarOption = () => {
    if (!analytics || analytics.length === 0) return {};

    const quizData = analytics.slice(0, 6).map(quiz => {
      const submissions = quiz.quiz_submissions?.filter(s => s.status === 'submitted') || [];
      const avgScore = submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.final_score || 0), 0) / submissions.length
        : 0;
      const maxScore = submissions[0]?.max_score || 100;
      const avgPercentage = maxScore > 0 ? (avgScore / maxScore) * 100 : 0;

      return {
        name: quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title,
        value: avgPercentage.toFixed(1)
      };
    });

    return {
      title: {
        text: 'Quiz Performance Radar',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item'
      },
      radar: {
        indicator: quizData.map(q => ({ name: q.name, max: 100 })),
        shape: 'polygon',
        splitNumber: 5,
        axisName: {
          color: '#475569',
          fontSize: 11
        },
        splitLine: {
          lineStyle: { color: '#e2e8f0' }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.1)']
          }
        }
      },
      series: [{
        type: 'radar',
        data: [{
          value: quizData.map(q => q.value),
          name: 'Average Score',
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: 'rgba(16, 185, 129, 0.3)'
          },
          lineStyle: { width: 2 }
        }]
      }]
    };
  };

  const getRoomStats = () => {
    if (!analytics || analytics.length === 0) {
      return { totalQuizzes: 0, totalSubmissions: 0, avgScore: 0, completionRate: 0 };
    }

    const totalQuizzes = analytics.length;
    let totalSubmissions = 0;
    let totalScore = 0;
    let scoreCount = 0;

    analytics.forEach(quiz => {
      const submissions = quiz.quiz_submissions?.filter(s => s.status === 'submitted') || [];
      totalSubmissions += submissions.length;
      
      submissions.forEach(s => {
        const maxScore = s.max_score || 100;
        const percentage = maxScore > 0 ? (s.final_score / maxScore) * 100 : 0;
        totalScore += percentage;
        scoreCount++;
      });
    });

    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0;
    const completionRate = totalQuizzes > 0 ? ((totalSubmissions / totalQuizzes) / 10 * 100).toFixed(1) : 0;

    return { totalQuizzes, totalSubmissions, avgScore, completionRate };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const stats = getRoomStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <PiArrowLeftDuotone size={20} />
            Back to Room
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Room Analytics</h1>
          <p className="text-slate-500 mt-1">Overall performance metrics for this room</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Total Quizzes</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalQuizzes}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Total Submissions</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.totalSubmissions}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-amber-600">{stats.avgScore}%</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
            <p className="text-3xl font-bold text-purple-600">{stats.completionRate}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <ReactECharts 
              option={getQuizComparisonOption()} 
              style={{ height: '400px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <ReactECharts 
              option={getProgressTrendOption()} 
              style={{ height: '400px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <ReactECharts 
            option={getRadarOption()} 
            style={{ height: '500px' }}
            opts={{ renderer: 'svg' }}
          />
        </div>

        {/* Quiz Details Table */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Quiz Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Quiz Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Submissions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Average Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.map((quiz) => {
                  const submissions = quiz.quiz_submissions?.filter(s => s.status === 'submitted') || [];
                  const avgScore = submissions.length > 0
                    ? submissions.reduce((sum, s) => sum + (s.final_score || 0), 0) / submissions.length
                    : 0;
                  const maxScore = submissions[0]?.max_score || 100;
                  const avgPercentage = maxScore > 0 ? (avgScore / maxScore) * 100 : 0;

                  return (
                    <tr key={quiz.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{quiz.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700">{submissions.length}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{avgScore.toFixed(1)} ({avgPercentage.toFixed(1)}%)</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[200px]">
                            <div
                              className={`h-2 rounded-full ${
                                avgPercentage >= 70 ? 'bg-emerald-500' : avgPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${avgPercentage}%` }}
                            />
                          </div>
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
