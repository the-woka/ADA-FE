// Variables for the login/register toggle
const loginTitle = document.getElementById("login-title");
const registerTitle = document.getElementById("register-title");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Variables for the microphone and dropdown functionalities
let isRecording = false;
let recorder;
let audioChunks = [];
let chatCounter = 0;
const recordBtn = document.getElementById("record-btn");
const newChatBtn = document.getElementById("new-chat-btn");
const chatHistory = document.getElementById("chat-history");
const sidebar = document.getElementById("sidebar");
const hoverArea = document.getElementById("hover-area");
const profilePic = document.getElementById("profile-pic");
const dropdownMenu = document.getElementById("dropdown-menu");

let audioContext;
let analyser;
let microphone;
let scriptProcessor;

// Login/Register toggle functionality
loginTitle.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  loginTitle.classList.add("active");
  registerTitle.classList.remove("active");
});

registerTitle.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  registerTitle.classList.add("active");
  loginTitle.classList.remove("active");
});

document.getElementById("switch-to-register").addEventListener("click", (e) => {
  e.preventDefault();
  registerTitle.click();
});

document.getElementById("switch-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  loginTitle.click();
});

// Toggle dropdown visibility on profile picture click
profilePic.addEventListener("click", (e) => {
  dropdownMenu.classList.toggle("hidden");
  e.stopPropagation(); // Prevent the click from propagating to the document
});

// Close the dropdown menu when clicking outside of it
document.addEventListener("click", (e) => {
  if (
    !dropdownMenu.classList.contains("hidden") &&
    !dropdownMenu.contains(e.target) &&
    e.target !== profilePic
  ) {
    dropdownMenu.classList.add("hidden");
  }
});

// Recording functionality for the microphone
recordBtn.addEventListener("click", () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

newChatBtn.addEventListener("click", () => {
  chatCounter++;
  const chatButton = document.createElement("button");
  chatButton.className =
    "w-full py-2 px-4 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-600";
  chatButton.textContent = `Chat ${chatCounter}`;
  chatHistory.appendChild(chatButton);
});

hoverArea.addEventListener("mouseover", () => {
  sidebar.classList.add("visible");
});

sidebar.addEventListener("mouseleave", () => {
  sidebar.classList.remove("visible");
});

function startRecording() {
  audioChunks = []; // Clear previous recordings
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      scriptProcessor.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        const volume = array.reduce((a, b) => a + b) / array.length;

        // Calculate the new size based on volume
        const newSize = Math.min(120, Math.max(80, volume * 1.5)); // Limit the size between 80px and 120px
        recordBtn.style.width = `${newSize}px`;
        recordBtn.style.height = `${newSize}px`;
      };

      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/wav" });
        autoDownloadRecording(blob);
      };
      recorder.start();
      isRecording = true;
      recordBtn.innerHTML =
        '<div class="flex justify-center items-center"><i data-feather="stop-circle" class="mic-icon"></i></div>';
      feather.replace();
    })
    .catch((error) => {
      console.error("Error accessing microphone:", error);
    });
}

function stopRecording() {
  if (recorder) {
    recorder.stop();
  }
  if (audioContext) {
    audioContext.close();
  }
  isRecording = false;
  recordBtn.innerHTML =
    '<div class="flex justify-center items-center"><i data-feather="mic" class="mic-icon"></i></div>';
  recordBtn.style.width = "80px"; // Reset to original size
  recordBtn.style.height = "80px"; // Reset to original size
  feather.replace();
}

function autoDownloadRecording(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recording.wav";
  document.body.appendChild(a);
  a.style.display = "none";
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

feather.replace();
