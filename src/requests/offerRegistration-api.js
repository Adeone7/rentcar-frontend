const server = "http://localhost:8080";

const defaultHeader = {
  "Content-Type": "application/json",
};

/* 매물 전체 조회 */

function getRentalOffers() {
  return fetch(`${server}/rental-offer`, {
    method: "GET",
  }).then((res) => {
    if (!res.ok) throw new Error("매물 조회 실패");
    return res.json();
  });
}

/*  매물 단건 조회(offerId)*/
function getRentalOfferByOfferId(token, offerId) {
  return fetch(`${server}/rental-offer/${offerId}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then((res) => {
    if (!res.ok) throw new Error("매물 조회 실패");
    return res.json();
  });
}

/*  예약하기(POST) */
function bookRentalOffer(token, payload) {
  return fetch(`${server}/reservation`, {
    method: "POST",
    headers: {
      ...defaultHeader,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).then((res) => {
    if (!res.ok) throw new Error("예약 정보를 불러오는데 실패했습니다.");
    return res.json();
  });
}

/*렌탈 매물 등록(FormData + 이미지)*/
async function registerRentalOffer(token, rentalOfferData, images) {
  try {
    const formData = new FormData();

    formData.append("carIdx", String(rentalOfferData.carIdx));
    formData.append("rentalPrice", String(rentalOfferData.rentalPrice));
    formData.append("description", rentalOfferData.description ?? "");

    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("img", file);
      });
    }

    const response = await fetch(`${server}/rental-offer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorResponse;
      try {
        errorResponse = await response.json();
      } catch {
        errorResponse = { message: `서버 오류 (HTTP ${response.status})` };
      }
      throw new Error(
        errorResponse.message ||
          "알 수 없는 이유로 렌탈 매물 등록에 실패했습니다."
      );
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("[API Service] 렌탈 매물 등록 중 오류 발생:", error);
    return { success: false, message: error.message || "알 수 없는 오류 발생" };
  }
}

/* 차량 검색(query로 검색) */
async function carsByQuery(token, query) {
  if (!query) return { success: true, carList: [] };

  try {
    const response = await fetch(
      `${server}/car?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          ...defaultHeader,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "서버 에러 발생",
      }));
      throw new Error(errorData.message || `HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("자동차 검색 오류 발생:", error);
    return {
      success: false,
      message: error.message || "알 수 없는 오류 발생",
      carList: [],
    };
  }
}

/* 차량 통계 조회(제조사/모델명) */
function getOfferSummary(corporation, modelName) {
  const c = encodeURIComponent(corporation ?? "");
  const m = encodeURIComponent(modelName ?? "");

  return fetch(`${server}/rental-offer/stats?corporation=${c}&modelName=${m}`, {
    method: "GET",
    headers: defaultHeader,
  }).then((res) => {
    if (!res.ok) throw new Error("차량 통계 정보를 불러오는데 실패했습니다.");
    return res.json();
  });
}

/* 매물 검색 조회(키워드)*/
function searchRentalOffersByKeyword(keyword) {
  return fetch(`${server}/rental-offer?keyword=${keyword}`, {
    method: "GET",
    headers: defaultHeader,
  }).then((res) => {
    if (!res.ok) throw new Error("매물 검색 조회 실패");
    return res.json();
  });
}

/* 내 예약 기록 조회 */
function getReservations(token) {
  return fetch(`${server}/reservation`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error("예약 기록 조회 실패");
    return res.json();
  });
}

/* 예약 취소(DELETE) */
function cancelReservation({ reservationIdx, token }) {
  return fetch(`${server}/reservation/${reservationIdx}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error("예약 취소 실패");
    return res.json();
  });
}

function returnReservation({
  reservationIdx,
  token,
  reservationStatus = "이용완료",
}) {
  return fetch(`${server}/reservation/statusUpdate`, {
    method: "PATCH",
    headers: {
      ...defaultHeader,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reservationIdx,
      reservationStatus,
    }),
  }).then((res) => {
    if (!res.ok) throw new Error("반납 처리 실패");
    return res.json();
  });
}

/* 리뷰 작성(예약/매물 기준)*/
function createReservationReview(token, payload) {
  const { reservationIdx, content, starRating } = payload;
  return fetch(`${server}/reservation/${reservationIdx}/review`, {
    method: "POST",
    headers: {
      ...defaultHeader,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      reservationIdx,
      content,
      starRating,
    }),
  }).then((res) => {
    if (!res.ok) throw new Error("리뷰 작성 실패");
    return res.json();
  });
}

/* 리뷰 조회(매물 idx 기준)*/
function getReviewByReservationIdx(rental_offer_idx) {
  return fetch(`${server}/review/${rental_offer_idx}`, {
    method: "GET",
    headers: defaultHeader,
  }).then((res) => {
    if (!res.ok) throw new Error("리뷰 조회 실패");
    return res.json();
  });
}

export {
  getRentalOffers,
  getRentalOfferByOfferId,
  bookRentalOffer,
  registerRentalOffer,
  carsByQuery,
  getOfferSummary,
  searchRentalOffersByKeyword,
  getReservations,
  cancelReservation,
  createReservationReview,
  getReviewByReservationIdx,
  returnReservation,
};
