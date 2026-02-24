import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../utils/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const SignUp = () => {
  const navigate = useNavigate();
  const email = useRef(null);
  const password = useRef(null);
  const name = useRef(null);
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState("");

  const googleLoginHandle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result); // This gives you a Google Access Token. You can use it to access the Google API.
        const token = credential.accessToken;
        const user = result.user;
        const {uid, displayName, email, photoURL} = user; // The signed-in user info.
        dispatch(addUser({uid: uid, userName: displayName, email: email, photo: photoURL}));
        console.log(user);
        navigate("/" + uid);
      })
      .catch((error) => {
        const errorCode = error.code; // Handle Errors here.
        const errorMessage = error.message;
        const email = error.customData.email; // The email of the user's account used.
        const credential = GoogleAuthProvider.credentialFromError(error); // The AuthCredential type that was used.
      });
  };

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email.current.value, password.current.value)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    const {uid, email} = user;
    dispatch(addUser({uid: uid, userName: name.current.value, email: email}));
    navigate("/" + uid);

    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    setErrorMsg(errorCode + " " + errorMessage);
    // ..
  });
  }
  return (
    <>
      <div className="w-screen h-screen bg-[#e6ffff]">
        <div className="absolute bg-white h-fit w-120 text-[#035199] my-15 mx-auto left-0 right-0 p-10 rounded-lg shadow-xl" >
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col">
            <h1 className="text-3xl text-center font-semibold mx-5 mt-3 mb-5">
              Create new account
            </h1>
            <button
              className="bg-[#ffffff] hover:bg-[#e6ffff] mx-5 my-2 p-3 text-md font-semibold rounded-3xl cursor-pointer shadow-lg flex items-center justify-center gap-3"
              onClick={googleLoginHandle}
            >
              <img
                src="src/utils/icons8-google.svg"
                width={30}
                alt="Google icon"
                className="inline-block"
              />
              <span className="inline-block">Sign up with Google</span>
            </button>
            <div className="flex items-center justify-center gap-3 my-5 w-full">
              <hr className="border-gray-400 flex-1" />
              <span className="text-gray-500 font-semibold">or</span>
              <hr className="border-gray-400 flex-1" />
            </div>
            <input
              ref={name}
              type="text"
              placeholder="Full Name"
              className="mx-5 my-2 p-3 border-2 border-gray-400 rounded-sm"
            />
            <input
              ref={email}
              type="text"
              placeholder="Email Address"
              className="mx-5 my-2 p-3 border-2 border-gray-400 rounded-sm"
            />
            <input
              ref={password}
              type="password"
              placeholder="Password"
              className="mx-5 my-2 p-3 border-2 border-gray-400 rounded-sm"
            />
            <p className="text-md text-red-600 p-3 mx-2 font-bold">{errorMsg}</p>
            <button
              type="button"
              className="bg-[#035199] hover:bg-[#3E8DD6] mx-5 my-2 p-3 text-md text-white font-bold rounded-3xl cursor-pointer"
              onClick={handleSignUp}
            >
              Create account
            </button>
            <h1
              className="text-md text-center text-gray-500 font-semibold mx-3 my-2 hover:underline cursor-pointer"
              onClick={() => {
                navigate("/login");
              }}
            >
              I already have an account
            </h1>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
