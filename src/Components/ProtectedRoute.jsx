import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // No user is signed in, redirect to homepage
                navigate('/');
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [navigate]);

    return children;
};

export default ProtectedRoute;