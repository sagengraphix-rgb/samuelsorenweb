import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { validateContactSubmission } from '../lib/validation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const ContactPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'General Inquiry' | 'Prayer Request' | 'Speaking Invitation' | 'Ministry Inquiry' | 'Other'>('Prayer Request');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    // Client-side pure validation
    const clientValidation = validateContactSubmission({
      fullName,
      email,
      phone,
      category,
      subject,
      message
    });

    if (!clientValidation.valid) {
      setFieldErrors(clientValidation.errors);
      setErrorMessage('Please resolve the errors highlighted below.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          category,
          subject,
          message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        throw new Error(data.error || 'Failed to submit message.');
      }

      setSubmittedId(data.submissionId);

      // Mirror contact/prayer submission to Firebase Firestore
      try {
        if (data.submissionId) {
          await setDoc(doc(db, 'contactSubmissions', data.submissionId), {
            id: data.submissionId,
            fullName,
            email,
            phone: phone || null,
            category,
            subject,
            message,
            status: 'new',
            createdAt: new Date().toISOString()
          });
        }
      } catch (fbErr) {
        console.warn('Firestore contact submission mirror note:', fbErr);
      }

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner */}
        <div className="bg-[#30203D] text-white p-8 sm:p-12 rounded-xs relative overflow-hidden shadow-lg border-b-4 border-[#C83338]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#C83338]" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                PRAYER & MINISTERIAL CONTACT
              </span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight">
              CONNECT & REQUEST PRAYER
            </h1>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              We stand ready to join our faith with yours in prayer. Whether you have a personal prayer request, speaking invitation, or general ministry inquiry, we welcome your message.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-xs border border-neutral-200 shadow-sm space-y-6">
            
            <div className="space-y-2 border-b border-neutral-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C83338]">
                SECURE CONFIDENTIAL FORM
              </span>
              <h2 className="font-heading font-black text-2xl text-[#252525] uppercase tracking-tight">
                SEND A MESSAGE TO PASTOR SAMUEL SOREN
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded-xs border border-neutral-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Strict Privacy Assurance:</strong> Prayer requests and submissions are private and encrypted. Only authenticated pastoral leadership has access.
                </span>
              </div>
            </div>

            {submittedId ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xs text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl text-emerald-900">
                    Message Received Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                    &ldquo;Thank you for contacting Pastor Samuel Soren. Your message has been received successfully.&rdquo;
                  </p>
                  <p className="text-xs text-neutral-600 font-mono bg-white inline-block px-3 py-1 rounded-xs border border-emerald-200">
                    Submission Reference ID: <strong>{submittedId}</strong>
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmittedId(null)}
                    className="px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529]"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Inquiry Type / Category */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Inquiry Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden bg-white"
                  >
                    <option value="Prayer Request">Prayer Request (Confidential Pastoral Intercession)</option>
                    <option value="General Inquiry">General Ministry Inquiry</option>
                    <option value="Speaking Invitation">Speaking / Preaching Invitation</option>
                    <option value="Ministry Inquiry">Volunteer / Ministry Collaboration</option>
                    <option value="Other">Other Matter</option>
                  </select>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sister Anjali Marandi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden ${
                      fieldErrors.fullName ? 'border-red-400 bg-red-50/30' : 'border-neutral-300'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <span className="text-[11px] text-red-600 mt-1 block">{fieldErrors.fullName}</span>
                  )}
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="anjali@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden ${
                        fieldErrors.email ? 'border-red-400 bg-red-50/30' : 'border-neutral-300'
                      }`}
                    />
                    {fieldErrors.email && (
                      <span className="text-[11px] text-red-600 mt-1 block">{fieldErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 94311 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief title or reason for inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden ${
                      fieldErrors.subject ? 'border-red-400 bg-red-50/30' : 'border-neutral-300'
                    }`}
                  />
                  {fieldErrors.subject && (
                    <span className="text-[11px] text-red-600 mt-1 block">{fieldErrors.subject}</span>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Message / Prayer Request Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Share your prayer need, question, or message in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden ${
                      fieldErrors.message ? 'border-red-400 bg-red-50/30' : 'border-neutral-300'
                    }`}
                  />
                  {fieldErrors.message && (
                    <span className="text-[11px] text-red-600 mt-1 block">{fieldErrors.message}</span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-[#C83338] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-[#a62529] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Submit Message Privately</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Right: Location & Fellowship Info */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-xs border border-neutral-200 shadow-sm space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C83338]">
                CHURCH AFFILIATION
              </span>
              <h3 className="font-heading font-black text-xl text-[#252525] uppercase tracking-tight">
                Sacred Assemblies Fellowship Church
              </h3>

              <div className="space-y-4 text-xs text-neutral-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C83338] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Physical Location:</span>
                    <span>Guru Nagar, Gangta, Godda, Jharkhand 814133, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C83338] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Weekly Gatherings:</span>
                    <span>Sunday Worship Service &middot; 10:00 AM IST</span><br />
                    <span>Wednesday Prayer & Intercession &middot; 6:00 PM IST</span><br />
                    <span>Thursday Bible Teaching &middot; 7:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C83338] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Direct Line:</span>
                    <a href="tel:+919431123456" className="hover:text-[#C83338] transition-colors">
                      +91 94311 23456
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C83338] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 block">Official Email:</span>
                    <a href="mailto:contact@samuelsoren.org" className="hover:text-[#C83338] transition-colors">
                      contact@samuelsoren.org
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Godda+Jharkhand+India"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#C83338] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Get Driving Directions</span>
                </a>
              </div>
            </div>

            {/* Interactive Map Embed */}
            <div className="h-64 rounded-xs overflow-hidden border border-neutral-200 shadow-sm bg-neutral-100 relative">
              <iframe
                title="Sacred Assemblies Fellowship Location Map Godda"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116246.34771696013!2d87.14088959640952!3d24.827258384959245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f04bb2c7302485%3A0x889816bf6a9e144a!2sGodda%2C%20Jharkhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
