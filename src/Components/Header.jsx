import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  }
  return (
    <>
      <div className="absolute flex flex-row justify-between py-4 px-8 m-10 rounded-2xl bg-white w-[95%]">
        <div className="text-3xl text-[#035199] font-semibold">Smart Travel Planner</div>
        <div className="flex flex-row w-6/12">
            <ul className="flex flex-row  w-10/12 justify-around my-2 text-lg text-[#035199] cursor-pointer ">
            <li className="hover:underline font-semibold">Destinations</li>
            <li className="hover:underline font-semibold">Trips</li>
            <li className="hover:underline font-semibold">About</li>
        </ul>
        <button className="bg-[#3E8DD6] hover:bg-[#166ec1] cursor-pointer px-4 rounded-2xl h-10 text-white text-lg font-semibold" onClick={handleLogin}>
                Login
        </button>
        </div>
      </div>
    </>
  );
};

export default Header;
