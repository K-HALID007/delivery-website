import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function CountryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">
              <span className="text-yellow-400">PRIME</span> <span className="text-slate-800">DISPATCHER</span>
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          <MapPin className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Page Not Found</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. The country or region you're trying to access may not be available yet.
          </p>
        </div>
        
        <div className="space-y-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-full bg-yellow-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back Home
          </Link>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-slate-800 font-semibold mb-4">Available Countries:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/countries/india" className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                India
              </Link>
              <Link href="/countries/usa" className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                USA
              </Link>
              <Link href="/countries/uae" className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                UAE
              </Link>
              <Link href="/countries/singapore" className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                Singapore
              </Link>
              <Link href="/countries/australia" className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                Australia
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}