import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrip, updateTrip } from "../utils/firebase";
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString();
  } catch (e) {
    return d;
  }
};

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState([]);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    day: 1,
    time: "09:00",
    place: "",
    description: "",
  });

  useEffect(() => {
    let unsubscribe = null;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTrip(tripId);
        setTrip(data);
        setItinerary(data?.tripItinerary || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    };

    if (!tripId) return;

    // If auth already has a current user, load immediately.
    if (auth.currentUser) {
      load();
    } else {
      // Otherwise wait for Firebase to restore auth state, then load once.
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          load();
          if (unsubscribe) unsubscribe();
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [tripId]);

  const goBack = () => navigate(-1);

  const generateItinerary = async () => {
    setLoading(true);
    setError("");

    let days = 1;
    try {
      const s = new Date(trip.tripStartDate);
      const e = new Date(trip.tripEndDate);
      const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
      days = Math.max(1, diff + 1);
    } catch (e) {
      days = 1;
    }

    const prefs = Array.isArray(trip.tripPreferences)
      ? trip.tripPreferences.join("; ")
      : String(trip.tripPreferences || "None");

    const userPrompt =
      "Act as an itinerary generator. Reply ONLY with valid JSON matching the schema: [{'day':<int>,'activities':[{'time':'HH:MM','place':'','description':'','avg_cost':<number>}]}]. Generate a " +
      days +
      "-day " +
      trip.tripType +
      " itinerary for " +
      trip.tripDestination +
      ", India for " +
      (trip.tripTravellers || 1) +
      " travelers on a budget of ₹" +
      (trip.tripBudget || 0) +
      ". Use these preferences: " +
      prefs +
      ". Make each activity short (time, place, description, avg_cost). Return JSON only, no extra text and no markdown.";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

      if (!content) {
        console.error("Gemini response (unexpected shape):", data);
        setError("No content received from Gemini (see console)");
        setLoading(false);
        return;
      }

      let generatedItinerary;
      try {
        const body =
          typeof content === "string" ? content : JSON.stringify(content);
        const cleaned = body
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const jsonMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
        const jsonToParse = jsonMatch ? jsonMatch[0] : cleaned;
        generatedItinerary = JSON.parse(jsonToParse);
      } catch (parseErr) {
        console.error("Failed to parse JSON:", parseErr);
        setError("Failed to parse itinerary from Gemini response");
        setLoading(false);
        return;
      }

      // Validate structure
      if (!Array.isArray(generatedItinerary)) {
        setError("Itinerary is not an array");
        setLoading(false);
        return;
      }

      setItinerary(generatedItinerary);
      console.log("Itinerary set:", generatedItinerary);
    } catch (err) {
      console.error("Error generating itinerary:", err);
      setError(err.message || "Failed to generate itinerary");
    } finally {
      setLoading(false);
    }
  };

  const addActivity = () => {
    const dayIndex = Math.max(0, newActivity.day - 1);
    const list = [...itinerary];
    while (list.length <= dayIndex)
      list.push({ day: list.length + 1, activities: [] });
    list[dayIndex].activities.push({
      ...newActivity,
      id: `local-${Date.now()}`,
    });
    setItinerary(list);
    setShowAddActivity(false);
    setNewActivity({ day: 1, time: "09:00", place: "", description: "" });
  };

  const removeActivity = (dayIdx, activityId) => {
    const list = itinerary.map((d) => ({
      ...d,
      activities: [...d.activities],
    }));
    list[dayIdx].activities = list[dayIdx].activities.filter(
      (a) => a.id !== activityId,
    );
    setItinerary(list);
  };
  const [saving, setSaving] = useState(false);
  const saveItinerary = async () => {
    setSaving(true);
    try {
      await updateTrip(tripId, { tripItinerary: itinerary });
      alert("Itinerary saved!");
    } catch (err) {
      confirm.error(err);
      alert("Failed to save itinerary, try again!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading trip...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!trip) return <div className="p-6">Trip not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <button
                onClick={goBack}
                className="mb-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 hover:bg-gray-200 rounded transition"
              >
                ← Back
              </button>
              <h1 className="text-4xl font-bold text-[#035199] mb-2">
                {trip.tripName}
              </h1>
              <p className="text-lg text-gray-600">
                🌍 {trip.tripDestination} • {formatDate(trip.tripStartDate)} to{" "}
                {formatDate(trip.tripEndDate)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateItinerary}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#3E8DD6] to-[#166ec1] text-white font-semibold hover:shadow-lg hover:scale-105 transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "✨ Generate Itinerary"}
              </button>
              <button
                onClick={() => setShowAddActivity(true)}
                className="px-6 py-3 rounded-lg border-2 border-[#3E8DD6] text-[#3E8DD6] font-semibold hover:bg-[#3E8DD6] hover:text-white transition"
              >
                + Add Place
              </button>
              <button
                onClick={saveItinerary}
                disabled={saving}
                className="px-6 py-3 rounded-lg border-2 border-[#3E8DD6] text-[#3E8DD6] font-semibold hover:bg-[#3E8DD6] hover:text-white transition"
              >
                {saving ? "Saving..." : "Save Itinerary"}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-[#3E8DD6]">
            <p className="text-gray-500 text-sm font-semibold">Trip Type</p>
            <p className="text-2xl font-bold text-[#035199] mt-2">
              {trip.tripType || "-"}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm font-semibold">Travelers</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {trip.tripTravellers || 1} 👥
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-semibold">Budget</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ₹{trip.tripBudget || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm font-semibold">Duration</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {(() => {
                try {
                  const s = new Date(trip.tripStartDate);
                  const e = new Date(trip.tripEndDate);
                  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
                  return Math.max(1, diff + 1);
                } catch {
                  return 1;
                }
              })()}{" "}
              Days
            </p>
          </div>
        </div>

        {/* Preferences */}
        {trip.tripPreferences && trip.tripPreferences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#035199] mb-3">
              📌 Trip Preferences
            </h3>
            <div className="flex flex-wrap gap-2">
              {trip.tripPreferences.map((pref, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-blue-100 to-indigo-100 text-[#035199] px-4 py-2 rounded-full text-sm font-semibold border border-blue-200"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#035199] mb-6 flex items-center gap-2">
            📅 Your Itinerary
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          {itinerary.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-lg font-semibold">No itinerary yet</p>
              <p className="text-sm mt-2">
                Click "Generate Itinerary" to create an AI-powered plan, or "Add
                Place" to build manually.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {itinerary.map((day, dayIdx) => (
                <div
                  key={day.day}
                  className="border-l-4 border-[#3E8DD6] bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-6 hover:shadow-md transition"
                >
                  <h3 className="text-xl font-bold text-[#035199] mb-4 flex items-center gap-2">
                    <span className="bg-[#3E8DD6] text-white rounded-full w-10 h-10 flex items-center justify-center">
                      {day.day}
                    </span>
                    Day {day.day}
                  </h3>

                  <div className="space-y-3">
                    {day.activities && day.activities.length > 0 ? (
                      day.activities.map((act, actIdx) => (
                        <div
                          key={act.id || actIdx}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#3E8DD6] transition flex justify-between items-start gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-[#3E8DD6]">
                                🕐
                              </span>
                              <span className="text-sm font-semibold text-gray-600">
                                {act.time}
                              </span>
                            </div>
                            <div className="text-lg font-semibold text-[#035199] mb-1">
                              📍 {act.place}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {act.description}
                            </p>
                            {act.avg_cost && (
                              <div className="mt-2 text-sm font-semibold text-green-600">
                                💰 ₹{act.avg_cost}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeActivity(dayIdx, act.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded transition font-semibold"
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No activities planned for this day.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddActivity && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-[#035199] mb-6">
              ➕ Add Activity
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Day
                </label>
                <input
                  type="number"
                  min={1}
                  value={newActivity.day}
                  onChange={(e) =>
                    setNewActivity((s) => ({
                      ...s,
                      day: Number(e.target.value),
                    }))
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#3E8DD6] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) =>
                    setNewActivity((s) => ({ ...s, time: e.target.value }))
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#3E8DD6] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Place
                </label>
                <input
                  value={newActivity.place}
                  onChange={(e) =>
                    setNewActivity((s) => ({ ...s, place: e.target.value }))
                  }
                  placeholder="e.g., Red Fort, Museum, Restaurant"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#3E8DD6] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What will you do here?"
                  rows={3}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#3E8DD6] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddActivity(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addActivity}
                className="px-6 py-2 bg-gradient-to-r from-[#3E8DD6] to-[#166ec1] text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
