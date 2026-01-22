import { TalkingHead } from './modules/talkinghead.mjs';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let head = null;
let currentVoice = null;
let availableVoices = [];
let isSpeaking = false;
let isProcessing = false;

const elements = {
  avatarContainer: document.getElementById('avatar-container'),
  loading: document.getElementById('loading'),
  loadingSpinner: document.getElementById('loading-spinner'),
  loadingText: document.getElementById('loading-text'),
  errorText: document.getElementById('error-text'),
  avatarUrlInput: document.getElementById('avatar-url-input'),
  loadAvatarBtn: document.getElementById('load-avatar-btn'),
  useSampleBtn: document.getElementById('use-sample-btn'),
  subtitles: document.getElementById('subtitles'),
  customText: document.getElementById('custom-text'),
  speakBtn: document.getElementById('speak-btn'),
  pauseBtn: document.getElementById('pause-btn'),
  resumeBtn: document.getElementById('resume-btn'),
  stopBtn: document.getElementById('stop-btn'),
  voiceSelect: document.getElementById('voice-select'),
  rateSlider: document.getElementById('rate-slider'),
  rateValue: document.getElementById('rate-value'),
  pitchSlider: document.getElementById('pitch-slider'),
  pitchValue: document.getElementById('pitch-value'),
  volumeSlider: document.getElementById('volume-slider'),
  volumeValue: document.getElementById('volume-value'),
  eyeContactSlider: document.getElementById('eye-contact-slider'),
  eyeContactValue: document.getElementById('eye-contact-value'),
  headMoveSlider: document.getElementById('head-move-slider'),
  headMoveValue: document.getElementById('head-move-value'),
  muteCheckbox: document.getElementById('mute-checkbox'),
  profileName: document.getElementById('profile-name'),
  saveProfileBtn: document.getElementById('save-profile-btn'),
  profileSelect: document.getElementById('profile-select'),
  loadProfileBtn: document.getElementById('load-profile-btn'),
  deleteProfileBtn: document.getElementById('delete-profile-btn')
};

async function loadAvatar(avatarUrl) {
  try {
    document.querySelector('.avatar-url-section').style.display = 'none';
    elements.loadingSpinner.style.display = 'block';
    elements.loadingText.style.display = 'block';
    elements.loadingText.textContent = 'Initializing 3D engine...';
    elements.errorText.style.display = 'none';

    if (!head) {
      head = new TalkingHead(elements.avatarContainer, {
        ttsLang: "en-US",
        lipsyncLang: "en",
        cameraView: "full",
        cameraDistance: 0.5,
        cameraY: 0.2,
        avatarMood: "neutral",
        avatarMute: false,
        avatarIdleEyeContact: 0.5,
        avatarIdleHeadMove: 0.5,
        avatarSpeakingEyeContact: 0.5,
        avatarSpeakingHeadMove: 0.5
      });
    }

    if (!avatarUrl.includes('?')) {
      avatarUrl += '?morphTargets=ARKit';
    } else if (!avatarUrl.includes('morphTargets')) {
      avatarUrl += '&morphTargets=ARKit';
    }

    elements.loadingText.textContent = 'Loading avatar model...';

    await head.showAvatar({
      url: avatarUrl,
      body: 'F',
      avatarMood: 'neutral',
      lipsyncLang: 'en'
    }, (ev) => {
      const progress = ev.lengthComputable ? Math.round((ev.loaded / ev.total) * 100) : 0;
      if (progress > 0) {
        elements.loadingText.textContent = `Loading avatar... ${progress}%`;
      }
    });

    elements.loading.classList.add('hidden');
    console.log('Avatar loaded successfully');

    localStorage.setItem('lastAvatarUrl', avatarUrl);

  } catch (error) {
    console.error('Error loading avatar:', error);
    elements.loadingSpinner.style.display = 'none';
    elements.loadingText.style.display = 'none';
    elements.errorText.style.display = 'block';
    elements.errorText.textContent = `Error: ${error.message}. Please check the URL and try again.`;
    document.querySelector('.avatar-url-section').style.display = 'block';
  }
}

