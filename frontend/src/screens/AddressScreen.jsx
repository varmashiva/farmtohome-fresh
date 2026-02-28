import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AddressScreen = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [addressDetails, setAddressDetails] = useState(() => {
        const saved = localStorage.getItem('checkoutAddress');
        return saved ? JSON.parse(saved) : {
            fullName: user?.name || '',
            phone: '',
            alternatePhone: '',
            house: '',
            community: '' // Start empty to force choice
        };
    });

    useEffect(() => {
        if (!user) navigate('/login?redirect=checkout/address');
    }, [user, navigate]);

    const handleInputChange = (e) => {
        setAddressDetails({ ...addressDetails, [e.target.name]: e.target.value });
    };

    const isFormValid = () => {
        return (
            addressDetails.fullName.trim() !== '' &&
            addressDetails.phone.replace(/\D/g, '').length === 10 &&
            addressDetails.house.trim() !== '' &&
            addressDetails.community !== ''
        );
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (isFormValid()) {
            localStorage.setItem('checkoutAddress', JSON.stringify(addressDetails));
            navigate('/checkout/delivery');
        }
    };

    return (
        <div className="max-w-2xl mx-auto glass-card p-8 mt-10">
            <h2 className="text-3xl font-bold mb-6 text-center shadow-accent/50 drop-shadow-md">Shipping Address</h2>
            <form onSubmit={submitHandler} className="space-y-6">

                <div className="border-b border-white/20 pb-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-accent/90">Personal Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name (required)</label>
                            <input type="text" name="fullName" required value={addressDetails.fullName} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone Number (required)</label>
                                <input type="tel" name="phone" required pattern="\d{10}" title="10 digit phone number" value={addressDetails.phone} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" placeholder="10 Digits" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alternate Phone Number (optional)</label>
                                <input type="tel" name="alternatePhone" value={addressDetails.alternatePhone} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4 text-accent/90">Address Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">House / Flat Number (required)</label>
                            <input type="text" name="house" required value={addressDetails.house} onChange={handleInputChange} className="w-full p-3 glass-input rounded-lg" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Select Community (Required)</label>
                            <select
                                name="community"
                                required
                                value={addressDetails.community}
                                onChange={handleInputChange}
                                className="w-full p-3 glass-input rounded-lg text-black bg-white/90 cursor-pointer"
                            >
                                <option value="" disabled>Select a community...</option>
                                <option value="Community 1">Community 1</option>
                                <option value="Community 2">Community 2</option>
                            </select>
                            <p className="mt-2 text-xs italic text-white opacity-70">
                                We are currently delivering only in Bhimavaram within Community 1 and Community 2.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid()}
                    className="w-full mt-8 glass-button py-4 rounded-lg font-bold text-xl uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </form>
        </div>
    );
};

export default AddressScreen;
