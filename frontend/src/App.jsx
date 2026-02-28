import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Screens placeholder imports until files are created
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CartScreen from './screens/CartScreen';
import AddressScreen from './screens/AddressScreen';
import DeliveryScreen from './screens/DeliveryScreen';
import PaymentScreen from './screens/PaymentScreen';
import OrderScreen from './screens/OrderScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthSuccessScreen from './screens/AuthSuccessScreen';
import { PaymentSuccessScreen, PaymentFailedScreen } from './screens/PaymentStatusScreens';
import AdminDashboard from './screens/admin/AdminDashboard';
import ProductListScreen from './screens/admin/ProductListScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import UserListScreen from './screens/admin/UserListScreen';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/auth-success" element={<AuthSuccessScreen />} />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout/address" element={<AddressScreen />} />
              <Route path="/checkout/delivery" element={<DeliveryScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/checkout/success" element={<PaymentSuccessScreen />} />
              <Route path="/checkout/failed" element={<PaymentFailedScreen />} />
              <Route path="/order/:id" element={<OrderScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductListScreen />} />
              <Route path="/admin/orders" element={<OrderListScreen />} />
              <Route path="/admin/users" element={<UserListScreen />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
