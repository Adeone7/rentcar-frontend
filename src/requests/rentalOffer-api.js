const server = "http://localhost:8080";

// 렌탈 오퍼 등록 API 호출 함수 (CarRegistrationPage 컴포넌트에서 사용)
export async function registerRentalOffer(token, rentalOfferData, images) {
  try {
    const formData = new FormData();

    formData.append("carIdx", String(rentalOfferData.carIdx));
    formData.append("rentalPrice", String(rentalOfferData.rentalPrice));
    formData.append("description", rentalOfferData.description ?? ""); // Nullish Coalescing

    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("img", file); // 백엔드 DTO의 'img' 필드와 일치
      });
    }

    console.log(
      ">>> [API Service] registerRentalOffer (매물 등록): Sending FormData Content <<<"
    );
    for (let pair of formData.entries()) {
      if (pair[0] === "img") {
        console.log(`${pair[0]}:`, pair[1].name);
      } else {
        console.log(`${pair[0]}:`, pair[1]);
      }
    }
    console.log("----------------------------------------------------------");

    const response = await fetch(`${server}/rental-offer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // 토큰 헤더!
      },
      body: formData,
    });

    if (!response.ok) {
      let errorResponse;
      try {
        errorResponse = await response.json();
      } catch (jsonError) {
        errorResponse = { message: `서버 오류 (HTTP ${response.status})` };
      }
      throw new Error(
        errorResponse.message ||
          "알 수 없는 이유로 렌탈 매물 등록에 실패했습니다."
      );
    }

    const data = await response.json();
    return { success: true, data: data }; // 오타 없이 success!
  } catch (error) {
    console.error("[API Service] 렌탈 매물 등록 중 오류 발생:", error);
    return { success: false, message: error.message || "알 수 없는 오류 발생" };
  }
}

// -----------------------------------------------------------------------------
// 🚨🚨🚨 2. 차량 검색 API 함수 (GET 방식) 🚨🚨🚨
// 이 함수가 검색창 드롭다운을 위한 함수! FormData와는 상관없음!
// -----------------------------------------------------------------------------
export async function carsByQuery(token, query) {
  if (!query) {
    return { success: true, carList: [] };
  }

  try {
    const response = await fetch(
      `${server}/car?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 검색도 인증이 필요한 경우 토큰 사용!
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `서버 에러 발생`,
      }));
      throw new Error(
        errorData.message || `HTTp error! status: ${response.status}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("자동차 검색 API 호출 중 오류 발생: ", error);
    return {
      success: false,
      message: error.message || "알 수 없는 오류 발생",
      carList: [],
    };
  }
}