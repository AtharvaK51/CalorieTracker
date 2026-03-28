# Building CalorieTracker APK

This guide covers building a debug or release APK for **CalorieTracker** on your local Arch Linux machine.

---

## Prerequisites

### 1. Node.js & npm

Make sure Node.js (v18+) and npm are installed:

```bash
node --version
npm --version
```

If not installed:

```bash
sudo pacman -S nodejs npm
```

---

### 2. JDK 17

Gradle requires **JDK 17**. The system default may be a different version.

Install JDK 17:

```bash
sudo pacman -S jdk17-openjdk
```

Verify it's available:

```bash
ls /usr/lib/jvm/java-17-openjdk
```

---

### 3. Android SDK

#### Option A — Android Studio (recommended)

1. Download Android Studio from https://developer.android.com/studio
2. Install it and open it once to complete the SDK setup wizard
3. The SDK will be installed at `~/Android/Sdk` by default

#### Option B — Command-line tools only

```bash
# Create SDK directory
mkdir -p ~/Android/Sdk/cmdline-tools

# Download command-line tools from https://developer.android.com/studio#command-tools
# Extract to ~/Android/Sdk/cmdline-tools/latest/

# Install required SDK components
~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager \
  "platform-tools" \
  "platforms;android-35" \
  "build-tools;35.0.0"
```

---

### 4. Environment Variables

Add these to your `~/.zshrc` (or `~/.bashrc`):

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

Apply the changes:

```bash
source ~/.zshrc
```

Verify:

```bash
echo $JAVA_HOME       # Should show /usr/lib/jvm/java-17-openjdk
echo $ANDROID_HOME    # Should show /home/<you>/Android/Sdk
java -version         # Should show openjdk 17
```

---

## Build Steps

### Step 1 — Clone the repo (if not already done)

```bash
git clone https://github.com/atharvak51/calorietracker.git
cd calorietracker
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Generate native Android project

This creates the `android/` directory with all native files:

```bash
npx expo prebuild --platform android
```

> If the `android/` directory already exists, add `--clean` to regenerate it fresh:
> ```bash
> npx expo prebuild --platform android --clean
> ```

### Step 4 — Build the APK

#### Debug APK (for testing — no signing key needed)

```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (optimized — requires signing key)

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

> A release APK needs to be signed before it can be installed. See the [Signing section](#signing-a-release-apk) below.

---

## Installing on Your Phone

### Via ADB (USB cable)

1. Enable **Developer Options** on your phone (tap "Build number" 7 times in Settings > About Phone)
2. Enable **USB Debugging** in Developer Options
3. Connect phone via USB and run:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Via file transfer

1. Copy the `.apk` to your phone (USB, cloud storage, etc.)
2. On the phone, go to **Settings > Apps > Special app access > Install unknown apps**
3. Allow installs from your file manager
4. Open the `.apk` file and tap Install

---

## Signing a Release APK

To install a release APK or distribute it, you need to sign it.

### Generate a keystore (one-time setup)

```bash
keytool -genkeypair -v \
  -keystore my-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias my-key-alias
```

Keep this file safe — you need the same keystore to publish future updates.

### Sign the APK

```bash
# Sign
jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore my-release-key.jks \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  my-key-alias

# Align (optional but recommended)
zipalign -v 4 \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  app-release-signed.apk
```

### Or configure Gradle to sign automatically

Add to `android/app/build.gradle` under `android {}`:

```groovy
signingConfigs {
    release {
        storeFile file("/path/to/my-release-key.jks")
        storePassword "your-store-password"
        keyAlias "my-key-alias"
        keyPassword "your-key-password"
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

Then `./gradlew assembleRelease` produces a signed APK directly.

---

## Troubleshooting

### "Unsupported class file major version"

Gradle is using the wrong JDK. Fix:

```bash
echo $JAVA_HOME   # Must point to JDK 17, not 21/26
```

Also check `android/gradle.properties` — it should contain:

```
org.gradle.java.home=/usr/lib/jvm/java-17-openjdk
```

### "SDK location not found"

`ANDROID_HOME` is not set or the SDK path is wrong. Verify:

```bash
echo $ANDROID_HOME
ls $ANDROID_HOME/platforms
```

### `npx expo prebuild` fails

Make sure `npm install` was run first and there are no TypeScript errors:

```bash
npm install
npx tsc --noEmit
```

### Gradle download is slow / times out

Gradle downloads dependencies on first build. This is normal. If it times out, re-run the same command — it resumes from where it left off.

---

## App Details

| Field | Value |
|-------|-------|
| App name | CalorieTracker |
| Package | `com.anonymous.CalorieTracker` |
| Version | 1.0.0 |
| Min SDK | Android 6.0+ |
| Target SDK | Android 14 (API 35) |
