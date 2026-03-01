import { useMemo, useState } from "react";
import { useToken } from "../stores/account-store";
import { createReview } from "../requests/review-api";

function Star({ active }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-6 w-6 ${active ? "text-sky-500" : "text-stone-300"}`}
    >
      <path
        fill="currentColor"
        d="M10 15.27l-5.18 3.05 1.4-5.98L1.6 8.27l6.06-.52L10 2.1l2.34 5.65 6.06.52-4.62 4.07 1.4 5.98z"
      />
    </svg>
  );
}

function StarRating({ value, onChange, max = 5, disabled = false }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const v = i + 1;
        return (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange?.(v)}
            className={`rounded-md p-0.5 ${
              disabled ? "cursor-not-allowed opacity-60" : "hover:bg-stone-100"
            }`}
            aria-label={`${v}점`}
            title={`${v}점`}
          >
            <Star active={shown >= v} />
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewModal({
  setModal,
  reservationIdx,
  reloadReservations,
}) {
  const { token } = useToken();

  const [starRating, setStarRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return (
      !!token &&
      !!reservationIdx &&
      starRating >= 1 &&
      content.trim().length >= 5 &&
      !loading
    );
  }, [token, reservationIdx, starRating, content, loading]);

  const close = () => setModal?.("");

  const onSubmit = async () => {
    if (!token) return setErr("로그인이 필요합니다.");
    if (!reservationIdx) return setErr("예약 정보를 찾을 수 없습니다.");
    if (content.trim().length < 5)
      return setErr("리뷰는 5자 이상 작성해주세요.");

    try {
      setLoading(true);
      setErr("");

      const res = await createReview(token, reservationIdx, {
        content: content.trim(),
        starRating,
      });

      if (!res?.success) throw new Error(res?.message || "리뷰 작성 실패");

      await reloadReservations?.();
      close();
    } catch (e) {
      setErr(e?.message || "리뷰 작성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-cyan-700">REVIEW</div>
          <h2 className="mt-1 text-lg font-extrabold text-stone-900">
            리뷰 작성
          </h2>
        </div>

        <button
          onClick={close}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
        >
          닫기
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="text-xs font-bold text-stone-800">별점</div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <StarRating
            value={starRating}
            onChange={setStarRating}
            disabled={loading}
          />
          <div className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-stone-900 ring-1 ring-stone-200">
            {starRating} / 5
          </div>
        </div>

        <div className="mt-4 text-xs font-bold text-stone-800">리뷰</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="차량 상태, 청결, 응대, 인수/반납 경험 등을 자유롭게 작성해주세요. (5자 이상)"
          className="mt-2 h-28 w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-400 focus:border-sky-100 focus:ring-2 focus:ring-sky-100"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[11px] font-semibold text-stone-500">
            {content.trim().length}자
          </div>
          <div className="text-[11px] font-semibold text-stone-400">
            최소 5자이상
          </div>
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {err}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button
          onClick={close}
          disabled={loading}
          className={`h-11 flex-1 rounded-2xl border border-stone-200 bg-white text-sm font-extrabold text-stone-700 hover:bg-stone-50 ${
            loading ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          취소
        </button>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`h-11 flex-1 rounded-2xl text-sm font-extrabold text-white transition ${
            canSubmit
              ? "bg-sky-600 hover:bg-sky-700"
              : "cursor-not-allowed bg-sky-200"
          }`}
        >
          {loading ? "작성중..." : "리뷰 등록"}
        </button>
      </div>
    </div>
  );
}
