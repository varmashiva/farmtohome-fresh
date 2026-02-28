import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DeliveryScreen = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [deliveryDate, setDeliveryDate] = useState(() => {
        const saved = localStorage.getItem('deliveryDate');
        return saved || '24 hours';
    });

    const [dateType, setDateType] = useState(() => {
        const saved = localStorage.getItem('deliveryDate');
        return saved === '24 hours' || !saved ? '24 hours' : 'specific';
    });

    useEffect(() => {
        if (!user) navigate('/login');

        // Ensure address step was completed
        const savedAddress = localStorage.getItem('checkoutAddress');
        if (!savedAddress) {
            navigate('/checkout/address');
        }
    }, [user, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        localStorage.setItem('deliveryDate', dateType === '24 hours' ? '24 hours' : deliveryDate);
        navigate('/payment');
    };

    return (
        <div className="max-w-2xl mx-auto glass-card p-8 mt-10">
            <h2 className="text-3xl font-bold mb-6 text-center">Delivery Date</h2>
            <form onSubmit={submitHandler} className="space-y-6">

                <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" checked={dateType === '24 hours'} onChange={() => setDateType('24 hours')} className="w-5 h-5 text-accent" />
                        <span className="text-lg">Within 24 Hours</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" checked={dateType === 'specific'} onChange={() => setDateType('specific')} className="w-5 h-5 text-accent" />
                        <span className="text-lg">Specific Date</span>
                    </label>
                    {dateType === 'specific' && (
                        <input
                            type="date"
                            required
                            value={deliveryDate === '24 hours' ? '' : deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full p-3 glass-input rounded-lg mt-2 text-black bg-white/90"
                        />
                    )}
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/checkout/address')}
                        className="w-1/3 glass-button py-4 rounded-lg font-bold text-lg uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/30"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="w-2/3 glass-button py-4 rounded-lg font-bold text-xl uppercase tracking-wider text-accent border border-accent/50 hover:bg-accent/10"
                    >
                        Continue to Payment
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DeliveryScreen;
