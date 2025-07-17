// src/app/page.js
import { Suspense } from 'react';
import HomePageContent from './components/HomePageContent';

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}