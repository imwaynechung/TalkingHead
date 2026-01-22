# TalkingHead 3D Avatar Demo

An interactive web application featuring a 3D avatar with real-time lip-sync, speech synthesis, and expressive animations.

## Features

### Avatar Capabilities
- **3D Ready Player Me Avatar**: Full-body 3D character with realistic animations
- **Real-time Lip-Sync**: Synchronized mouth movements with speech
- **Text-to-Speech**: Built-in speech synthesis with customizable voice settings
- **Multiple Poses**: Standing poses including straight, side, hip, turn, wide, and sitting
- **Expressive Gestures**: Wave, thumbs up/down, OK sign, and shrug animations
- **Mood System**: Switch between neutral, happy, angry, sad, fear, and surprise expressions
- **Camera Views**: Adjustable views from full body to head closeup

### Interactive Controls
- **Quick Messages**: Pre-configured demo messages for instant playback
- **Custom Text Input**: Type any message for the avatar to speak
- **Voice Settings**: Choose from available system voices with adjustable rate, pitch, and volume
- **Playback Controls**: Pause, resume, and stop speech during playback
- **Avatar Behavior**: Adjust eye contact and head movement levels
- **Profile Management**: Save and load your favorite settings configurations

### Data Persistence
- **Supabase Integration**: All profiles are saved to a cloud database
- **Profile System**: Save multiple configurations with custom names
- **Quick Switching**: Load saved profiles instantly

## Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Internet connection (for avatar loading and Supabase)

### Installation

The application is ready to run! The development server starts automatically.

### Building for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## How to Use

### Basic Usage

1. **Wait for Avatar to Load**: The 3D avatar will appear once loading completes
2. **Try Quick Messages**: Click any of the "Hello", "Features", "About", or "Goodbye" buttons
3. **Watch the Magic**: The avatar speaks with synchronized lip movements and displays subtitles

### Custom Messages

1. Type your message in the text area
2. Click the "Speak" button
3. Use playback controls to pause, resume, or stop

### Voice Customization

- **Voice**: Select from available system voices
- **Rate**: Control speaking speed (0.5x to 2x)
- **Pitch**: Adjust voice pitch (0 to 2)
- **Volume**: Set speech volume (0 to 1)

### Avatar Control

- **Poses**: Click pose buttons to change the avatar's body position
- **Gestures**: Trigger hand animations and movements
- **Mood**: Set the avatar's facial expression
- **Camera View**: Change the framing from full body to closeup

### Avatar Behavior

- **Eye Contact**: How much the avatar looks at the camera (0-1)
- **Head Movement**: Amount of natural head motion (0-1)
- **Mute**: Disable avatar mouth animations while keeping speech

### Saving Profiles

1. Adjust all settings to your preference
2. Enter a profile name
3. Click "Save Profile"
4. Your settings are stored in the database

### Loading Profiles

1. Select a saved profile from the list
2. Click "Load"
3. All settings are restored instantly

## Technical Details

### Technologies Used

- **TalkingHead**: 3D avatar library with lip-sync
- **Three.js**: WebGL 3D graphics engine
- **Ready Player Me**: 3D avatar provider
- **Web Speech API**: Browser text-to-speech
- **Supabase**: Database and backend services
- **Vite**: Build tool and dev server

### Project Structure

```
project/
├── index.html          # Main HTML page
├── style.css          # Application styling
├── app.js             # Main application logic
├── vite.config.js     # Vite configuration
├── modules/           # TalkingHead library modules
│   ├── talkinghead.mjs
│   ├── lipsync-*.mjs
│   ├── retargeter.mjs
│   ├── dynamicbones.mjs
│   └── playback-worklet.js
└── dist/             # Production build output
```

### Database Schema

The `profiles` table stores user settings:

- `id`: Unique identifier
- `name`: Profile name
- `voice`: Selected voice index
- `rate`: Speech rate
- `pitch`: Speech pitch
- `volume`: Speech volume
- `eyeContact`: Eye contact level
- `headMove`: Head movement level
- `mute`: Mute status
- `created_at`: Creation timestamp

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires WebGL)
- Mobile: Limited support (may vary by device)

## Troubleshooting

### Avatar Won't Load
- Check internet connection
- Ensure browser supports WebGL
- Try refreshing the page

### No Speech Output
- Check system volume
- Verify browser has speech synthesis support
- Try selecting a different voice

### Profiles Won't Save
- Verify Supabase configuration
- Check browser console for errors
- Ensure database table exists

## Future Enhancements

Potential features for future development:
- Multiple avatar selection
- Custom avatar upload
- Microphone input for live lip-sync
- Animation timeline editor
- Background customization
- Lighting controls
- Screenshot/video recording

## Credits

- **TalkingHead Library**: Mika Suominen
- **Three.js**: Three.js Contributors
- **Ready Player Me**: Wolf3D
- **Supabase**: Supabase Team

## License

MIT License - See LICENSE file for details
