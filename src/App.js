import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Toaster from './components/ui/Toaster';

import Landing from './pages/Landing';
import MenuPage from './pages/MenuPage';
import Services from './pages/Services';
import About from './pages/AboutUs';
import ContactUs from './pages/ContacUs';
import LoginPage from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import Profile from './pages/Profile';
import OrderPage from './pages/OrderPage';
import ReviewOrder from './pages/ReviewOrder';
import InvoicePage from "./pages/InvoicePage";
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataDeletionRequest from './pages/DataDeletionRequest';
import ClosedTestingRegistration from './pages/ClosedTestingRegistration';

import { CartProvider } from './utils/cartContext';
import { SSEProvider } from './utils/SSEContext';
import { MenuProvider } from './utils/MenuContext';
import { AuthProvider } from './utils/AuthContext';
import { LocationProvider } from './utils/LocationContext';

import ProtectedRoute from './components/ProtectedRoute';
import MealBox from './pages/MealBox';
import Provisions from './pages/Provisions';


function App() {
  return (
    <LocationProvider>
      <CartProvider>
        <AuthProvider>
          <MenuProvider>

            <SSEProvider>
              <Router>

              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/request-deletion" element={<DataDeletionRequest />} />
                  <Route path="/closed-testing" element={<ClosedTestingRegistration />} />
                  {/* Public on purpose: the catalogue and prices are browsable
                      signed out, and the page sends you to login at checkout.
                      Gating the whole route would hide the prices behind a
                      sign-up, which is the opposite of a storefront. */}
                  <Route path="/pickles-powders" element={<Provisions />} />

                  {/* Protected Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/catering/order"
                    element={
                      <ProtectedRoute>
                        <OrderPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/review-order"
                    element={
                      <ProtectedRoute>
                        <ReviewOrder />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/invoice/:orderId"
                    element={
                      <ProtectedRoute>
                        <InvoicePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mealbox"
                    element={
                      <ProtectedRoute>
                        <MealBox />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />

                </Routes>

                <Toaster />
              </div>
            </Router>
          </SSEProvider>
        </MenuProvider>
      </AuthProvider>
    </CartProvider>
  </LocationProvider>
  );
}

export default App;
