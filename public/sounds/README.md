# Timer Sound

Add a file named `timer-done.mp3` to this directory for the rest timer completion sound.

## Quick Options:

1. **Use a free sound effect:**
   - Visit https://freesound.org or https://mixkit.co/free-sound-effects/
   - Search for "beep", "notification", or "timer"
   - Download and rename to `timer-done.mp3`

2. **Generate programmatically:**
   Create an HTML file with this code and record the output:
   ```html
   <!DOCTYPE html>
   <html>
   <body>
   <button onclick="playBeep()">Play Beep</button>
   <script>
   function playBeep() {
     const context = new AudioContext();
     const oscillator = context.createOscillator();
     const gain = context.createGain();

     oscillator.connect(gain);
     gain.connect(context.destination);

     oscillator.frequency.value = 800;
     oscillator.type = 'sine';

     gain.gain.setValueAtTime(0.3, context.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

     oscillator.start(context.currentTime);
     oscillator.stop(context.currentTime + 0.5);
   }
   </script>
   </body>
   </html>
   ```

3. **Use system beep:**
   The app will still work without a sound file - it will just silently complete.

## Recommended Sound Characteristics:
- Duration: 0.5-1 second
- Type: Pleasant beep or chime (not harsh)
- Volume: Moderate (code sets to 50%)
- Format: MP3 (best browser support)
