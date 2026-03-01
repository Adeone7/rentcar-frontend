import { useEffect, useState } from "react";
import {
  getRentalOfferChart,
  getRentalOfferMonthChart,
} from "../requests/account-api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAccount, useToken } from "../stores/account-store";
import { useNavigate } from "react-router";
import logo from "../assets/TOCAR.png";
import LoginModal from "../modal/Login";
import SignUpModal from "../modal/SignUp";

const PALETTE = [
  "#0ea5e9","#06b6d4","#14b8a6","#10b981","#84cc16",
  "#f59e0b","#f97316","#ef4444","#ec4899","#8b5cf6",
  "#6366f1","#3b82f6","#0891b2","#0d9488","#059669",
  "#65a30d","#d97706","#ea580c","#dc2626","#db2777",
];

const months = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const CustomBarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-xs font-bold text-stone-500">{payload[0].payload.name}</div>
      <div className="mt-1 text-xl font-black text-stone-900">{payload[0].value}<span className="ml-1 text-sm font-semibold text-stone-400">건</span></div>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-xs font-bold text-stone-500">{payload[0].name}</div>
      <div className="mt-1 text-xl font-black text-stone-900">{payload[0].value}<span className="ml-1 text-sm font-semibold text-stone-400">건</span></div>
    </div>
  );
};

