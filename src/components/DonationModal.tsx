import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Download,
  Printer,
  Church,
  BookOpen,
  Users,
  Compass,
  Gift
} from 'lucide-react';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCause?: string;
}

interface CauseOption {
  id: string;
  title: string;
  description: string;
  icon: typeof Church;
}

const CAUSES: CauseOption[] = [
  {
    id: 'tribal-missions',
    title: 'Rural Jharkhand Tribal Missions & Crusades',
    description: 'Evangelism treks, gospel crusades, village aid & outreach across Santhal Parganas.',
    icon: Compass
  },
  {
    id: 'church-building',
    title: 'Church Building and Sound',
    description: 'Land and church building, acoustic treatments, worship instruments & Seating',
    icon: Church
  },
  {
    id: 'youth-kids',
    title: 'Kingdom Kids Sunday School & Youth Ministry',
    description: 'Sunday School workbooks, children gospel camps, school supplies & youth retreats.',
    icon: Users
  },
  {
    id: 'literature-free',
    title: 'Free Bible & Literature Distribution',
    description: 'Hindi and Santali Bibles, devotional songbooks & foundational discipleship tracts.',
    icon: BookOpen
  },
  {
    id: 'general-ministry',
    title: 'General Ministry Tithes & Offerings',
    description: 'Unrestricted support enabling daily ministry operations, pastoral care & prayer line.',
    icon: Gift
  }
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];
const UPI_ID = 'samuelsoren2@ybl';
const QR_IMAGE_PATH = '/assets/aistudio/Screenshot_2026-11-11_230417_31204063.png';

