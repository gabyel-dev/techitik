// Complete test script for tamper detection
// Copy and paste this entire script into Chrome DevTools Console

(function() {
  console.log("=== TAMPER DETECTION TEST SCRIPT ===\n");
  
  // Check if getEventListeners is available (Chrome only)
  if (typeof getEventListeners !== 'function') {
    console.error("❌ getEventListeners() not available.");
    console.log("This script only works in Chrome DevTools.");
    return;
  }
  
  // Get all event listeners
  const blurListeners = getEventListeners(window).blur || [];
  const focusListeners = getEventListeners(window).focus || [];
  const visibilityListeners = getEventListeners(document).visibilitychange || [];
  
  console.log(`📊 Found ${blurListeners.length} blur listener(s)`);
  console.log(`📊 Found ${focusListeners.length} focus listener(s)`);
  console.log(`📊 Found ${visibilityListeners.length} visibilitychange listener(s)\n`);
  
  if (blurListeners.length === 0 && visibilityListeners.length === 0) {
    console.warn("⚠️ No listeners found. Make sure you're on the quiz page.");
    return;
  }
  
  // Remove blur listeners
  let removedCount = 0;
  blurListeners.forEach((listener, index) => {
    window.removeEventListener('blur', listener.listener);
    console.log(`✅ Removed blur listener #${index + 1}`);
    removedCount++;
  });
  
  // Remove focus listeners
  focusListeners.forEach((listener, index) => {
    window.removeEventListener('focus', listener.listener);
    console.log(`✅ Removed focus listener #${index + 1}`);
    removedCount++;
  });
  
  // Remove visibilitychange listeners
  visibilityListeners.forEach((listener, index) => {
    document.removeEventListener('visibilitychange', listener.listener);
    console.log(`✅ Removed visibilitychange listener #${index + 1}`);
    removedCount++;
  });
  
  console.log(`\n🎯 Total listeners removed: ${removedCount}`);
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Switch to another tab or click outside the browser");
  console.log("2. Wait 2-4 seconds");
  console.log("3. Look for [TAMPER DETECTED] message in console");
  console.log("4. You should see a security alert on the page");
  console.log("5. Check teacher's submissions page for 🚨 DETECTED badge\n");
  
  console.log("⏱️  Tamper detection runs every 2 seconds...");
  console.log("👀 Watching for tamper detection...\n");
  
})();
