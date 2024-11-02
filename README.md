# Remindy - Hourly Push Notifications
I couldn't find a way to set hourly reminders on any of my native tools or calendars, 
so I built this.

<img src="https://i.imgur.com/hfVmhsb.png" alt="Image" width="350"/>


# Getting Started
Run with `npm start` and use `i` and `a` to launch app on expo go. `w` to launch web app.

## Native Deploy

> ℹ️ For all these steps you need to install EAS first

```bash
npm install -g eas-cli
```

```bash
eas build:configure
```

Login to expo account

```bash
eas login
```

Build for all native platforms (IOS, Android)

```bash
npm run native:build:all
```

Build for IOS

```bash
npm run native:build:ios
```

Build for Android

```bash
npm run native:build:android
```
