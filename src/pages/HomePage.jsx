import { useEffect, useState } from "react";
import {
  getRentalOffers,
  searchRentalOffersByKeyword,
} from "../requests/offerRegistration-api";
import { useNavigate } from "react-router";
import Loading from "../modal/Loading";
import SearchBar from "../compornent/SearchBar";

const API = "http://localhost:8080";

const MONTHLY_CHART_PATH = "/home/offer/chart";

export default function HomePage() {
  const [baseOffers, setBaseOffers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const pickList = (json) =>
    json?.rentalOfferListResponse ??
    json?.rentalOfferResponseList ??
    json?.rentalOfferList ??
    json?.list ??
    [];

  const firstImg = (o) => {
    const a = o?.images?.[0];
    if (typeof a === "string" && a) return a;

    const b = o?.carImages?.[0];
    if (typeof b === "string" && b) return b;
    if (b && typeof b === "object")
      return b.imgPath || b.imagePath || b.url || b.path || "";

    return "";
  };

  const imgSrc = (p) => {
    const s = String(p ?? "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    return API + (s.startsWith("/") ? s : `/${s}`);
  };

  const loadAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const json = await getRentalOffers();
      const list = pickList(json);
      setBaseOffers(list);
      setOffers(list);
      setTotal(json?.countAllRentalOffer ?? list.length);
    } catch (e) {
      setBaseOffers([]);
      setOffers([]);
      setTotal(0);
      setErr("매물 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const search = async (q) => {
    const word = String(q ?? "").trim();
    if (!word) {
      setErr("");
      setOffers(baseOffers);
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const json = await searchRentalOffersByKeyword(encodeURIComponent(word));
      const list = pickList(json);
      setOffers(list);
      if (json?.success === false) setErr(json?.message ?? "검색 실패");
    } catch (e) {
      setOffers([]);
      setErr("매물 검색 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">신규 차량</h1>
            <div className="mt-1 text-sm text-stone-500">총 {total}대</div>
            {err && (
              <div className="mt-2 inline-flex rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                {err}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end ">
            <button
              type="button"
              onClick={() => navigate(MONTHLY_CHART_PATH)}
              className="h-11 rounded-2xl border border-sky-200 bg-sky-500 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-sky-600 active:scale-[0.99]"
            >
              월별 차트 확인하기
            </button>

            <SearchBar
              initialValue={keyword}
              placeholder="차량 검색 (예: 아반떼, 현대...)"
              loading={loading}
              onSearch={(q) => {
                setKeyword(q);
                search(q);
              }}
              onReset={() => {
                setKeyword("");
                setErr("");
                setOffers(baseOffers);
              }}
            />
          </div>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <div className="text-base font-extrabold text-stone-800">
              등록된 차량이 없습니다.
            </div>
            <div className="mt-2 text-sm font-semibold text-stone-500">
              잠시 후 다시 확인해주세요.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o, i) => {
              const img = imgSrc(firstImg(o));
              return (
                <div
                  key={o?.idx ?? i}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-extrabold tracking-tight text-stone-900">
                          {o?.modelName ?? "모델명 없음"}
                        </div>
                        <div className="mt-1 inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-semibold text-stone-600">
                          {o?.modelYear
                            ? `${o.modelYear}년식`
                            : "연식 정보 없음"}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="mt-0.5 inline-flex items-baseline gap-1 rounded-xl bg-sky-500 px-3 py-1.5 text-white">
                          <span className="text-sm font-extrabold">
                            {typeof o?.rentalPrice === "number"
                              ? o.rentalPrice.toLocaleString()
                              : Number(o?.rentalPrice ?? 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] font-semibold opacity-90">
                            원
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                          {(o?.nickname ?? "").slice(0, 1)}
                        </div>
                        <div className="text-sm font-semibold text-stone-700">
                          {o?.nickname ? `${o.nickname}` : "판매자 정보 없음"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                      <div className="line-clamp-2">
                        {o?.description ?? "설명이 없습니다."}
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="w-full rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 active:scale-[0.99]"
                        onClick={() => navigate(`/home/offer/book/${o.idx}`)}
                      >
                        예약하기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading && <Loading />}
    </div>
  );
}