function loadVoices() {
  availableVoices = speechSynthesis.getVoices();

  if (availableVoices.length === 0) {
    console.warn('No voices available yet, will retry...');
    return;
  }

  elements.voiceSelect.innerHTML = '';

  availableVoices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    elements.voiceSelect.appendChild(option);

    if (voice.lang.startsWith('en') && !currentVoice) {
      currentVoice = voice;
      elements.voiceSelect.value = index;
    }
  });

  if (!currentVoice && availableVoices.length > 0) {
    currentVoice = availableVoices[0];
    elements.voiceSelect.value = 0;
  }

  console.log(`Loaded ${availableVoices.length} voices`);
}

function speak(text) {
  if (!text.trim()) return;
  if (!head) {
    alert('Please load an avatar first!');
    return;
  }

  if (isProcessing) {
    console.log('Already processing speech, please wait...');
    return;
  }

  if (availableVoices.length === 0) {
    loadVoices();
  }

  isProcessing = true;

  speechSynthesis.cancel();

  if (head) {
    head.stopSpeaking();
  }

  setTimeout(() => {
    isProcessing = false;
  }, 200);

  try {
    isSpeaking = true;
    updatePlaybackButtons();
    elements.subtitles.textContent = text;

    const selectedVoice = currentVoice || availableVoices[elements.voiceSelect.value];

    if (!elements.muteCheckbox.checked) {
      const utterance = new SpeechSynthesisUtterance(text);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = parseFloat(elements.rateSlider.value);
      utterance.pitch = parseFloat(elements.pitchSlider.value);
      utterance.volume = parseFloat(elements.volumeSlider.value);

      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        isSpeaking = false;
        elements.subtitles.textContent = '';
        updatePlaybackButtons();
      };

      utterance.onerror = (error) => {
        if (error.error === 'interrupted' || error.error === 'canceled') {
          isSpeaking = false;
          elements.subtitles.textContent = '';
          updatePlaybackButtons();
          return;
        }

        console.error('Speech synthesis error:', error.error || error.message || 'Unknown error');
        console.log('Attempting speech without specific voice...');

        const fallbackUtterance = new SpeechSynthesisUtterance(text);
        fallbackUtterance.rate = utterance.rate;
        fallbackUtterance.pitch = utterance.pitch;
        fallbackUtterance.volume = utterance.volume;
        fallbackUtterance.onend = utterance.onend;
        fallbackUtterance.onerror = (fallbackError) => {
          if (fallbackError.error !== 'interrupted' && fallbackError.error !== 'canceled') {
            console.error('Fallback speech also failed:', fallbackError.error);
          }
          isSpeaking = false;
          elements.subtitles.textContent = '';
          updatePlaybackButtons();
        };
        setTimeout(() => speechSynthesis.speak(fallbackUtterance), 50);
      };

      setTimeout(() => {
        try {
          speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Failed to speak:', e);
          isSpeaking = false;
          updatePlaybackButtons();
        }
      }, 50);
    } else {
      setTimeout(() => {
        isSpeaking = false;
        elements.subtitles.textContent = '';
        updatePlaybackButtons();
      }, text.length * 100);
    }

    head.speakText(text, {
      lipsyncLang: 'en',
      avatarMute: false
    }, (textNode) => {
      if (textNode && textNode.textContent) {
        elements.subtitles.textContent = textNode.textContent;
      }
    });

  } catch (error) {
    console.error('Error in speak function:', error);
    isSpeaking = false;
    elements.subtitles.textContent = '';
    updatePlaybackButtons();
  }
}

function updatePlaybackButtons() {
  elements.pauseBtn.disabled = !isSpeaking;
  elements.resumeBtn.disabled = !isSpeaking;
  elements.stopBtn.disabled = !isSpeaking;
  elements.speakBtn.disabled = isSpeaking;
}

