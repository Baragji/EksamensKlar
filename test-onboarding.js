
// Test script to clear localStorage and test onboarding
localStorage.clear();
console.log('✅ localStorage cleared');
console.log('📍 Available storage keys:', Object.keys(localStorage));
window.location.reload();

