import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const SERVER = "http://localhost:8080";

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtDisplay(d) {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}. ${String(dt.getMonth() + 1).padStart(2, "0")}. ${String(dt.getDate()).padStart(2, "0")}.`;
}

export default function SearchRegistrationResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const { startDate, endDate } = location.state ?? {};

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const imgSrc = (offer) => {
    const img =
      offer?.imgUrl ?? offer?.img ?? offer?.imagePath ?? offer?.url ?? "";
    if (!img) return "";
    if (/^https?:\/\//i.test(img)) return img;
    return SERVER + img;
  };

  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = fmtDate(startDate);
    const end = fmtDate(endDate);

    setLoading(true);
    setErr("");

    fetch(`${SERVER}/rental-offer/day?startDate=${start}&endDate=${end}`)
      .then((res) => {
        if (!res.ok) throw new Error("서버 오류");
        return res.json();
      })
      .then((json) => {
        const list =
          json?.rentalOfferDayList ??
          json?.rentalOfferList ??
          json?.list ??
          [];
        setOffers(list);
        if (list.length === 0) setErr("해당 기간에 대여 가능한 차량이 없습니다.");
      })
      .catch(() => setErr("매물 조회 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-[1200px] px-6 py-10">

        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-cyan-700">검색 결과</div>
            <div className="mt-1 text-xl font-extrabold text-stone-900">
              {startDate && endDate
                ? `${fmtDisplay(startDate)} ~ ${fmtDisplay(endDate)}`
                : "날짜 정보 없음"}
            </div>
            <div className="mt-1 text-sm text-stone-500">
              대여 가능 차량 {offers.length}대
            </div>
          </div>
          <button
            type="button"
            className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm hover:bg-stone-50"
            onClick={() => navigate(-1)}
          >
            ← 날짜 다시 선택
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-stone-400 text-sm font-semibold">
            검색 중...
          </div>
        )}

        {/* 오류 / 결과 없음 */}
        {!loading && err && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
            {err}
          </div>
        )}

        {/* 날짜 없이 진입했을 때 */}
        {!startDate && !endDate && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-sm text-stone-500 mb-4">날짜를 선택하지 않았습니다.</p>
            <button
              className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-800"
              onClick={() => navigate("/home/offer/search")}
            >
              날짜 선택하러 가기
            </button>
          </div>
        )}

        {/* 결과 카드 목록 */}
        {!loading && offers.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offers.map((o) => {
              const img = imgSrc(o);
              return (
                <div
                  key={o.rentalOfferIdx ?? o.idx}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-36 bg-stone-100">
                    {img ? (
                      <img
                        src={img}
                        className="h-full w-full object-contain p-3"
                        loading="lazy"
                        alt={o?.modelName ?? "car"}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-stone-400">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-base font-extrabold text-stone-900">
                          {o?.modelName ?? "모델명 없음"}
                        </div>
                        <div className="mt-1 inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-semibold text-stone-600">
                          {o?.modelYear ? `${o.modelYear}년식` : "연식 정보 없음"}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div className="inline-flex items-baseline gap-1 rounded-xl bg-sky-500 px-3 py-1.5 text-white">
                          <span className="text-sm font-extrabold">
                            {Number(o?.rentalPrice ?? 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] font-semibold opacity-90">원</span>
                        </div>
                      </div>
                    </div>

                    {o?.nickname && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                          {o.nickname.slice(0, 1)}
                        </div>
                        <div className="text-sm font-semibold text-stone-700">{o.nickname}</div>
                      </div>
                    )}

                    {o?.description && (
                      <div className="mt-3 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600 line-clamp-2">
                        {o.description}
                      </div>
                    )}

                    <button
                      type="button"
                      className="mt-4 w-full rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800"
                      onClick={() =>
                        navigate(`/home/offer/book/${o.rentalOfferIdx ?? o.idx}`, {
                          state: { startDate, endDate },
                        })
                      }
                    >
                      예약하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