async function setPose(poseName) {
  if (!head) return;
  try {
    const poseTemplate = head.poseTemplates[poseName];
    if (poseTemplate) {
      head.setPoseFromTemplate(poseTemplate, 2000);
    } else {
      console.warn(`Pose '${poseName}' not found`);
    }
  } catch (error) {
    console.error('Error setting pose:', error);
  }
}

async function playGesture(gestureName) {
  if (!head) return;
  try {
    await head.playGesture(gestureName);
  } catch (error) {
    console.error('Error playing gesture:', error);
  }
}

async function setMood(moodName) {
  if (!head) return;
  try {
    await head.setMood(moodName);
  } catch (error) {
    console.error('Error setting mood:', error);
  }
}

async function setCameraView(viewName) {
  if (!head) return;
  try {
    head.setView(viewName);
  } catch (error) {
    console.error('Error setting camera view:', error);
  }
}

async function saveProfile() {
  const profileName = elements.profileName.value.trim();
  if (!profileName) {
    alert('Please enter a profile name');
    return;
  }

  const profile = {
    name: profileName,
    voice: elements.voiceSelect.value,
    rate: elements.rateSlider.value,
    pitch: elements.pitchSlider.value,
    volume: elements.volumeSlider.value,
    eyeContact: elements.eyeContactSlider.value,
    headMove: elements.headMoveSlider.value,
    mute: elements.muteCheckbox.checked,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile]);

    if (error) throw error;

    alert('Profile saved successfully!');
    elements.profileName.value = '';
    loadProfiles();
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to save profile. Make sure the database table exists.');
  }
}

async function loadProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    elements.profileSelect.innerHTML = '';
    data.forEach(profile => {
      const option = document.createElement('option');
      option.value = JSON.stringify(profile);
      option.textContent = profile.name;
      elements.profileSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading profiles:', error);
  }
}

