import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { DateRangePicker } from "react-date-range";
import {
  defaultStaticRanges,
  createStaticRanges,
} from "react-date-range/dist/defaultRanges";
import { ko } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

function atStartOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function atEndOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function fmtYMD(d) {
  if (!d) return "";
  return `${d.getFullYear()}. ${pad2(d.getMonth() + 1)}. ${pad2(d.getDate())}.`;
}
function startOfWeekSun(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function endOfWeekSat(d) {
  const s = startOfWeekSun(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}
function startOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default function Calandar({
  onChange,
  onSearch,
  resultPath = "/search-registration-results",
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const today0 = useMemo(() => atStartOfDay(new Date()), []);
  const maxDate = useMemo(() => {
    const d = new Date(today0);
    d.setFullYear(d.getFullYear() + 2);
    return atEndOfDay(d);
  }, [today0]);

  const [range, setRange] = useState(() => {
    const t = new Date();
    return {
      startDate: atStartOfDay(t),
      endDate: atEndOfDay(t),
      key: "selection",
    };
  });

  const ranges = useMemo(() => [range], [range]);

  const staticRanges = useMemo(() => {
    const labels = new Set(["Today", "This Week", "This Month"]);
    const picked = defaultStaticRanges.filter((r) => labels.has(r.label));

    const hasToday = picked.some((r) => r.label === "Today");
    const hasWeek = picked.some((r) => r.label === "This Week");
    const hasMonth = picked.some((r) => r.label === "This Month");

    const fallback = [];
    if (!hasToday) {
      fallback.push({
        label: "Today",
        range: () => ({ startDate: today0, endDate: atEndOfDay(today0) }),
      });
    }
    if (!hasWeek) {
      fallback.push({
        label: "This Week",
        range: () => {
          const now = new Date();
          const s = startOfWeekSun(now);
          const e = endOfWeekSat(now);
          const s2 = s < today0 ? today0 : s;
          return { startDate: s2, endDate: e };
        },
      });
    }
    if (!hasMonth) {
      fallback.push({
        label: "This Month",
        range: () => {
          const now = new Date();
          const s = startOfMonth(now);
          const e = endOfMonth(now);
          const s2 = s < today0 ? today0 : s;
          return { startDate: s2, endDate: e };
        },
      });
    }

    return createStaticRanges([...picked, ...fallback]);
  }, [today0]);

  function clampToAllowedRange(sel) {
    const startDate = sel?.startDate ? atStartOfDay(sel.startDate) : null;
    const endDate = sel?.endDate ? atEndOfDay(sel.endDate) : null;

    let start = startDate;
    let end = endDate;

    if (start && start < today0) start = new Date(today0);
    if (end && end < today0) end = atEndOfDay(today0);

    if (start && start > maxDate) start = atStartOfDay(maxDate);
    if (end && end > maxDate) end = atEndOfDay(maxDate);

    if (start && end && start > end) end = atEndOfDay(start);

    return { startDate: start, endDate: end, key: "selection" };
  }

  function goResult(nextRange) {
    onSearch?.(nextRange);

    navigate(resultPath, {
      state: {
        range: nextRange,
        startDate: nextRange?.startDate,
        endDate: nextRange?.endDate,
      },
    });

    setOpen(false);
  }

  return (
    <div className="w-full max-w-[980px] rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-stone-900">날짜 선택</div>
          <div className="mt-1 text-xs text-stone-500">
            대여 기간(오늘~2년 이내) 선택하세요
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
          onClick={() => {
            const t = new Date();
            const next = {
              startDate: atStartOfDay(t),
              endDate: atEndOfDay(t),
              key: "selection",
            };
            setRange(next);
            onChange?.(next);
          }}
        >
          오늘로 초기화
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left hover:bg-stone-50"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-stone-500">
              대여 기간
            </div>
            <div className="mt-1 truncate text-sm font-semibold text-stone-900">
              {fmtYMD(range.startDate)} ~ {fmtYMD(range.endDate)}
            </div>
          </div>

          <span className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-stone-700">
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200">
          <DateRangePicker
            ranges={ranges}
            onChange={(item) => {
              const next = clampToAllowedRange(item.selection);
              setRange(next);
              onChange?.(next);
            }}
            months={2}
            direction="horizontal"
            locale={ko}
            showMonthAndYearPickers
            showDateDisplay={false}
            weekdayDisplayFormat="EEEEE"
            rangeColors={["#0891b2"]}
            minDate={today0}
            maxDate={maxDate}
            staticRanges={staticRanges}
            inputRanges={[]}
          />
        </div>
      )}

      <button
        type="button"
        className="mt-3 w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-bold text-white hover:bg-sky-600"
        onClick={() => goResult(range)}
      >
        차량 검색
      </button>
    </div>
  );
}
