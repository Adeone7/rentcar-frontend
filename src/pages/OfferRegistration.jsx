import { useState } from "react";
import CarSelector from "../compornent/CarSelector";
import { registerRentalOffer } from "../requests/rentalOffer-api";
import { useToken } from "../stores/account-store";
import { useNavigate } from "react-router";

const Input = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  readOnly = false,
}) => (
  <div>
    <label>{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className="shadow appearance-none border reounded w-full py-2 px-3 text-gray-700 leading-tight 
              foucus:outline-none focus:shadow-outline"
    />
  </div>
);

export default function OfferRegistration() {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [selectedCarIdx, setSelectedCarIdx] = useState(null);
  const [selectedCarDetails, setSelectedCarDetails] = useState(null);
  const [rentalPrice, setRentalPrice] = useState("");
  const [description, setDescription] = useState("");
  const { token } = useToken();
  const navigate = useNavigate();

  const handleCarSelectedFromSelector = (car) => {
    setSelectedCarIdx(car.idx);
    setSelectedCarDetails(car);
    console.log("페이지에서 선택된 차량 idx: ", car.idx);
    console.log("페이지에서 선택된 차량 상세: ", car);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedCarIdx) {
        alert("렌탈 오퍼를 등록할 차량을 먼저 선택해주세요.");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmitRentalOffer = async (e) => {
    e.preventDefault();

    if (!selectedCarIdx) {
      alert("차량이 선택되지 않았습니다.");
      return;
    }
    if (!rentalPrice || !description) {
      alert("렌탈 가격과 설명을 모두 입력해주세요.");
      return;
    }
    const rentalOfferData = {
      carIdx: selectedCarIdx,
      rentalPrice: parseInt(rentalPrice, 10),
      description: description,
    };

    console.log("최종 렌탈 오퍼 데이터: ", rentalOfferData);

    const result = await registerRentalOffer(token, rentalOfferData, images);

    if (result.success) {
      alert("렌탈 오퍼가 성공적으로 등록되었습니다.");
      navigate("/home");
    } else {
      alert(`렌탈 오퍼 등록 실패 : ${result.message}`);
    }
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const updatedFiles = [...images, ...newFiles];
    if (updatedFiles.length > 5) {
      setImageError("최대 5장의 사진만 업로드할 수 있습니다.");
      setImages(updatedFiles.slice(0, 5));
      e.target.value = null;
      return;
    } else {
      setImageError("");
    }
    setImages(updatedFiles);
    e.target.value = null;
  };

  return (
    <div className="mt-6 px-10 sm:px-12 lg:px-16 space-y-10">
      <div className="max-w-[572px] mx-auto space-y-10">
        {/* ================= 차량 이미지 영역 ================= */}
        <div className="border border-stone-200 rounded-lg bg-stone-50 p-5">
          {images.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-stone-400 text-sm">
              차량 이미지를 등록해주세요 (최대 5장 업로드 가능)
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-52 w-80 object-cover rounded-md border border-stone-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updatedImages = images.filter((_, i) => i !== idx);
                      setImages(updatedImages);
                      URL.revokeObjectURL(URL.createObjectURL(file));
                      if (updatedImages.length <= 5) {
                        setImageError("");
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full
                               w-8 h-8 flex items-center justify-center text-md font-bold
                               shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100" // hover 시 보이도록
                    title="이미지 삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= 차량 타이틀 ================= */}
        <div className="px-1">
          <h1 className="text-xl font-bold">차량 등록</h1>
          <p className="text-sm text-stone-500">
            렌트카 정보를 입력하고 이미지를 등록하세요
          </p>
        </div>

        {/* ================= STEP 탭 ================= */}
        <div className="flex gap-6 border-b border-stone-200 pb-3 text-sm font-medium px-1">
          <span className={step === 1 ? "text-cyan-600" : "text-stone-400"}>
            예약 정보
          </span>
          <span className={step === 2 ? "text-cyan-600" : "text-stone-400"}>
            차량 상세
          </span>
        </div>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="space-y-5">
            <CarSelector onCarSelected={handleCarSelectedFromSelector} />
            {selectedCarDetails ? (
              <div className="border border-blue-400 p-4 rounded mt-4 bg-blue-50">
                <h4 className="font-semibold text-lg text-blue-800 mb-2">
                  선택된 차량 정보:
                </h4>
                <Input
                  label="제조사"
                  value={selectedCarDetails.corporation}
                  readOnly
                />
                <Input
                  label="모델명"
                  value={selectedCarDetails.modelName}
                  readOnly
                />
                <Input
                  label="차종"
                  value={selectedCarDetails.carType}
                  readOnly
                />
                <Input
                  label="연식"
                  value={selectedCarDetails.modelYear}
                  readOnly
                />
                <Input
                  label="인승"
                  value={selectedCarDetails.fewSeats}
                  readOnly
                />
                <Input
                  label="변속기"
                  value={selectedCarDetails.gearType}
                  readOnly
                />
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                차량을 검색하고 선택해주세요.
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <form onSubmit={handleSubmitRentalOffer} className="space-y-5">
            <h2 className="text-xl font-semibold mb-4">세부 정보 입력</h2>

            {/* 렌탈 가격 입력 */}
            <Input
              label="하루 렌트 가격 (원)"
              type="number"
              placeholder="예시: 150000 (원)"
              value={rentalPrice}
              onChange={(e) => setRentalPrice(e.target.value)}
            />

            {/* 설명 입력 */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm font-bold mb-2">
                상세 설명
              </label>
              <textarea
                placeholder="렌트카의 특징, 이용 시 주의사항 등을 상세히 입력해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              ></textarea>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-stone-700">
                차량 이미지 등록
              </label>
              <label
                className="block cursor-pointer border-2 border-dashed border-stone-200 rounded-md p-6
                           text-center text-stone-500 hover:bg-stone-50"
              >
                이미지 파일 선택
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {imageError && (
                <p className="mt-2 text-red-600 text-sm">{imageError}</p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200"
              >
                이전
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
              >
                등록하기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
