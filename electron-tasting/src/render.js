// Buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

videoSelectBtn.onclick = getVideoSources;

const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

// Get the available video sources
async function getVideoSources() {
	const inputSources = await desktopCapturer.getSources({
		types: ['window', 'screen'],
	});

	const videoOptionsMenu = Menu.buildFromTemplate(
		inputSources.map((source) => {
			return {
				label: source.name,
				click: () => selectSource(source),
			};
		})
	);

	videoOptionsMenu.popup();
}

let mediaRecorder; // mediaRecorder instance of capture footage
const recordedChunks = [];

// Change the videoSource window to record
async function selectSource(source) {
	videoSelectBtn.innerText = source.name;

	const constraints = {
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: source.id,
			},
		},
	};

	// Create a Stream
	const stream = await navigator.mediaDevices.getUserMedia(constraints);

	// Preview the source in a video element
	videoElement.srcObject = stream;
	videoElement.play();

	// Create the Media Recorder
	const options = { MimeType: 'video/webm; codecs=vp9' };
	mediaRecorder = new MediaRecorder(stream, options);

	// Register EventHandler
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.onstop = handleStop;
}

// Capture all recorded chunks
function handleDataAvailable(e) {
	console.log('video data available');
	recordedChunks.push(e.data);
}

const { dialog } = remote;
const { writeFile } = require('fs');

// Saves the video file on stop
async function handleStop(e) {
	const blob = new Blob(recordedChunks, {
		type: 'video/webm; codecs=vp9',
	});

	const buffer = Buffer.from(await blob.arrayBuffer());

	const { filePath } = await dialog.showSaveDialog({
		buttonLabel: 'Save video',
		defaultPath: `video-${Date.now()}.webm`,
	});

	console.log(filePath);

	writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}
