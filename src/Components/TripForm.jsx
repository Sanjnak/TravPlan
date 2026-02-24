import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { addTrip } from "../utils/tripSlice";
import { createTrip } from "../utils/firebase";

const TripForm = ({ setShowPopup, refreshTrips }) => {
  const dispatch = useDispatch();
  const tripName = useRef("");
  const destination = useRef("");
  const startDate = useRef("");
  const endDate = useRef("");
  const travellers = useRef(1);
  const budget = useRef(0);
  const [preferences, setPreferences] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePreference = (e) => {
    const val = e.target.name;
    if (e.target.checked) {
      setPreferences((prev) => [...prev, val]);
    } else {
      setPreferences((prev) => prev.filter((pref) => pref !== val));
    }
  };

  const handleChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const submitTripForm = async () => {
    // Validation
    if (!tripName.current.value.trim()) {
      setError("Trip name is required");
      return;
    }
    if (!destination.current.value.trim()) {
      setError("Destination is required");
      return;
    }
    if (!startDate.current.value) {
      setError("Start date is required");
      return;
    }
    if (!endDate.current.value) {
      setError("End date is required");
      return;
    }
    if (!selectedOption) {
      setError("Trip type is required");
      return;
    }

    // Date validations
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(startDate.current.value);
    const end = new Date(endDate.current.value);
    if (isNaN(start.getTime())) {
      setError("Invalid start date");
      return;
    }
    if (isNaN(end.getTime())) {
      setError("Invalid end date");
      return;
    }
    if (start < today) {
      setError("Start date cannot be before today");
      return;
    }
    if (end <= start) {
      setError("End date must be after start date");
      return;
    }

    // Travellers validations
    const travCount = parseInt(travellers.current.value, 10);
    if (isNaN(travCount) || travCount < 1) {
      setError("Number of travellers must be at least 1");
      return;
    }
    if (travCount > 1 && selectedOption === "Solo") {
      setError("Trip type 'Solo' is invalid for more than one traveller");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tripDetails = {
        tripName: tripName.current.value,
        tripDestination: destination.current.value,
        tripStartDate: startDate.current.value,
        tripEndDate: endDate.current.value,
        tripTravellers: travCount,
        tripType: selectedOption,
        tripBudget: budget.current.value || 0,
        tripPreferences: preferences,
      };

      // Save to Firebase
      const newTrip = await createTrip(tripDetails);
      
      // Also dispatch to Redux for local state (keeps existing behavior)
      dispatch(addTrip(newTrip));

      // Refresh trips in parent (BrowsePage) so new trip appears immediately
      if (typeof refreshTrips === "function") {
        try { await refreshTrips(); } catch (err) { /* ignore refresh errors */ }
      }

      // Close popup after successful creation
      setShowPopup(false);
      
      // Optional: Show success message or redirect
      alert("Trip created successfully!");
    } catch (err) {
      setError(err.message || "Failed to create trip. Please try again.");
      console.error("Trip creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-lg w-6/12 relative p-10 ">
          <button
            onClick={() => {
              setShowPopup(false);
              setError("");
            }}
            disabled={loading}
            className="absolute top-4 right-4 text-black cursor-pointer font-bold text-xl hover:text-red-600"
          >
            ✖
          </button>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="py-5">
            <div className="flex flex-row w-12/12 ">
              <div className="w-6/12">
                <label htmlFor="" className=" text-md">
                  Trip name
                </label>
                <br />
                <input
                  ref={tripName}
                  type="text"
                  placeholder="Give your trip a name.."
                  disabled={loading}
                  className="my-3 w-11/12 border-2 border-gray-400 rounded-md px-5 py-2 text-md font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="w-6/12">
                <label htmlFor="" className=" text-md">
                  Destination
                </label>
                <br />
                <input
                  ref={destination}
                  type="text"
                  placeholder="Select your destination.."
                  disabled={loading}
                  className="my-3 w-11/12 border-2 border-gray-400 rounded-md px-5 py-2 text-md font-semibold disabled:bg-gray-100"
                />
              </div>
            </div>
            <div className="flex flex-row w-12/12 ">
              <div className="w-6/12">
                <label htmlFor="" className=" text-md">
                  Start date
                </label>
                <br />
                <input
                  ref={startDate}
                  type="date"
                  disabled={loading}
                  className="my-3 w-11/12 border-2 border-gray-400 rounded-md px-5 py-2 text-md font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="w-6/12">
                <label htmlFor="" className=" text-md">
                  End date
                </label>
                <br />
                <input
                  ref={endDate}
                  type="date"
                  disabled={loading}
                  className="my-3 w-11/12 border-2 border-gray-400 rounded-md px-5 py-2 text-md font-semibold disabled:bg-gray-100"
                />
              </div>
            </div>
            <div>
              <p className="italic text-xs text-gray-500 mb-2">
                Use this date range to set the amount of days of the trip. The
                exact dates don't matter and won't be visible to your friends.
              </p>
            </div>
            <div className="flex flex-row w-12/12">
              <div className="w-6/12">
                <label htmlFor="" className=" text-md">
                  Number of travellers
                </label>
                <br />
                <input
                  ref={travellers}
                  type="number"
                  placeholder="1"
                  defaultValue={1}
                  min={1}
                  disabled={loading}
                  className="my-3 w-11/12 border-2 border-gray-400 rounded-md px-5 py-2 text-md font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="w-6/12">
                <label htmlFor="dropdown" className="text-md">
                  Trip type
                </label>
                <br />

                <select
                  id="dropdown"
                  value={selectedOption}
                  onChange={handleChange}
                  disabled={loading}
                  className="my-3 w-11/12 border-2 border-gray-400 rounded-md px-5 py-2 text-md font-semibold disabled:bg-gray-100"
                  required
                >
                  <option value="">Select an option</option>
                  <option value="Solo">Solo</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                  <option value="Couple">Couple</option>
                </select>
              </div>
            </div>

            <div className="">
              <label htmlFor="" className="text-md">
                Budget
              </label>
              <br />
              <input
                ref={budget}
                type="text"
                disabled={loading}
                className="my-3 w-11/12 border-2 border-gray-400 rounded-md px-5 py-2 text-md font-semibold disabled:bg-gray-100"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="">Trip Preference</label>
              <div className="flex flex-wrap items-center gap-4 my-3">
                {[
                  "Adventure",
                  "Culture",
                  "Food",
                  "Shopping",
                  "Nature",
                  "Relaxation",
                ].map((pref) => (
                  <label key={pref} className="flex items-center gap-2 text-md">
                    <input
                      type="checkbox"
                      name={pref}
                      onChange={handleChangePreference}
                      checked={preferences.includes(pref)}
                      disabled={loading}
                      className="accent-[#166ec1] w-4 h-4 disabled:opacity-50"
                    />
                    {pref}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={submitTripForm}
                disabled={loading}
                className="rounded-xl px-5 py-3 text-white bg-[#599ede] hover:bg-[#166ec1] cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating Trip..." : "Start Planning"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TripForm;