export default function OfferChart() {
  const navigate = useNavigate();
  const { account, clearAccount } = useAccount();
  const { token, clearToken } = useToken();
  const isLogin = !!token;

  const [modal, setModal] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [offerChart, setOfferChart] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (token) setModal(""); }, [token]);

  const handleLogout = () => { clearAccount(); clearToken(); };

  useEffect(() => {
    setLoading(true);
    getRentalOfferChart().then((json) => {
      setTotal(json.total ?? 0);
      setOfferChart(json.carChartResponseList ?? []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;
    setLoading(true);
    getRentalOfferMonthChart(selectedMonth)
      .then((json) => setOfferChart(json.carChartResponseList ?? []))
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const filteredData = offerChart.map((one, i) => ({
    ...one,
    name: `${one.corporation} / ${one.modelName}`,
    color: PALETTE[i % PALETTE.length],
  }));

  const totalCount = filteredData.reduce((s, d) => s + (d.count ?? 0), 0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <img src={logo} className="h-8 cursor-pointer" onClick={() => navigate("/home")} alt="TOCAR" />
          <div className="flex items-center gap-3">
            {isLogin && (
              <span className="cursor-pointer text-sm font-semibold text-stone-700 hover:text-cyan-600"
                onClick={() => navigate("/home/my/bookstate")}>
                {account?.nickname}
              </span>
            )}
            {!isLogin ? (
              <>
                <button className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-600"
                  onClick={() => setModal("SignUp")}>회원가입</button>
                <button className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
                  onClick={() => setModal("Login")}>로그인</button>
              </>
            ) : (
              <button className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
                onClick={handleLogout}>로그아웃</button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="text-[11px] font-semibold text-cyan-700">ANALYTICS</div>
          <h1 className="mt-1 text-2xl font-black text-stone-900">차량 예약 현황</h1>
          <p className="mt-1 text-sm text-stone-500">월별 차량 예약률을 한눈에 확인할 수 있습니다.</p>
        </div>

        {/* 컨트롤 패널 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* 차트 타입 토글 */}
          <div className="flex overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {[
              { key: "bar", label: "막대형", icon: "▦" },
              { key: "pie", label: "파이형", icon: "◉" },
            ].map((t) => (
              <button key={t.key}
                onClick={() => setChartType(t.key)}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold transition ${
                  chartType === t.key
                    ? "bg-cyan-600 text-white"
                    : "bg-white text-stone-600 hover:bg-stone-50"
                }`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* 월 선택 + 통계 */}
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <button
                onClick={() => setSelectedMonth("")}
                className={`px-4 py-2.5 text-sm font-bold transition ${
                  !selectedMonth ? "bg-cyan-600 text-white" : "text-stone-600 hover:bg-stone-50"
                }`}>
                전체
              </button>
              {months.map((m, i) => (
                <button key={m}
                  onClick={() => setSelectedMonth(i + 1)}
                  className={`px-3 py-2.5 text-sm font-bold transition ${
                    selectedMonth === i + 1 ? "bg-cyan-600 text-white" : "text-stone-600 hover:bg-stone-50"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-stone-400">총 예약</div>
            <div className="mt-1 text-2xl font-black text-stone-900">{totalCount}<span className="ml-1 text-sm font-semibold text-stone-400">건</span></div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-stone-400">차종 수</div>
            <div className="mt-1 text-2xl font-black text-stone-900">{filteredData.length}<span className="ml-1 text-sm font-semibold text-stone-400">종</span></div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-stone-400">최다 예약</div>
            <div className="mt-1 text-sm font-black text-stone-900 truncate">
              {filteredData.length > 0
                ? filteredData.reduce((a, b) => (a.count > b.count ? a : b)).name
                : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-stone-400">조회 기간</div>
            <div className="mt-1 text-sm font-black text-stone-900">
              {selectedMonth ? `${selectedMonth}월` : "전체"}
            </div>
          </div>
        </div>

        {/* 차트 카드 */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex h-80 items-center justify-center text-sm text-stone-400">
              불러오는 중...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-sm text-stone-400">
              해당 기간에 예약 데이터가 없습니다.
            </div>
          ) : chartType === "bar" ? (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={filteredData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  angle={-35} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {filteredData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center gap-6 lg:flex-row">
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie data={filteredData} dataKey="count" nameKey="name"
                    innerRadius="55%" outerRadius="80%"
                    paddingAngle={3} isAnimationActive>
                    {filteredData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{value}</span>
                    )}
                    iconType="circle" iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 순위 테이블 */}
        {filteredData.length > 0 && (() => {
          const ranked = [...filteredData].sort((a, b) => b.count - a.count);
          const maxCount = ranked[0]?.count ?? 1;
          const medals = ["🥇","🥈","🥉"];
          return (
            <div className="mt-6 rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              {/* 헤더 */}
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
                <div>
                  <div className="text-[11px] font-semibold text-cyan-700">RANKING</div>
                  <div className="mt-0.5 text-sm font-black text-stone-900">예약 순위</div>
                </div>
                <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
                  총 {totalCount}건
                </div>
              </div>

              {/* TOP 3 카드 */}
              <div className="grid grid-cols-3 gap-px bg-stone-100 border-b border-stone-100">
                {ranked.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex flex-col items-center bg-white px-4 py-5">
                    <div className="text-2xl mb-1">{medals[i]}</div>
                    <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: d.color }} />
                    <div className="text-xs font-bold text-stone-700 text-center leading-tight">{d.name}</div>
                    <div className="mt-2 text-lg font-black text-stone-900">{d.count}<span className="text-xs font-semibold text-stone-400 ml-0.5">건</span></div>
                    <div className="mt-0.5 text-[11px] font-semibold text-stone-400">
                      {totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>

              {/* 나머지 순위 */}
              {ranked.length > 3 && (
                <div className="divide-y divide-stone-50 px-6">
                  {ranked.slice(3).map((d, i) => {
                    const rank = i + 4;
                    const pct = totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0;
                    const barW = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-4 py-3">
                        {/* 순위 번호 */}
                        <div className="w-7 text-center text-sm font-black text-stone-300">{rank}</div>

                        {/* 색상 도트 */}
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />

                        {/* 이름 */}
                        <div className="w-36 text-sm font-semibold text-stone-700 truncate">{d.name}</div>

                        {/* 프로그레스 바 */}
                        <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${barW}%`, backgroundColor: d.color }} />
                        </div>

                        {/* 건수 */}
                        <div className="w-10 text-right text-sm font-black text-stone-900">{d.count}<span className="text-xs font-semibold text-stone-400 ml-0.5">건</span></div>

                        {/* 퍼센트 */}
                        <div className="w-10 text-right text-xs font-semibold text-stone-400">{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {modal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/30 px-4"
          onClick={() => setModal("")}>
          <div onClick={(e) => e.stopPropagation()}>
            {modal === "Login" && <LoginModal setModal={setModal} />}
            {modal === "SignUp" && <SignUpModal setModal={setModal} />}
          </div>
        </div>
      )}
    </div>
  );
}