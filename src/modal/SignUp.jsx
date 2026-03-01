import { useRef, useState } from "react";
import {
  createAccount,
  verifyEmailCode,
  availableCheck,
} from "../requests/account-api";
import { useNavigate } from "react-router";

export default function SignUpModal({ setModal }) {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [codeError, setCodeError] = useState("");

  const [step, setStep] = useState(1);
  const [account, setAccount] = useState(null);
  const formRef = useRef();

  function submitHandle(evt) {
    evt.preventDefault();

    const id = formRef.current.id.value;
    const pw = formRef.current.pw.value;
    const nickname = formRef.current.nickname.value;

    createAccount(nickname, id, pw).then((obj) => {
      window.alert(obj.success);
      formRef.current.reset();
      setAccount(obj.account);
      setStep(2);
    });
  }

  function nicknameBlurHandle(evt) {
    const nickname = evt.target.value;
    if (!nickname) return setNicknameError("닉네임을 입력해주세요");

    setNicknameError("");
  }

  function emailBlurHandle(evt) {
    const id = evt.target.value;
    availableCheck(id).then((obj) => {
      if (!id) return setEmailError("이메일을 입력해주세요");
      if (obj.available) setEmailError("");
      else setEmailError("이미 사용 중인 이메일주소입니다.");
    });
  }

  function passwordBlurHandle(evt) {
    const pw = evt.target.value;
    if (!pw) return setPasswordError("비밀번호를 입력해주세요");
    if (pw.length < 8)
      return setPasswordError("비밀번호를 8자 이상 입력해주세요.");
    setPasswordError("");
  }

  return (
    <div
      className="bg-white w-[430px] rounded-2xl p-8 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">이메일로 가입</h2>
          <form ref={formRef} onSubmit={submitHandle} className="space-y-4">
            <div>
              <label className={"block" + (nicknameError && " text-red-800")}>
                닉네임
              </label>
              <input
                type="text"
                name="nickname"
                placeholder="닉네임"
                className="border border-stone-400 w-full mt-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a8dce1]"
                onBlur={nicknameBlurHandle}
              />
              {nicknameError && (
                <p className="text-red-500 text-xs mt-1">{nicknameError}</p>
              )}
            </div>

            <div>
              <label className={"block" + (emailError && " text-red-800")}>
                이메일
              </label>
              <input
                type="email"
                name="id"
                placeholder="Email@example.com"
                className="border border-stone-400 w-full mt-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a8dce1]"
                onBlur={emailBlurHandle}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className={"block" + (passwordError && " text-red-800")}>
                비밀번호
              </label>
              <input
                type="password"
                name="pw"
                placeholder="비밀번호"
                className="border border-stone-400 w-full mt-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a8dce1]"
                onBlur={passwordBlurHandle}
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#a8dce1] text-white py-3 rounded-lg mt-4 hover:bg-cyan-500 transition font-medium cursor-pointer"
              disabled={emailError || passwordError || nicknameError}
            >
              이메일 인증하기
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">이메일 인증코드 확인</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = e.target.code.value;

              verifyEmailCode(account.id, code).then((result) => {
                if (result.success) {
                  setCodeError("");
                  setStep(3);
                } else {
                  setCodeError("인증코드가 올바르지 않습니다.");
                  setStep(2);
                }
              });
            }}
            className="space-y-4"
          >
            <div>
              <p className="mt-5 text-gray-600">
                이메일로 받은 <b>6자리 인증코드</b>를 입력하세요.
                <br />
                코드는 발급 후 30분 동안만 유효합니다.
              </p>

              <ul className="mt-4 space-y-1 text-sm text-gray-500 list-disc pl-5">
                <li>코드가 오지 않았다면 스팸함을 확인해 주세요.</li>
                <li>
                  만료되었다면 <em className="text-[#60a7b9]">코드 재전송</em>을
                  눌러 새 코드를 받으세요.
                </li>
              </ul>

              <input
                type="text"
                name="code"
                placeholder="이메일로 받은 인증코드를 입력하세요"
                className="border border-stone-400 w-full mt-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a8dce1]"
              />

              {codeError && (
                <p className="text-red-500 text-xs mt-1">{codeError}</p>
              )}

              <a className="text-sm text-[#60a7b9] hover:underline cursor-pointer">
                코드 재전송
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#a8dce1] text-white py-3 rounded-lg mt-4 hover:bg-cyan-500 transition font-medium cursor-pointer"
            >
              인증하기
            </button>
          </form>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <h2 className="text-xl text-[#3b3b3d] font-semibold mb-6">
            인증 성공
          </h2>

          <p className="text-stone-600 mb-6">
            이메일 인증이 완료되었습니다.
            <br />
            환영합니다!
          </p>

          <div
            onClick={() => setModal("Login")}
            className="w-full bg-[#a8dce1] text-white py-3 rounded-lg hover:bg-cyan-500 transition font-medium cursor-pointer"
          >
            로그인하기
          </div>
        </div>
      )}
    </div>
  );
}
