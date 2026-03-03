const server = "https://rentcar-backend-production-4b61.up.railway.app";

export async function createReview(token, reservationIdx, reviewData) {
  try {
    const response = await fetch(
      `${server}/reservation/${reservationIdx}/review`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      }
    );

    if (!response.ok) {
      let errorResponse;
      try {
        errorResponse = await response.json();
      } catch (jsonError) {
        errorResponse = { message: `서버 오류 (HTTP ${response.status})` };
      }
      throw new Error(errorResponse || "리뷰 작성에 실패했습니다.");
    }
    const data = await response.json();
    return {
      success: true,
      data: data,
      message: "리뷰가 성공적으로 작성되었습니다.",
    };
  } catch (error) {
    console.error("[API Service] 리뷰 작성 중 오류 발생: ", error);
    return { success: false, message: error.message || "알 수 없는 오류 발생" };
  }
}
