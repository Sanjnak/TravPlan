import { useNavigate } from "react-router-dom";
import { BG_IMG_URL } from "../utils/Constants";
import Header from "./Header";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <div className="w-screen h-screen  bg-cover"
        style={{ backgroundImage: `url(${BG_IMG_URL})` }}>
            <div className="absolute w-11/12 mt-50">
                <div className="flex flex-col items-center">
                    <div className="text-6xl font-semibold text-white my-5">Plan your next trip</div>
                    <div className="text-2xl  text-white">Discover top destinations and create personalized itenaries</div>
                    <button className="bg-[#035199] hover:bg-[#166ec1] cursor-pointer p-4 rounded-2xl text-white font-semibold text-lg my-5" onClick={() => {navigate("/signup")}}> Get started</button>
                </div>
            </div>
      </div>
      
    </>
  );
};

export default HomePage;
