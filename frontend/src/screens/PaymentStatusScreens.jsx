import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export const PaymentSuccessScreen = () => {
    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="glass-card p-10 w-full max-w-md text-center">
                <FaCheckCircle className="text-accent text-6xl mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4 drop-shadow-md">Payment Successful!</h2>
                <p className="text-white/80 mb-8">Your order has been received and confirmed.</p>
                <Link to="/profile" className="glass-button px-6 py-3 rounded-lg font-bold">
                    View My Orders
                </Link>
            </div>
        </div>
    );
};

export const PaymentFailedScreen = () => {
    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="glass-card p-10 w-full max-w-md text-center">
                <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-red-400 mb-4 drop-shadow-md">Payment Failed</h2>
                <p className="text-white/80 mb-8">We could not process your payment at this time. Please try again or contact support.</p>
                <Link to="/checkout/delivery" className="glass-button px-6 py-3 rounded-lg font-bold">
                    Go Back to Checkout
                </Link>
            </div>
        </div>
    );
};
