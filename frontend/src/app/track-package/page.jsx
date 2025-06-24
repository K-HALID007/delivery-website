import { Suspense } from 'react';
import TrackPackage from '@/components/track-package/TrackPackage';

function TrackPackageContent() {
  return <TrackPackage />;
}

export default function TrackPackagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-8 animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="h-5 w-1/2 bg-gray-200 rounded mb-8"></div>
            <div className="flex space-x-4 mb-8">
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 w-full bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    }>
      <TrackPackageContent />
    </Suspense>
  );
}
