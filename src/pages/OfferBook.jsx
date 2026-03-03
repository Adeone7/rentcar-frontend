import { useEffect, useState } from "react";
import { useAccount, useToken } from "../stores/account-store";
import {
  bookRentalOffer,
  getRentalOfferByOfferId,
} from "../requests/offerRegistration-api";
import { useNavigate, useParams } from "react-router";
import LoginModal from "../modal/Login";
import SignUpModal from "../modal/SignUp";

export default function OfferBook() {
  const { offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [offerImages, setOfferImages] = useState([]);
  const [offerReviews, setOfferReviews] = useState([]);

  const { token } = useToken();
  const { account } = useAccount();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingErr, setBookingErr] = useState("");
  const [bookingOk, setBookingOk] = useState("");

  const [modal, setModal] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  const [imgIdx, setImgIdx] = useState(0);

  const SERVER = "https://rentcar-backend-production-4b61.up.railway.app";
  const imageSrc = (it) => {
    const p = it?.img ?? it?.imagePath ?? it?.path ?? it?.url ?? "";
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    return SERVER + p;
  };

  useEffect(() => {
    if (offerId) {
      getRentalOfferByOfferId(token, offerId).then((json) => {
        setOffer(json.rentalOfferAddReview);
        setOfferImages(json.rentalOfferCarImg ?? []);
        setOfferReviews(json.rentalOfferReviewListResponses ?? json.rentalOfferReview ?? []);
      });
    }
  }, [offerId]);

  useEffect(() => {
    setImgIdx(0);
  }, [offerImages?.length]);

  const imgs = Array.isArray(offerImages) ? offerImages : [];
  const hasImgs = imgs.length > 0;
  const canSlide = imgs.length > 1;
  const curImg = hasImgs ? imgs[Math.min(imgIdx, imgs.length - 1)] : null;

  const prevImg = () => {
    if (!canSlide) return;
    setImgIdx((i) => (i - 1 + imgs.length) % imgs.length);
  };

  const nextImg = () => {
    if (!canSlide) return;
    setImgIdx((i) => (i + 1) % imgs.length);
  };

  const onBook = async () => {
    setBookingErr("");
    setBookingOk("");

    if (!token) {
      setModal("Login");
      return;
    }
    if (!offerId) {
      setBookingErr("매물 ID가 없습니다.");
      return;
    }
    if (!startDate || !endDate) {
      setBookingErr("대여 시작일/종료일을 선택해주세요.");
      return;
    }
    if (startDate > endDate) {
      setBookingErr("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    const accountId = account.id;
    if (!accountId) {
      setBookingErr("로그인 정보(accountId)를 찾을 수 없습니다.");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        rentalOfferIdx: offerId,
        startDate,
        endDate,
      };

      await bookRentalOffer(token, payload);
      setBookingOk("예약이 완료되었습니다.");
    } catch (e) {
      setBookingErr("예약 요청에 실패했습니다.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!offer) {
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 via-white to-cyan-50/40">
        <div className="mx-auto max-w-[900px] px-5 py-10 sm:px-6">
          <div className="rounded-3xl border border-stone-200/70 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="text-sm font-extrabold text-stone-900">
              차량 정보를 찾을 수 없습니다.
            </div>
            <button
              type="button"
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-px hover:bg-cyan-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 active:translate-y-0"
              onClick={() => navigate(-1)}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const _rawModelYear = offer?.model_year ?? offer?.modelYear;
  const _year =
    _rawModelYear != null && _rawModelYear !== ""
      ? String(_rawModelYear).slice(0, 4)
      : "";

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 via-white to-cyan-50/40">
      <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/60 bg-white/70 px-3 py-1 text-[11px] font-extrabold tracking-wide text-cyan-700 shadow-sm backdrop-blur">
              BOOKING
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-2 text-sm font-extrabold text-stone-700 shadow-sm backdrop-blur transition hover:-translate-y-px hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 active:translate-y-0"
            onClick={() => navigate("/home")}
          >
            뒤로가기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white/80 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="relative bg-linear-to-br from-stone-100 via-white to-cyan-50">
              <div className="relative h-64">
                {hasImgs ? (
                  <img
                    src={imageSrc(curImg)}
                    className="h-full w-full object-contain p-6"
                    alt=""
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-stone-400">
                    이미지 없음
                  </div>
                )}

                {hasImgs && (
                  <div className="absolute right-4 top-4 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {Math.min(imgIdx + 1, imgs.length)} / {imgs.length}
                  </div>
                )}

                {canSlide && (
                  <>
                    <button
                      type="button"
                      onClick={prevImg}
                      aria-label="이전 이미지"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/70 px-3 py-2 text-sm font-black text-stone-800 shadow-sm backdrop-blur transition hover:-translate-y-1/2 hover:bg-white hover:shadow-md active:translate-y-[-50%]"
                    >
                      &lt;
                    </button>
                    <button
                      type="button"
                      onClick={nextImg}
                      aria-label="다음 이미지"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/70 px-3 py-2 text-sm font-black text-stone-800 shadow-sm backdrop-blur transition hover:-translate-y-1/2 hover:bg-white hover:shadow-md active:translate-y-[-50%]"
                    >
                      &gt;
                    </button>
                  </>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/10 to-transparent" />
              </div>

              {hasImgs && (
                <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-2">
                  {imgs.map((it, i) => (
                    <button
                      key={it?.idx ?? it?.id ?? `${i}`}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white/70 shadow-sm backdrop-blur transition ${
                        i === imgIdx
                          ? "border-cyan-300 ring-2 ring-cyan-500/30"
                          : "border-stone-200/70 hover:border-stone-300"
                      }`}
                      aria-label={`이미지 ${i + 1} 보기`}
                    >
                      <img
                        src={imageSrc(it)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-black tracking-tight text-stone-900">
                    {offer?.modelName ?? "모델명 없음"}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-stone-200/70 bg-white/80 px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm">
                      {_year ? `${_year}년식` : "연식 정보 없음"}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-stone-200/70 bg-white/80 px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm">
                      {offer?.corporation ?? "제조사 정보 없음"}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-stone-200/70 bg-white/80 px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm">
                      {offer?.carType ?? "차종 정보 없음"}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-stone-200/70 bg-white/80 px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm">
                      {offer?.fewSeats != null && offer?.fewSeats !== ""
                        ? `${offer.fewSeats}인승`
                        : "인승 정보 없음"}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-stone-200/70 bg-white/80 px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm">
                      {offer?.gearType ?? "변속기 정보 없음"}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-stone-200/70 bg-white/80 px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm">
                      {offer?.nickname ?? "닉네임 정보 없음"}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[11px] font-bold text-stone-500">
                    대여료
                  </div>
                  <div className="mt-1 inline-flex items-baseline gap-1 rounded-2xl bg-linear-to-r from-cyan-600 to-sky-500 px-3.5 py-2 text-white shadow-md shadow-cyan-300/20">
                    <span className="text-sm font-black">
                      {Number(offer?.rentalPrice ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold opacity-90">원</span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 inline-flex items-center gap-2 text-xs font-black text-stone-800">
                  <span className="h-2 w-2 rounded-full bg-cyan-600" />
                  정보
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.03)_32px)] bg-size-[100%_32px] px-4 py-3">
                  <div className="pointer-events-none absolute left-3 top-0 h-full w-0.5 bg-rose-300/40" />

                  <div className="grid grid-cols-1 gap-y-2 text-[13px] leading-6 text-stone-800 sm:grid-cols-2 sm:gap-x-6">
                    <div className="flex items-baseline gap-2">
                      <span className="min-w-[92px] text-[11px] font-black text-stone-500">
                        nickname
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {offer?.nickname ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="min-w-[92px] text-[11px] font-black text-stone-500">
                        corporation
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {offer?.corporation ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="min-w-[92px] text-[11px] font-black text-stone-500">
                        carType
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {offer?.carType ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="min-w-[92px] text-[11px] font-black text-stone-500">
                        modelYear
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {_rawModelYear ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="min-w-[92px] text-[11px] font-black text-stone-500">
                        fewSeats
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {offer?.fewSeats ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="min-w-[92px] text-[11px] font-black text-stone-500">
                        gearType
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {offer?.gearType ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 sm:col-span-2">
                      <span className="min-w-[92px] text-[11px] font-black text-stone-500">
                        rentalPrice
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {Number(offer?.rentalPrice ?? 0).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-stone-200/60 bg-stone-50/70 p-5">
                <div className="text-xs font-black text-stone-800">설명</div>
                <div className="mt-3 text-sm leading-relaxed text-stone-700">
                  {offer?.description ?? "설명이 없습니다."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200/70 bg-white/80 p-6 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="text-sm font-black text-stone-900">예약 정보</div>
            <div className="mt-1 text-xs font-semibold text-stone-500">
              날짜 선택 후 예약을 진행하세요.
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <div className="text-xs font-black text-stone-800">
                  대여 시작일
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-200/80 bg-stone-50/60 px-3.5 py-2.5 text-sm font-semibold text-stone-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
                />
              </label>

              <label className="block">
                <div className="text-xs font-black text-stone-800">
                  대여 종료일
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-200/80 bg-stone-50/60 px-3.5 py-2.5 text-sm font-semibold text-stone-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
                />
              </label>

              {bookingErr && (
                <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-3.5 py-2.5 text-xs font-bold text-rose-700">
                  {bookingErr}
                </div>
              )}
              {bookingOk && (
                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 px-3.5 py-2.5 text-xs font-bold text-emerald-700">
                  {bookingOk}
                </div>
              )}

              <button
                type="button"
                onClick={onBook}
                disabled={bookingLoading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-cyan-600 to-sky-500 px-4 py-3 text-sm font-black text-white shadow-md shadow-cyan-500/20 transition hover:-translate-y-px hover:shadow-lg hover:shadow-cyan-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading ? "예약 처리중..." : "예약하기"}
              </button>

              <div className="pt-1 text-[11px] font-semibold text-stone-500">
                예약 완료 후 마이페이지에서 내역을 확인할 수 있어요.
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* 리뷰 섹션 */}
        <div className="mx-auto max-w-[1100px] px-5 pb-10 sm:px-6">
          <div className="rounded-3xl border border-stone-200/70 bg-white/80 p-6 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-black text-stone-900">이용 후기</div>
                <div className="mt-1 text-xs font-semibold text-stone-500">
                  총 {offerReviews.length}개의 리뷰
                </div>
              </div>
            </div>

            {offerReviews.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-400">
                아직 작성된 리뷰가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {offerReviews.map((r) => (
                  <div
                    key={r.idx}
                    className="rounded-2xl border border-stone-200/70 bg-stone-50/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-100 text-xs font-extrabold text-cyan-700">
                          {(r.nickname ?? "?").slice(0, 1)}
                        </div>
                        <span className="text-sm font-bold text-stone-800">
                          {r.nickname ?? "익명"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            viewBox="0 0 20 20"
                            className={`h-4 w-4 ${i < r.starRating ? "text-amber-400" : "text-stone-200"}`}
                          >
                            <path
                              fill="currentColor"
                              d="M10 15.27l-5.18 3.05 1.4-5.98L1.6 8.27l6.06-.52L10 2.1l2.34 5.65 6.06.52-4.62 4.07 1.4 5.98z"
                            />
                          </svg>
                        ))}
                        <span className="ml-1 text-[11px] font-bold text-stone-500">
                          {r.starRating}/5
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-stone-700">
                      {r.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      {(modal === "Login" || modal === "SignUp") && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 px-4"
          style={{ zIndex: 9999 }}
          onClick={() => setModal(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {modal === "Login" && <LoginModal setModal={setModal} setIsLogin={setIsLogin} />}
            {modal === "SignUp" && <SignUpModal setModal={setModal} />}
          </div>
        </div>
      )}
    </div>
  );
}