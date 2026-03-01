import { useRef, useState, useEffect } from "react";

import { useToken } from "../stores/account-store";
import { carsByQuery } from "../requests/offerRegistration-api";

export default function CarSelector({ onCarSelected }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [carList, setCarList] = useState([]);
  const [selectedCarIdx, setSelectedCarIdx] = useState(null);
  const [selectedCarInfo, setSelectedCarInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchDebounceTimer = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { token } = useToken();

  // 토큰 없으면 경고
  useEffect(() => {
    if (!token)
      console.warn("로그인 토큰이 없습니다. API 호출이 제한될 수 있습니다.");
  }, [token]);

  // 드롭다운이 열리면 input focus 유지
  useEffect(() => {
    if (showDropdown && inputRef.current) inputRef.current.focus();
  }, [showDropdown]);

  // 외부 클릭 감지 (드롭다운 닫기)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current?.contains(event.target) ||
        dropdownRef.current?.contains(event.target)
      )
        return;
      setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerCarSearch = async (query) => {
    if (!query) {
      setCarList([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await carsByQuery(token, query);
      if (result.success) {
        setCarList(result.carList);
        setShowDropdown(result.carList.length > 0);
      } else {
        setCarList([]);
        setShowDropdown(false);
      }
    } catch (error) {
      setCarList([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setShowDropdown(true);

    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(
      () => triggerCarSearch(query),
      1000
    );
  };

  const handleCarSelect = (car) => {
    setSelectedCarIdx(car.idx);
    setSelectedCarInfo(car);
    setSearchTerm(
      `${car.corporation} ${car.modelName} (${car.modelYear}, ${car.carType})`
    );
    setCarList([]);
    setShowDropdown(false);

    if (onCarSelected) onCarSelected(car);
  };

  return (
    <div style={{ position: "relative", width: "300px", margin: "20px auto" }}>
      <h3>자동차 선택하기</h3>
      <input
        ref={inputRef}
        type="text"
        placeholder="차량 모델명, 제조사 등 검색"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
        disabled={isLoading}
      />

      {showDropdown && (carList.length > 0 || isLoading) && (
        <ul
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            listStyle: "none",
            padding: 0,
            margin: "5px 0 0 0",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 100,
          }}
        >
          {isLoading && carList.length === 0 && (
            <li style={{ padding: "10px", textAlign: "center", color: "#666" }}>
              검색 중...
            </li>
          )}
          {!isLoading && carList.length === 0 && searchTerm && (
            <li style={{ padding: "10px", textAlign: "center", color: "#666" }}>
              검색 결과 없음
            </li>
          )}
          {carList.map((car) => (
            <li
              key={car.idx}
              onClick={() => handleCarSelect(car)}
              style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
            >
              {car.corporation} - {car.modelName} ({car.modelYear},{" "}
              {car.carType})
            </li>
          ))}
        </ul>
      )}

      {selectedCarInfo && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #007bff",
            borderRadius: "5px",
          }}
        >
          <p>
            <strong>선택된 차량:</strong>
          </p>
          <p>
            {selectedCarInfo.corporation} {selectedCarInfo.modelName} (
            {selectedCarInfo.modelYear})
          </p>
          <p className="hidden">선택된 CarIdx: {selectedCarInfo.idx}</p>
        </div>
      )}
    </div>
  );
}
