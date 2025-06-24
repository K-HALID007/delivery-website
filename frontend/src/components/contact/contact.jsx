'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <section className="bg-white py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have questions about your shipment, partnership opportunities, or support needs? We’re here to help.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-semibold text-slate-800 mb-6">
              Send Us a Message
            </h3>
            <form className="space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
                  required
                />
              </div>
              <div>
                <textarea
                  rows="5"
                  placeholder="Your Message"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 transition text-white font-semibold text-lg py-3 rounded-lg"
              >
                Submit
              </button>
            </form>
          </motion.div>

          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="flex items-start space-x-4">
              <Phone className="text-yellow-500 w-6 h-6 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-slate-800">Phone</h4>
                <p className="text-slate-600">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="text-yellow-500 w-6 h-6 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-slate-800">Email</h4>
                <p className="text-slate-600">support@primedispatcher.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPin className="text-yellow-500 w-6 h-6 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-slate-800">Address</h4>
                <p className="text-slate-600">
                  123 Courier Lane,<br />
                  Logistics Hub, Mumbai, MH 400001
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
