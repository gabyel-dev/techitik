// Test script to remove event listeners
// This simulates a student trying to bypass monitoring

console.log("=== Starting Listener Removal Test ===");

// Get all event listeners (Chrome only)
if (typeof getEventListeners === 'function') {
  const blurListeners = getEventListeners(window).blur || [];
  const focusListeners = getEventListeners(window).focus || [];
  const visibilityListeners = getEventListeners(document).visibilitychange || [];
  
  console.log(`Found ${blurListeners.length} blur listeners`);
  console.log(`Found ${focusListeners.length} focus listeners`);
  console.log(`Found ${visibilityListeners.length} visibilitychange listeners`);
  
  // Remove blur listeners
  blurListeners.forEach((listener, index) => {
    window.removeEventListener('blur', listener.listener);
    console.log(`Removed blur listener #${index + 1}`);
  });
  
  // Remove focus listeners
  focusListeners.forEach((listener, index) => {
    window.removeEventListener('focus', listener.listener);
    console.log(`Removed focus listener #${index + 1}`);
  });
  
  // Remove visibilitychange listeners
  visibilityListeners.forEach((listener, index) => {
    document.removeEventListener('visibilitychange', listener.listener);
    console.log(`Removed visibilitychange listener #${index + 1}`);
  });
  
  console.log("✅ All listeners removed!");
  console.log("🔍 Now switch tabs or click outside to test tamper detection...");
  console.log("⏱️  Tamper check runs every 2 seconds");
  
} else {
  console.error("❌ getEventListeners() not available. Use Chrome DevTools.");
  console.log("Alternative: Just switch tabs after running this script");
}

// Alternative method that works in all browsers
console.log("\n=== Alternative Method ===");
console.log("The listeners are already attached. Just switch tabs now.");
console.log("If tamper detection works, you'll see an alert within 2 seconds of switching tabs.");