async function loadSelectedProfile() {
  const selected = elements.profileSelect.value;
  if (!selected) return;

  try {
    const profile = JSON.parse(selected);

    elements.voiceSelect.value = profile.voice;
    elements.rateSlider.value = profile.rate;
    elements.rateValue.textContent = profile.rate;
    elements.pitchSlider.value = profile.pitch;
    elements.pitchValue.textContent = profile.pitch;
    elements.volumeSlider.value = profile.volume;
    elements.volumeValue.textContent = profile.volume;
    elements.eyeContactSlider.value = profile.eyeContact;
    elements.eyeContactValue.textContent = profile.eyeContact;
    elements.headMoveSlider.value = profile.headMove;
    elements.headMoveValue.textContent = profile.headMove;
    elements.muteCheckbox.checked = profile.mute;

    currentVoice = availableVoices[profile.voice];

    if (head) {
      head.opt.avatarSpeakingEyeContact = parseFloat(profile.eyeContact);
      head.opt.avatarSpeakingHeadMove = parseFloat(profile.headMove);
      head.opt.avatarMute = profile.mute;
    }

    alert('Profile loaded successfully!');
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

async function deleteSelectedProfile() {
  const selected = elements.profileSelect.value;
  if (!selected) return;

  if (!confirm('Are you sure you want to delete this profile?')) return;

  try {
    const profile = JSON.parse(selected);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('name', profile.name)
      .eq('created_at', profile.created_at);

    if (error) throw error;

    alert('Profile deleted successfully!');
    loadProfiles();
  } catch (error) {
    console.error('Error deleting profile:', error);
    alert('Failed to delete profile.');
  }
}

speechSynthesis.addEventListener('voiceschanged', loadVoices);
loadVoices();

document.querySelectorAll('[data-message]').forEach(btn => {
  btn.addEventListener('click', () => {
    const message = btn.getAttribute('data-message');
    speak(message);
  });
});

elements.speakBtn.addEventListener('click', () => {
  speak(elements.customText.value);
});

elements.pauseBtn.addEventListener('click', () => {
  speechSynthesis.pause();
  if (head) {
    head.pauseSpeaking();
  }
});

elements.resumeBtn.addEventListener('click', () => {
  speechSynthesis.resume();
  if (head) {
    head.resumeSpeaking();
  }
});

elements.stopBtn.addEventListener('click', () => {
  speechSynthesis.cancel();
  if (head) {
    head.stopSpeaking();
  }
  isSpeaking = false;
  elements.subtitles.textContent = '';
  updatePlaybackButtons();
});

elements.voiceSelect.addEventListener('change', () => {
  currentVoice = availableVoices[elements.voiceSelect.value];
});

elements.rateSlider.addEventListener('input', (e) => {
  elements.rateValue.textContent = e.target.value;
});

elements.pitchSlider.addEventListener('input', (e) => {
  elements.pitchValue.textContent = e.target.value;
});

elements.volumeSlider.addEventListener('input', (e) => {
  elements.volumeValue.textContent = e.target.value;
});

elements.eyeContactSlider.addEventListener('input', (e) => {
  elements.eyeContactValue.textContent = e.target.value;
  if (head) {
    head.opt.avatarSpeakingEyeContact = parseFloat(e.target.value);
    head.opt.avatarIdleEyeContact = parseFloat(e.target.value);
  }
});

elements.headMoveSlider.addEventListener('input', (e) => {
  elements.headMoveValue.textContent = e.target.value;
  if (head) {
    head.opt.avatarSpeakingHeadMove = parseFloat(e.target.value);
    head.opt.avatarIdleHeadMove = parseFloat(e.target.value);
  }
});

elements.muteCheckbox.addEventListener('change', (e) => {
  if (head) {
    head.opt.avatarMute = e.target.checked;
  }
});

document.querySelectorAll('[data-pose]').forEach(btn => {
  btn.addEventListener('click', () => {
    const pose = btn.getAttribute('data-pose');
    setPose(pose);
  });
});

document.querySelectorAll('[data-gesture]').forEach(btn => {
  btn.addEventListener('click', () => {
    const gesture = btn.getAttribute('data-gesture');
    playGesture(gesture);
  });
});

document.querySelectorAll('[data-mood]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mood = btn.getAttribute('data-mood');
    setMood(mood);
  });
});

document.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.getAttribute('data-view');
    setCameraView(view);
  });
});

elements.saveProfileBtn.addEventListener('click', saveProfile);
elements.loadProfileBtn.addEventListener('click', loadSelectedProfile);
elements.deleteProfileBtn.addEventListener('click', deleteSelectedProfile);

elements.loadAvatarBtn.addEventListener('click', () => {
  const url = elements.avatarUrlInput.value.trim();
  if (!url) {
    elements.errorText.style.display = 'block';
    elements.errorText.textContent = 'Please enter an avatar URL';
    return;
  }
  if (!url.startsWith('https://models.readyplayer.me/')) {
    elements.errorText.style.display = 'block';
    elements.errorText.textContent = 'Please enter a valid Ready Player Me URL';
    return;
  }
  loadAvatar(url);
});

elements.useSampleBtn.addEventListener('click', () => {
  const sampleUrl = 'https://models.readyplayer.me/65d95c869a2b0bfcf8cf7af3.glb';
  loadAvatar(sampleUrl);
});

elements.avatarUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    elements.loadAvatarBtn.click();
  }
});

const lastAvatarUrl = localStorage.getItem('lastAvatarUrl');
if (lastAvatarUrl) {
  elements.avatarUrlInput.value = lastAvatarUrl;
  const urlSection = document.querySelector('.avatar-url-section');
  const autoLoadMsg = document.createElement('p');
  autoLoadMsg.style.color = '#667eea';
  autoLoadMsg.style.fontWeight = '600';
  autoLoadMsg.style.marginTop = '15px';
  autoLoadMsg.textContent = 'Your last avatar URL has been loaded. Click "Load Avatar" to use it again.';
  urlSection.appendChild(autoLoadMsg);
}

loadProfiles();
