import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAccount, useToken } from "../stores/account-store";

import logo from "../assets/TOCAR.png";
import LoginModal from "../modal/Login";
import SignUpModal from "../modal/SignUp";

export default function DefaultLayout() {
  const navigate = useNavigate();

  const [modal, setModal] = useState("");
  const [active, setActive] = useState("전체");

  /* 로그인/로그인유지 */

  const { account, setAccount, clearAccount } = useAccount();
  const { token, setToken, clearToken } = useToken();

  const isLogin = !!token;
  const path = useLocation().pathname;
  useEffect(() => {
    if (token) {
      setModal("");
    }
  }, [token]);

  useEffect(() => {
    // 현재 경로에 따라 active 탭 설정

    switch (path) {
      case "/home/offer/registration":
        setActive("차량등록");
        break;
      case "/home/offer/search":
        setActive("예약하기");
        break;
      default:
        setActive("전체");
    }
  }, [path]);
  /*  로그아웃  */
  function handleLogout() {
    clearAccount();
    clearToken();
    setActive("전체");
  }

  return (
    <div>
      <div className="h-screen bg-stone-50 flex flex-col relative overflow-x-hidden">
        {/* ================= 상단바 ================= */}
        <div className="sticky top-0 w-full z-10 bg-white border-b border-stone-200">
          <div className="absolute left-1/2 -translate-x-1/2 top-16 w-[1560px] h-[300px] bg-cyan-600 -z-10" />

          <div className="w-full max-w-[1000px] mx-auto flex justify-between items-center p-2">
            <img
              src={logo}
              className="w-40 cursor-pointer"
              onClick={() => navigate("/home")}
            />

            <div className="flex items-center gap-3">
              {/* 닉네임 표시 */}
              {isLogin && (
                <span
                  className="text-sm text-stone-700 font-medium hover:underline cursor-pointer"
                  onClick={() => navigate("/home/my/bookstate")}
                >
                  {account?.nickname}
                </span>
              )}

              {!isLogin ? (
                <>
                  <button
                    className="bg-cyan-500 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-cyan-600"
                    onClick={() => setModal("SignUp")}
                  >
                    회원가입
                  </button>
                  <button
                    className="bg-stone-200 text-black text-sm font-semibold px-3 py-1 rounded-md hover:bg-stone-300"
                    onClick={() => setModal("Login")}
                  >
                    로그인
                  </button>
                </>
              ) : (
                <button
                  className="bg-stone-200 text-black text-sm font-semibold px-3 py-1 rounded-md hover:bg-stone-300"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= 메인 박스 ================= */}
        <div className="w-full max-w-[1032px] mt-[200px] mx-auto bg-white rounded-lg shadow-sm p-6 z-20">
          {/* 탭 */}
          <nav className="flex gap-9 border-b border-stone-200 pb-3 mb-6">
            <button
              onClick={() => navigate("/home")}
              className={
                "text-sm font-medium pb-1 transition " +
                (active === "전체"
                  ? "text-cyan-600 border-b-2 border-cyan-600"
                  : "text-stone-600 hover:text-stone-800")
              }
            >
              전체
            </button>
            <button
              onClick={() => navigate("/home/offer/search")}
              className={
                "text-sm font-medium pb-1 transition " +
                (active === "예약하기"
                  ? "text-cyan-600 border-b-2 border-cyan-600"
                  : "text-stone-600 hover:text-stone-800")
              }
            >
              예약하기
            </button>
            <button
              onClick={() => navigate("/home/offer/registration")}
              className={
                "text-sm font-medium pb-1 transition " +
                (active === "차량등록"
                  ? "text-cyan-600 border-b-2 border-cyan-600"
                  : "text-stone-600 hover:text-stone-800")
              }
            >
              차량등록
            </button>
          </nav>

          <Outlet />
        </div>
      </div>

      {/* ================= 모달 ================= */}
      {modal && (
        <div
          className="fixed inset-0 z-20 bg-stone-900/20 flex items-center justify-center"
          onClick={() => setModal("")}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {modal === "Login" && <LoginModal setModal={setModal} />}
            {modal === "SignUp" && <SignUpModal setModal={setModal} />}
          </div>
        </div>
      )}
    </div>
  );
}
