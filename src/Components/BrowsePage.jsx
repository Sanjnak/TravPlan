import { useNavigate } from "react-router-dom";
import { auth} from "../utils/firebase";
import { signOut } from "firebase/auth";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import TripForm from "./TripForm";
import TripCard from "./TripCard";
import { getTrips } from "../utils/firebase";

const BrowsePage = () => {
  const navigate = useNavigate();
  // Safely read photo from Redux state. Previous code used a block body
  // arrow function which returned undefined and caused destructuring to fail.
  // Use a proper selector that returns the user object (or defaults) and
  // avoid destructuring from undefined.
  const photo = useSelector(
    (state) => state.user?.photo || "src/utils/5652314.webp"
  );
  const userName = useSelector(
    (state) => state.user?.userName || "User"
  );
  const email = useSelector(
    (state) => state.user?.email || "@abc"
  );
  const signOutHandle = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [showPopup, setShowPopup] = useState(false);
  const handleOpen = () => {setShowPopup(true);}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState([]);

  const fetchTrips = async () => {
    try{
      setLoading(true);
      setError("");
      const userTrips = await getTrips();
      setTrips(userTrips);
    }catch(err) {
      console.error("Error fetching trips : ", err);
      setError("Failed to load trips");
    }finally{
      setLoading(false);
    }
  }

  const handleTripDelete = (tripId) => {
    setTrips(trips.filter(trip => trip.id !== tripId));
  }

  useEffect(()=> {
    fetchTrips();
  }, [])
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between py-4 px-8 mt-2 rounded-2xl bg-white w-[100%] border-b-2 border-gray-300">
          <div className="text-3xl text-[#035199] font-semibold">
            Smart Travel Planner
          </div>
          <div className="flex flex-row  ">
            <div>
              <button className="bg-[#3E8DD6] hover:bg-[#166ec1] cursor-pointer w-25 h-10 rounded-2xl text-white text-lg" onClick={handleOpen}>Add trip</button>
            </div>
            <div className="flex flex-row w-7/12 mx-5">
              <p className="font-semibold my-2 text-lg text-[#035199]">You</p>
            </div>
            <button
              className="bg-[#3E8DD6] hover:bg-[#166ec1] cursor-pointer px-4 rounded-2xl h-10 text-white text-lg"
              onClick={signOutHandle}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-row w-full gap-6">
          {/* Left sidebar */}
          <aside className="border-gray-300 border-r-2 w-2/12 bg-white">
            <div className="border-gray-300 border-b-2 p-3 h-60">
              <img src={photo} alt="" className=" rounded-4xl"/>
              <h1 className="mx-3 text-2xl text-[#035199] font-semibold">{userName}</h1>
            </div>
            <div className="flex flex-col border-gray-300 border-b-2 my-5 h-70 items-center">
              <input
                type="search"
                placeholder="🔍 Search.."
                className="p-2 shadow-xl rounded-3xl w-9/12 border-2 border-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-300 ring-offset-0 transition-colors duration-150"
              />
              <button className="m-5 shadow-xl w-9/12 px-3 py-2 rounded-3xl bg-blue-100 text-blue-500 font-semibold text-left">  ➰  Trips </button>
              <button className="m-1 shadow-lg  w-9/12 px-3 py-2 font-semibold rounded-3/12 text-left hover:bg-gray-200">🌍 Destinations</button>
            </div>
            <div className="h-15 px-7">
              <button className="font-semibold">⚙ Settings</button>
            </div>
          </aside>
          {/* Center content */}
          <main className="flex-1 px-6 overflow-y-auto h-screen">
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div><p>Loading trips...</p></div>
              ): trips.length === 0 ? (
                <div className="text-center">
                <img src="src/utils/profile-trip-placeholder-b700979b.svg" className="mx-70 my-10"/>
                <h1 className="text-2xl font-semibold text-gray-800">Create your first trip</h1>
                <p className="text-gray-600 m-5">Planning is where the adventure starts. Create your first trip and start yours! 🚀</p>
                <button className="rounded-3xl bg-[#3E8DD6] shadow-lg text-white font-semibold px-5 py-3 hover:border-2 hover:border-blue-300 hover:bg-white hover:text-blue-400 cursor-pointer" onClick={handleOpen}>Create first trip</button>
              
              </div>
              ): (
                <div className="flex flex-col gap-6">
                  {trips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} onDelete={handleTripDelete} />
                  ))}
                </div>
              )}
            </div>
          </main>
          {/* Right map column */}
          <aside className="w-4/12 border-l-2 border-gray-200 h-screen sticky top-0">
            <div className="w-full h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14006.474242097123!2d77.04493215!3d28.641192099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1763201866873!5m2!1sen!2sin"
                title="map"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </aside>
        </div>
      </div>
      {showPopup && <TripForm setShowPopup={setShowPopup} refreshTrips={fetchTrips} />}
    </>
  );
};

export default BrowsePage;
