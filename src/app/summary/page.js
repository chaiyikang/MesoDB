// src/app/summary/page.js
import { Suspense } from 'react';
import SummaryPageContent from '../components/SummaryPageContent';

export default function Summary() {
  return (
    <Suspense fallback={<div>Loading Summary...</div>}>
      <SummaryPageContent />
    </Suspense>
  );
}
