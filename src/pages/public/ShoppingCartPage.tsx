import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { StarRating } from '../../components/common/StarRating';
import { AlertCircle } from 'lucide-react';

export const ShoppingCartPage: React.FC = () => {
  const { user, cart, courses, instructors, removeFromCart } = useApp();
  const navigate = useNavigate();

  // Find course items matching cart ids
  const cartItems = courses.filter(course => cart.includes(course.id));

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.cost, 0);
  const discount = 0.00;
  const taxRate = 0.15; // 15% tax
  const tax = subtotal * taxRate;
  const total = subtotal - discount + tax;

  // Format currency
  const formatVal = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left font-sans">
      
      {/* Breadcrumb banner */}
      <div className="text-xs font-semibold text-slate-400 flex gap-2 items-center mb-6">
        <Link to="/courses" className="hover:text-slate-600">Courses</Link>
        <span>&gt;</span>
        <span className="hover:text-slate-600">Details</span>
        <span>&gt;</span>
        <span className="text-blue-600">Shopping Cart</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-slate-400 text-xs font-semibold mt-1">
          {cartItems.length} {cartItems.length === 1 ? 'Course' : 'Courses'} in cart
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Columns - Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const instructor = instructors.find(i => i.id === item.instructorId);
              return (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Image */}
                  <div className="w-full sm:w-40 aspect-[700/430] sm:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between text-left space-y-1.5">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400">By {instructor?.name || 'Unknown'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span>{item.rate}</span>
                        <StarRating rating={item.rate} size={12} />
                      </div>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400">
                        {item.totalHours} Total Hours. {item.lectures} Lectures. All levels
                      </span>
                    </div>

                    {/* Remove CTA */}
                    <div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="sm:text-right font-extrabold text-slate-900 text-lg sm:pl-4 self-center sm:self-start">
                    {formatVal(item.cost)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Order Summary Widget */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                Order Details
              </h2>
              
              <div className="space-y-3.5 text-sm font-semibold text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Price</span>
                  <span className="text-slate-900">{formatVal(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span className="text-slate-900">{formatVal(discount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span className="text-slate-900">{formatVal(tax)}</span>
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-base font-extrabold text-slate-900">
                  <span>Total</span>
                  <span className="text-lg">{formatVal(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(user ? '/checkout' : '/login')}
                className="w-full py-3.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto mt-8 flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-slate-400" />
          <h3 className="font-bold text-slate-700">Your Cart is Empty</h3>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            It looks like you haven't added any courses to your shopping cart yet. Let's find some courses to kickstart your learning journey!
          </p>
          <Link 
            to="/courses"
            className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
          >
            Explore Courses
          </Link>
        </div>
      )}
    </div>
  );
};

