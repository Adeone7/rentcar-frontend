import { useEffect } from "react";

// import Lottie from "lottie-react";

// import car_gif from "../assets/lottie/carr.gif";
import carr_mov from "../assets/lottie/Car.webm";
import { useNavigate } from "react-router";

export default function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      //navigate("/", { replace: true });
    }, 3500);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-20 bg-stone-900/20 flex items-center justify-center">
      <div className="">
        <div className="flex flex-col items-center gap-4">
          <div className="w-[260px] sm:w-[320px] flex justify-center">
            {/* <img src={car} alt="로딩 중" /> */}
            <video src={carr_mov} autoPlay loop muted />
          </div>

          <div className="text-sm font-semibold text-stone-700">
            차량 정보를 불러오는 중입니다...
          </div>
          <div className="text-xs text-stone-500">잠시만 기다려주세요</div>
        </div>
      </div>
    </div>
  );
}
