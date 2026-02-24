import { useNavigate } from "react-router-dom";
import { deleteTrip } from "../utils/firebase";

const TripCard = ({ trip, onDelete }) => {
  const navigate = useNavigate();
  const handleView = () => {
    navigate(`/trip/${trip.id}`);
  }
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${trip?.tripName}"?`)) {
      try {
        await deleteTrip(trip.id);
        if (onDelete) onDelete(trip.id);
      } catch (error) {
        console.error("Error deleting trip:", error);
        alert("Failed to delete trip");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-[#3E8DD6]">
      {/* Trip Header */}
      <div className="mb-4 flex flex-row justify-between">
        <h2 className="text-2xl font-bold text-[#035199] mb-2">{trip?.tripName}</h2>
        <p className="text-gray-600 text-lg flex items-center gap-2">
          🌍 <span>{trip?.tripDestination}</span>
        </p>
      </div>

      {/* Trip Details Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-t border-b border-gray-200">
        <div>
          <p className="text-gray-500 text-sm font-semibold">START DATE</p>
          <p className="text-gray-800 font-semibold">{trip?.tripStartDate}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-semibold">END DATE</p>
          <p className="text-gray-800 font-semibold">{trip?.tripEndDate}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-semibold">TYPE</p>
          <p className="text-gray-800 font-semibold">{trip?.tripType}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-semibold">TRAVELERS</p>
          <p className="text-gray-800 font-semibold">{trip?.tripTravellers} 👥</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-semibold">BUDGET</p>
          <p className="text-gray-800 font-semibold">₹{trip?.tripBudget}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-semibold">STATUS</p>
          <p className="text-gray-800 font-semibold">{trip?.status}</p>
        </div>
      </div>

      {/* Preferences */}
      {trip?.tripPreferences && trip.tripPreferences.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-500 text-sm font-semibold mb-2">PREFERENCES</p>
          <div className="flex flex-wrap gap-2">
            {trip.tripPreferences.map((pref, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
        onClick={handleView}
        className="flex-1 bg-[#3E8DD6] hover:bg-[#166ec1] text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          View Details
        </button>
        <button 
          onClick={handleDelete}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TripCard;