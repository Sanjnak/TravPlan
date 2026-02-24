import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import HomePage from "./Components/HomePage";
import { createRoot } from "react-dom/client";
import { StrictMode, useEffect } from "react";
import "./index.css";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import { Provider } from "react-redux";
import AppStore from "./utils/AppStore";
import BrowsePage from "./Components/BrowsePage";
import ProtectedRoute from "./Components/ProtectedRoute";
import TripDetails from "./Components/TripDetails";
import { useDispatch } from "react-redux";
import { addUser, removeUser } from "./utils/userSlice";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          addUser({
            userName: user.displayName || "User",
            email: user.email || "",
            photo: user.photoURL || "src/utils/5652314.webp",
            uid: user.uid,
          })
        );
      } else {
        dispatch(removeUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <Outlet />;
}

const appRoute = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: ":id",
        element: (
          <ProtectedRoute>
            <BrowsePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "trip/:tripId",
        element: (
          <ProtectedRoute>
            <TripDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={AppStore}>
    <StrictMode>
      <RouterProvider router={appRoute} />
    </StrictMode>
  </Provider>
);

export default App;
