import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AddressScreen = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [shippingAddress, setShippingAddress] = useState(() => {
        const saved = localStorage.getItem('shippingAddress');
        return saved ? JSON.parse(saved) : {
            name: user?.name || '',
            phoneNumber: '',
            address: '',
            city: '',
            pincode: '',
            community: 'Community 1',
        };
    });

    const [deliveryDate, setDeliveryDate] = useState(() => {
        const saved = localStorage.getItem('deliveryDate');
        return saved || '24 hours';
    });

    const [dateType, setDateType] = useState(deliveryDate === '24 hours' ? '24 hours' : 'specific');

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
        localStorage.setItem('deliveryDate', dateType === '24 hours' ? '24 hours' : deliveryDate);
        navigate('/payment');
    };

    const handleInputChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto glass-card p-8 mt-10">
            <h2 className="text-3xl font-bold mb-6 text-center">Shipping & Delivery</h2>
            <form onSubmit={submitHandler} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" name="name" required value={shippingAddress.name} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input type="tel" name="phoneNumber" required value={shippingAddress.phoneNumber} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea name="address" required value={shippingAddress.address} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input type="text" name="city" required value={shippingAddress.city} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Pincode</label>
                        <input type="text" name="pincode" required value={shippingAddress.pincode} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Community (Required)</label>
                    <select name="community" required value={shippingAddress.community} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg text-black bg-white/90">
                        <option value="Community 1">Community 1</option>
                        <option value="Community 2">Community 2</option>
                    </select>
                </div>

                <div className="border-t border-white/20 pt-6 mt-6">
                    <h3 className="text-xl font-bold mb-4">Delivery Date</h3>
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
                </div>

                <button type="submit" className="w-full glass-button py-4 rounded-lg font-bold text-xl uppercase tracking-wider mt-8">
                    Continue to Payment
                </button>
            </form>
        </div>
    );
};

export default AddressScreen;
