let isPerfEnabled = null;

function checkPerfEnabled() {
  if (isPerfEnabled !== null) return isPerfEnabled;
  
  try {
    isPerfEnabled = new URLSearchParams(window.location.search).has("perf") || 
                    window.localStorage?.getItem("anm-perf") === "1";
  } catch {
    isPerfEnabled = false;
  }
  
  if (isPerfEnabled) {
    console.log("%c[perf] debug logging ON (remove ?perf=1 to silence)", "color:#fd551d;font-weight:bold");
  }
  
  return isPerfEnabled;
}

const getTimestamp = () => (typeof performance === "undefined" ? 0 : performance.now());

export function perfLog(message, data) {
  if (!checkPerfEnabled()) return;
  
  const timeInSec = (getTimestamp() / 1000).toFixed(2);
  
  if (data !== undefined) {
    console.log(`[perf +${timeInSec}s] ${message}`, data);
  } else {
    console.log(`[perf +${timeInSec}s] ${message}`);
  }
}

export function perfMeasure(label, callback) {
  if (!checkPerfEnabled()) return callback();
  
  const start = getTimestamp();
  const result = callback();
  
  console.log(`[perf] ${label} took ${(getTimestamp() - start).toFixed(1)}ms`);
  
  return result;
}