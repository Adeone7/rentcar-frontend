import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { loginAccount } from "../requests/account-api";
import { useAccount, useToken } from "../stores/account-store";

export default function LoginModal({ setModal, setIsLogin }) {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(false);

  const formRef = useRef(null);
  const idRef = useRef(null);

  const { setAccount } = useAccount();
  const { setToken } = useToken();

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  function submitHandle(evt) {
    evt.preventDefault();

    const id = formRef.current.id.value;
    const pw = formRef.current.pw.value;

    loginAccount(id, pw).then((res) => {
      if (res.success) {
        setAccount(res.account);
        setToken(res.auth);
        if (typeof setIsLogin === "function") setIsLogin(true);
        setModal(null);
      } else {
        setLoginError(true);
      }
    });
  }

  return (
    <div
      className="bg-white w-[430px] rounded-2xl p-8 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold mb-6">로그인</h2>

      <form ref={formRef} onSubmit={submitHandle} className="space-y-4">
        <div>
          <label className="block">이메일</label>
          <input
            ref={idRef}
            type="email"
            name="id"
            placeholder="Email@example.com"
            className="border border-stone-400 w-full mt-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a8dce1]"
          />
        </div>

        <div>
          <label className="block">비밀번호</label>
          <input
            type="password"
            name="pw"
            placeholder="비밀번호"
            className="border border-stone-400 w-full mt-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a8dce1]"
          />
        </div>

        {loginError && (
          <p className="text-rose-500 text-xs">
            이메일 또는 비밀번호가 일치하지 않습니다.
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-[#a8dce1] text-white py-3 rounded-lg mt-4 hover:bg-cyan-500 transition font-medium cursor-pointer"
        >
          로그인
        </button>
      </form>

      <div className="w-full text-center text-sm mt-4 text-gray-600">
        <span>계정이 없으신가요? </span>
        <span
          className="text-[#7ccdd5] hover:underline cursor-pointer"
          onClick={() => setModal("SignUp")}
        >
          회원가입
        </span>
      </div>
    </div>
  );
}
