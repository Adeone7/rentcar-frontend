import { useEffect, useState } from "react";

export default function SearchBar({
  initialValue = "",
  placeholder = "차량 검색 (예: 아반떼, 현대...)",
  onSearch,
  onReset,
  loading = false,
  className = "",
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const submit = () => {
    const q = value ?? "";
    if (!q) {
      onReset?.();
      return;
    }
    onSearch?.(q);
  };

  return (
    <form
      className={`flex w-full gap-2 sm:w-[520px] ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 flex-1 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-400 focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
      />

      <button
        type="submit"
        disabled={loading}
        className="h-11 shrink-0 rounded-2xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-cyan-800 disabled:opacity-50"
      >
        검색
      </button>
    </form>
  );
}
