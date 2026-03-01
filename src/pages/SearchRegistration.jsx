import Calandar from "../compornent/Calandar";

export default function SearchRegistration() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-stone-900">
          예약 검색
        </h1>

        <Calandar resultPath="/search-registration-results" />
      </div>
    </div>
  );
}
