const server = "https://rentcar-backend-production-4b61.up.railway.app";

const defaultHeader = {
  "Content-Type": "application/json",
};

// 신규 계정 만들기
function createAccount(nickname, id, pw) {
  return fetch(server + "/signup", {
    method: "POST",
    headers: defaultHeader,
    body: JSON.stringify({ nickname, id, pw }),
  }).then((response) => {
    if (!response.ok) throw new Error("회원가입 실패");
    return response.json();
  });
}

//email 검증
function availableCheck(id) {
  return fetch(server + "/verify-email" + email, {
    method: "get",
  }).then((response) => {
    response.json();
  });
}

// 인증 코드 검증
function verifyEmailCode(accountId, code) {
  return fetch(server + "/verify-email", {
    method: "POST",
    headers: defaultHeader,
    body: JSON.stringify({ accountId, code }),
  }).then((response) => {
    if (!response.ok) throw new Error("이메일 인증 실패");
    return response.json();
  });
}

// 로그인
function loginAccount(id, pw) {
  return fetch(server + "/login", {
    method: "POST",
    headers: defaultHeader,
    body: JSON.stringify({ id, pw }),
  }).then((response) => {
    if (!response.ok) throw new Error("로그인 실패");
    return response.json();
  });
}

// 1. 자동차 검색 API 호출 함수 (CarSelector 컴포넌트에서 사용)
export async function carsByQuery(query, token) {
  if (!query) {
    return { success: true, carList: [] };
  }

  try {
    const response = await fetch(
      `${server}/car?query=${encodeURIComponent(query, token)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `서버 에러 발생`,
      }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
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

// 2. 렌탈 오퍼 등록 API 호출 함수 (CarRegistrationPage 컴포넌트에서 사용)
// src/requests/account-api.js (혹은 offerRegistration-api.js)

// 2. 렌탈 오퍼 등록 API 호출 함수
// 🚨 파라미터 순서도 바꿔서 token이 먼저 오고, images 배열도 추가로 받아야 해!
export async function registerRentalOffer(token, rentalOfferData, images) {
  try {
    const formData = new FormData(); // 👈 이 부분이 제일 중요!

    // 1. rentalOfferData의 일반 필드들을 FormData에 추가
    formData.append("carIdx", rentalOfferData.carIdx);
    formData.append("rentalPrice", rentalOfferData.rentalPrice);
    formData.append("description", rentalOfferData.description);

    // 2. 이미지 파일들을 FormData에 추가 (백엔드의 img 필드 이름과 정확히 일치해야 해!)
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("img", file); // 🚨 백엔드 DTO의 List<MultipartFile> img 필드와 일치!
      });
    }

    const response = await fetch(`${server}/rental-offer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // 토큰 헤더만 유지
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
        errorResponse.message || "알 수 없는 이유로 자동차 등록에 실패했습니다."
      );
    }

    const data = await response.json();
    return { success: true, data: data }; // 성공 시 객체 형태로 반환
  } catch (error) {
    console.error("자동차 등록중 오류 발생: ", error);
    return { success: false, message: error.message || "알 수 없는 오류 발생" }; // 에러 시 객체 형태로 반환
  }
}

// 자동차 차트 전체 조회
function getRentalOfferChart() {
  return fetch(server + "/car/chart", {
    method: "GET",
  }).then((response) => {
    if (!response.ok) throw new Error("조회 실패");
    return response.json();
  });
}

// 자동차 차트 월별 조회
function getRentalOfferMonthChart(month) {
  return fetch(server + "/car/month/chart?month=" + month, {
    method: "GET",
  }).then((response) => {
    if (!response.ok) throw new Error("조회 실패");
    return response.json();
  });
}

export {
  createAccount,
  verifyEmailCode,
  loginAccount,
  availableCheck,
  getRentalOfferChart,
  getRentalOfferMonthChart,
};
