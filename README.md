# לוח הכפל - Multiplication Table Learning App

אפליקציה ללימוד לוח הכפל עם משוב מעודד וממריץ בעברית.

## Features / תכונות

- 🎓 **User Registration** - Name and gender for personalized feedback
- 📊 **Smart Exercise Selection** - Exercises are grouped 1-4 based on performance
- ⏱️ **Time Tracking** - Tracks response time (hidden from user)
- 💬 **Encouraging Feedback** - Personalized Hebrew messages
- 📈 **Progress Reports** - Daily, weekly, monthly, and all-time statistics

## How to Build APK

### Prerequisites

1. Install Node.js (v18 or later): https://nodejs.org/
2. Install Expo CLI and EAS CLI:
   ```bash
   npm install -g expo-cli eas-cli
   ```
3. Create an Expo account at https://expo.dev/

### Build Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build APK:**
   ```bash
   eas build -p android --profile preview
   ```
   
   This will build an APK file in the cloud. Once complete, you'll get a download link.

### Alternative: Local Build (requires Android SDK)

If you have Android Studio and the Android SDK installed:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`

## Development

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go app on your Android device.

## App Logic

### Exercise Groups (1-4)
- **Group 1**: Basic - lowest probability of appearing
- **Group 2**: 3x more likely than Group 1
- **Group 3**: 9x more likely than Group 1  
- **Group 4**: 27x more likely than Group 1

### Group Movement
- Wrong answer OR response > 10 seconds → Move up one group
- Correct answer AND response < 10 seconds → Move down one group

### After Wrong Answer
- Next exercise is different
- Exercise after that is the same one they got wrong