export function DonationModal({ isOpen, onClose, initialCause }: DonationModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'amount' | 'details' | 'payment' | 'receipt'>('amount');
  const [selectedCause, setSelectedCause] = useState<string>(initialCause || CAUSES[0].title);
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');

  // Donor details (pre-fill from user if authenticated)
  const [donorName, setDonorName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  // Payment details
  const [transactionId, setTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (initialCause) {
      setSelectedCause(initialCause);
    }
  }, [initialCause]);

  useEffect(() => {
    if (!isOpen) {
      // Reset step on modal close after delay
      const t = setTimeout(() => {
        setStep('amount');
        setErrorMessage('');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setAmount(num);
    } else {
      setAmount(0);
    }
  };

  const validateDetails = () => {
    if (!isAnonymous && !donorName.trim()) {
      setErrorMessage('Please enter your full name or select "Give anonymously".');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address to receive your official donation receipt.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMessage('Please enter your 12-digit UPI Reference / UTR Number from your banking app.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: isAnonymous ? 'Anonymous Donor' : donorName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          cause: selectedCause,
          amount: amount,
          frequency: frequency,
          paymentMethod: 'razorpay_qr',
          transactionId: transactionId.trim(),
          prayerRequest: prayerRequest.trim() || undefined,
          isAnonymous: isAnonymous
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record donation. Please check details.');
      }

      setCompletedDonation(data.donation);

      // Mirror donation to Firebase Firestore
      try {
        if (data.donation && data.donation.id) {
          await setDoc(doc(db, 'donations', data.donation.id), {
            ...data.donation,
            syncedAt: new Date().toISOString()
          });
        }
      } catch (fbErr) {
        console.warn('Firestore donation sync note:', fbErr);
      }

      setStep('receipt');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while processing your donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const deepPurple = '#30203D';
  const churchRed = '#C83338';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Top Bar */}
        <div 
          className="text-white px-6 py-5 flex items-center justify-between relative"
          style={{ backgroundColor: deepPurple }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: churchRed }}
            >
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold tracking-wide uppercase">
                Partner with Pastor Samuel Soren
              </h3>
              <p className="text-xs text-purple-200">
                Support Godda Missions, Church Building, & Kingdom Harvest
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Close donation modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        {step !== 'receipt' && (
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'amount' ? 'bg-[#C83338] text-white' : 'bg-green-600 text-white'}`}>
                {step === 'amount' ? '1' : <Check className="w-3.5 h-3.5" />}
              </span>
              <span className={step === 'amount' ? 'text-gray-900 font-bold' : 'text-gray-600'}>Cause & Amount</span>
            </div>
            <div className="h-0.5 w-6 sm:w-12 bg-gray-300" />
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'details' ? 'bg-[#C83338] text-white' : step === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                {step === 'payment' ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span className={step === 'details' ? 'text-gray-900 font-bold' : 'text-gray-600'}>Donor Details</span>
            </div>
            <div className="h-0.5 w-6 sm:w-12 bg-gray-300" />
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-[#C83338] text-white' : 'bg-gray-300 text-gray-700'}`}>
                3
              </span>
              <span className={step === 'payment' ? 'text-gray-900 font-bold' : 'text-gray-600'}>UPI & QR Code</span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: CAUSE & AMOUNT */}
          {step === 'amount' && (
            <div className="space-y-6">
              {/* Frequency Selector */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFrequency('one-time')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                    frequency === 'one-time'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  One-Time Seed Offering
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                    frequency === 'monthly'
                      ? 'bg-white text-[#C83338] shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Monthly Covenant Partner</span>
                </button>
              </div>

              {/* Choose Ministry Cause */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Select Cause / Ministry Purpose:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {CAUSES.map((c) => {
                    const IconComp = c.icon;
                    const isSelected = selectedCause === c.title;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCause(c.title)}
                        className={`cursor-pointer p-3.5 rounded-xl border-2 transition flex items-start space-x-3.5 ${
                          isSelected
                            ? 'border-[#C83338] bg-red-50/40 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-[#C83338] text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-bold ${isSelected ? 'text-[#C83338]' : 'text-gray-900'}`}>
                              {c.title}
                            </h4>
                            <input
                              type="radio"
                              name="cause"
                              checked={isSelected}
                              onChange={() => setSelectedCause(c.title)}
                              className="accent-[#C83338] w-4 h-4 cursor-pointer"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {c.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Select Donation Amount (INR):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-2.5 px-2 rounded-xl text-sm font-bold transition border ${
                        amount === val && customAmount === val.toString()
                          ? 'bg-[#C83338] text-white border-[#C83338] shadow'
                          : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-500 font-bold text-lg">₹</span>
                  </div>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="Enter Custom Amount"
                    className="block w-full rounded-xl border border-gray-300 py-3 pl-9 pr-24 text-gray-900 font-bold text-lg focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338]"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase">INR Currency</span>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (amount <= 0) {
                      setErrorMessage('Please enter a valid donation amount of at least ₹10.');
                      return;
                    }
                    setErrorMessage('');
                    setStep('details');
                  }}
                  className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-base uppercase tracking-wider text-white shadow-lg transition flex items-center justify-center space-x-2"
                  style={{ backgroundColor: churchRed }}
                >
                  <span>Continue to Donor Details (₹{amount.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DONOR DETAILS */}
          {step === 'details' && (
            <div className="space-y-5">
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 flex items-center justify-between text-xs sm:text-sm text-[#30203D]">
                <div>
                  <span className="font-bold text-[#C83338]">Cause:</span> {selectedCause}
                </div>
                <div className="font-extrabold text-base text-gray-900">
                  ₹{amount.toLocaleString('en-IN')} ({frequency === 'monthly' ? 'Monthly' : 'One-time'})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name {isAnonymous && <span className="text-gray-400 font-normal">(Anonymous Selected)</span>}
                </label>
                <input
                  type="text"
                  disabled={isAnonymous}
                  value={isAnonymous ? 'Anonymous Donor' : donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Bro. David Murmu"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338] disabled:bg-gray-100 disabled:text-gray-500"
                />
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="anonCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-[#C83338] rounded border-gray-300 focus:ring-[#C83338]"
                  />
                  <label htmlFor="anonCheck" className="ml-2 text-xs font-medium text-gray-600 cursor-pointer">
                    Keep my donation anonymous on ministry notices
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338]"
                  />
                  <span className="text-[11px] text-gray-500">Official receipt will be sent here</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338]"
                  />
                  <span className="text-[11px] text-gray-500">For SMS receipt & blessing message</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Personal Prayer Request for Pastor Samuel Soren (Optional)
                </label>
                <textarea
                  rows={2}
                  value={prayerRequest}
                  onChange={(e) => setPrayerRequest(e.target.value)}
                  placeholder="Share any special prayer request, family blessing, or healing needs for the Pastor's prayer team..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('amount')}
                  className="py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateDetails()) {
                      setStep('payment');
                    }
                  }}
                  className="flex-1 py-3 px-6 rounded-xl font-heading font-bold text-base uppercase tracking-wider text-white shadow-lg transition flex items-center justify-center space-x-2"
                  style={{ backgroundColor: churchRed }}
                >
                  <span>Proceed to Pay with UPI / QR Code</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT VIA UPI & RAZORPAY QR */}
          {step === 'payment' && (
            <form onSubmit={handleSubmitDonation} className="space-y-5">
              {/* Summary Bar */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-500">Giving To:</span>
                  <p className="text-sm font-bold text-gray-900">{selectedCause}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-gray-500">Amount:</span>
                  <p className="text-xl font-extrabold text-[#C83338]">₹{amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Two Column: UPI ID + Razorpay QR Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                {/* QR Code Section */}
                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    <QrCode className="w-4 h-4 text-[#C83338]" />
                    <span>Razorpay UPI QR Code</span>
                  </div>

                  {/* QR Code Image from uploaded asset */}
                  <div className="w-48 h-48 bg-white p-2 rounded-xl border border-gray-200 shadow-inner flex items-center justify-center overflow-hidden">
                    <img
                      src={QR_IMAGE_PATH}
                      alt="Razorpay UPI QR Code Pastor Samuel Soren"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 mt-2">
                    Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app
                  </p>
                </div>

                {/* Direct UPI ID & App Link Section */}
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#30203D] mb-1">
                      Official UPI ID:
                    </span>
                    <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-purple-200">
                      <span className="font-mono font-bold text-gray-900 text-sm select-all">
                        {UPI_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className={`text-xs px-2.5 py-1 rounded font-semibold transition flex items-center space-x-1 ${
                          copiedUpi
                            ? 'bg-green-600 text-white'
                            : 'bg-[#C83338] text-white hover:bg-red-700'
                        }`}
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className="block text-[11px] text-gray-500 mt-1.5">
                      Account Holder: Pastor Samuel Soren / Sacred Assemblies
                    </span>
                  </div>

                  {/* Mobile Direct Pay Link */}
                  <a
                    href={`upi://pay?pa=${UPI_ID}&pn=Pastor%20Samuel%20Soren&am=${amount}&cu=INR&tn=Ministry%20Donation`}
                    className="block text-center py-2.5 px-4 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition sm:hidden"
                  >
                    Open UPI App on this Phone
                  </a>

                  {/* Instructions */}
                  <div className="text-xs text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-800">Quick 3 Steps:</p>
                    <p>1. Open your UPI app (GPay / PhonePe / Paytm / BHIM).</p>
                    <p>2. Scan the QR code or send ₹{amount.toLocaleString('en-IN')} to <span className="font-bold text-[#C83338]">{UPI_ID}</span>.</p>
                    <p>3. Note down the 12-digit UTR / Reference No. and enter below.</p>
                  </div>
                </div>
              </div>

              {/* UTR Input & Verification */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
                  12-Digit UPI Transaction ID / UTR Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 412389102938 or UPI Ref No."
                  className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm uppercase tracking-wider focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Found in your banking/UPI payment receipt (UTR / Ref ID) to generate your verified receipt.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-6 rounded-xl font-heading font-bold text-base uppercase tracking-wider text-white shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-60"
                  style={{ backgroundColor: churchRed }}
                >
                  {isSubmitting ? (
                    <span>Verifying Donation...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Confirm & Generate Official Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: OFFICIAL RECEIPT */}
          {step === 'receipt' && completedDonation && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 uppercase">
                  Thank You for Your Generous Offering!
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  May the Lord multiply your seed and bless your home abundantly.
                </p>
              </div>

              {/* Printable Receipt Card */}
              <div 
                id="donation-receipt-card"
                className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm"
              >
                {/* Header of Receipt */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                  <div>
                    <h4 className="font-heading text-lg font-bold text-[#30203D] uppercase">
                      PASTOR SAMUEL SOREN MINISTRIES
                    </h4>
                    <p className="text-xs text-gray-500">
                      Sacred Assemblies Fellowship Church, Godda, Jharkhand, India
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      UPI ID: {UPI_ID}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
                      Verified Giving
                    </span>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {new Date(completedDonation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm mb-4">
                  <div>
                    <span className="text-gray-500 block text-xs uppercase font-semibold">Receipt Number:</span>
                    <span className="font-mono font-bold text-gray-800">{completedDonation.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase font-semibold">UTR / Transaction ID:</span>
                    <span className="font-mono font-bold text-gray-800 break-all">{completedDonation.transactionId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase font-semibold">Donor Name:</span>
                    <span className="font-bold text-gray-800">{completedDonation.donorName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase font-semibold">Email:</span>
                    <span className="font-bold text-gray-800">{completedDonation.email}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs uppercase font-semibold">Designated Purpose:</span>
                    <span className="font-bold text-[#C83338]">{completedDonation.cause}</span>
                  </div>
                </div>

                {/* Amount Callout */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                  <span className="font-bold text-gray-700 text-sm uppercase">Total Contribution Amount:</span>
                  <span className="text-2xl font-black text-gray-900">
                    ₹{completedDonation.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Scripture Quote */}
                <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                  <p className="text-xs italic text-gray-600">
                    "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                  </p>
                  <p className="text-[11px] font-bold text-[#C83338] mt-0.5">
                    — 2 Corinthians 9:7
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-black transition flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition flex items-center justify-center space-x-2"
                  style={{ backgroundColor: churchRed }}
                >
                  <span>Done / Close</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonationModal;
