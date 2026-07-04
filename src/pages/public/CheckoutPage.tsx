import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Percent } from 'lucide-react';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  cardName: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV must be 3 digits'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const { user, cart, courses, checkout } = useApp();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const cartItems = courses.filter(course => cart.includes(course.id));

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.cost, 0);
  const discount = subtotal * discountPercent;
  const tax = (subtotal - discount) * 0.15;
  const total = subtotal - discount + tax;

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (trimmed === 'WELCOME10' || trimmed === 'BYWAY10') {
      setDiscountPercent(0.10);
      setCouponSuccess('10% discount coupon applied successfully!');
      toast.success('10% discount applied!');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10.');
      setDiscountPercent(0);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: '',
      state: '',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    }
  });

  const onSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const orderId = await checkout();
    navigate(`/purchase-complete?orderId=${encodeURIComponent(orderId)}`);
  };

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
        <Link to="/courses" className="hover:text-slate-600">Details</Link>
        <span>&gt;</span>
        <Link to="/cart" className="hover:text-slate-600">Shopping Cart</Link>
        <span>&gt;</span>
        <span className="text-blue-600">Checkout</span>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Checkout Page</h1>

      {cartItems.length > 0 ? (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Shipping and Billing Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Country and State Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-800">Billing Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">Country</label>
                  <input
                    type="text"
                    placeholder="Enter Country"
                    {...register('country')}
                    className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.country ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                    }`}
                  />
                  {errors.country && <p className="text-[10px] text-red-500 font-semibold">{errors.country.message}</p>}
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">State/Union Territory</label>
                  <input
                    type="text"
                    placeholder="Enter State"
                    {...register('state')}
                    className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.state ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                    }`}
                  />
                  {errors.state && <p className="text-[10px] text-red-500 font-semibold">{errors.state.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800">Payment Method</h2>
              
              {/* Option 1: Credit/Debit Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-800">
                    <input
                      type="radio"
                      name="payment-option"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Credit/Debit Card
                  </label>
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                    <span className="text-blue-800">VISA</span>
                    <span className="text-orange-500">MC</span>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-6 space-y-4">
                    {/* Name on Card */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800">Name of Card</label>
                      <input
                        type="text"
                        placeholder="Name of card"
                        {...register('cardName')}
                        className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.cardName ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                        }`}
                      />
                      {errors.cardName && <p className="text-[10px] text-red-500 font-semibold">{errors.cardName.message}</p>}
                    </div>

                    {/* Card Number */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800">Card Number</label>
                      <input
                        type="text"
                        placeholder="Card Number"
                        {...register('cardNumber')}
                        className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.cardNumber ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                        }`}
                      />
                      {errors.cardNumber && <p className="text-[10px] text-red-500 font-semibold">{errors.cardNumber.message}</p>}
                    </div>

                    {/* Expiry and CVV (Matches visual placeholders "Enter Country" exactly!) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          {...register('expiryDate')}
                          className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            errors.expiryDate ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                          }`}
                        />
                        {errors.expiryDate && <p className="text-[10px] text-red-500 font-semibold">{errors.expiryDate.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-800">CVC/CVV</label>
                        <input
                          type="text"
                          placeholder="CVV"
                          {...register('cvv')}
                          className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            errors.cvv ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                          }`}
                        />
                        {errors.cvv && <p className="text-[10px] text-red-500 font-semibold">{errors.cvv.message}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: PayPal */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 flex justify-between items-center">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-800">
                    <input
                      type="radio"
                      name="payment-option"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    PayPal
                  </label>
                  <span className="text-blue-600 font-extrabold italic text-sm">PayPal</span>
                </div>

                {paymentMethod === 'paypal' && (
                  <div className="p-6 text-center text-slate-500 text-xs font-medium">
                    You will be redirected to PayPal to authorize the payment transaction upon completing checkout.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-6">
              
              {/* Summary Items list */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">Order Details ({cartItems.length})</h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600"
                    >
                      <span className="truncate max-w-[200px]">{item.title}</span>
                      <span className="text-slate-900 flex-shrink-0 ml-2">{formatVal(item.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo code input */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="APPLY COUPON CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-dashed border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 text-xs font-bold text-slate-600"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-green-600 font-semibold">{couponSuccess}</p>}
              </div>

              {/* Price Details */}
              <div className="space-y-3.5 text-sm font-semibold text-slate-600 border-t border-slate-100 pt-4">
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

              {/* Pay Now Button */}
              <button
                type="submit"
                disabled={isSubmitting || (paymentMethod === 'card' && Object.keys(errors).length > 0)}
                className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Processing Payment...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center max-w-sm mx-auto">
          <p className="text-slate-500 text-sm font-medium">No items to checkout.</p>
          <Link to="/courses" className="mt-3 inline-block text-blue-600 font-bold text-xs hover:underline">
            View Courses Catalog
          </Link>
        </div>
      )}
    </div>
  );
};

