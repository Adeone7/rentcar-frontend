import "./index.css";

import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import HomePage from "./pages/HomePage";
import SignUp from "./modal/SignUp";
import OfferBook from "./pages/OfferBook";
import OfferRegistration from "./pages/OfferRegistration";
import OfferChart from "./pages/OfferChart";
import MyBookState from "./pages/MyBookState";
import DefaultLayout from "./layout/DefaultLayout";
import SearchRegistration from "./compornent/Calandar";
import DefaultLayout2 from "./layout/DefaultLayout2";
import SearchRegistrationResults from "./pages/SearchRegistrationResults";
import LoadingPage from "./pages/LoadingPage";

const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />, //메인 홈페이지
      },
      {
        path: "/home",
        element: <HomePage />, //메인 홈페이지
      },

      {
        path: "/home/offer/search",
        element: <SearchRegistration />, //예약 검색 달력
      },
      {
        path: "search-registration-results",
        element: <SearchRegistrationResults />, //예약 날짜 검색 결과
      },
      {
        path: "/home/offer/registration",
        element: <OfferRegistration />, // 렌트카 등록
      },
    ],
  },
  {
    element: <DefaultLayout2 />,
    children: [
      {
        path: "/home/my/bookstate",
        element: <MyBookState />, //나의 예약 현황, 마이페이지
      },
      {
        path: "/home/offer/book/:offerId",
        element: <OfferBook />, //렌트카 예약 상세 페이지
      },
    ],
  },

  {
    path: "/loading",
    element: <LoadingPage />, //회원가입 페이지
  },

  {
    path: "/home/signup",
    element: <SignUp />, //회원가입 페이지
  },
  {
    path: "/home/offer/chart",
    element: <OfferChart />, //렌트카 이용 차트
  },
  {
    path: "/home/my/bookstate",
    element: <MyBookState />, //나의 예약 현황, 마이페이지
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
