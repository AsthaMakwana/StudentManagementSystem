// const reportWebVitals = onPerfEntry => {
//   if (onPerfEntry && onPerfEntry instanceof Function) {
//     import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
//       getCLS(onPerfEntry);
//       getFID(onPerfEntry);
//       getFCP(onPerfEntry);
//       getLCP(onPerfEntry);
//       getTTFB(onPerfEntry);
//     });
//   }
// };

// export default reportWebVitals;

// Import the web-vitals module
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Define the ReportHandler type
type ReportHandler = (metric: Metric) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Use the on* methods for each metric
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;



