export default class ThreeSixtyVideoViewer {
	/*
	* Based on work ThreeSixtyVideoViewer.js
	*/
	constructor(settings) {
		this.settings = {
			selector: '#video',
			boost: 16,
			frameRate: 25,
			pixelToFrame: 1,
			...settings,
		};

		this.video = document.querySelector(this.settings.selector);
		this.video.load();

		if (this.video) {
			this.wrapVideo();

			this.seekedHandler = this.seeked.bind(this);

			this.video.addEventListener('loadeddata', this.loadeddata.bind(this));
			this.video.addEventListener('seeked', this.seekedHandler);
		}
	}

	initEventListeners() {
		this.touchMoveHandler = this.onTouchMove.bind(this);
		this.touchEndHandler = this.onTouchEnd.bind(this);
		this.touchStartHandler = this.onTouchStart.bind(this);
		this.drugingHandler = this.onDragStart.bind(this);

		this.video.addEventListener('mousedown', this.touchStartHandler);
		this.video.addEventListener('touchstart', this.touchStartHandler, { passive: true });

		this.video.addEventListener('mouseup', this.touchEndHandler);
		this.video.addEventListener('touchend', this.touchEndHandler, { passive: true });

		this.video.addEventListener('dragstart', this.drugingHandler);
	}

	onTouchStart(event) {
		this.initialX = event.pageX || event.touches[0].pageX;
		this.deltaX = 0;

		this.video.addEventListener('mousemove', this.touchMoveHandler);
		this.video.addEventListener('touchmove', this.touchMoveHandler);
		this.video.addEventListener('mouseleave', this.touchEndHandler);
		this.wrapper.classList.add('m-grabbing');
	}

	onTouchEnd() {
		this.initialX = 0;
		this.deltaX = 0;
		this.lastStep = 0;
		this.step = 0;

		this.video.removeEventListener('mousemove', this.touchMoveHandler);
		this.video.removeEventListener('touchmove', this.touchMoveHandler);
		this.video.removeEventListener('mouseleave', this.touchEndHandler);
		this.wrapper.classList.remove('m-grabbing');
	}

	loadeddata() {
		this.video.currentTime = 0;
		this.video.muted = true; // otherwise we could not start loading video without user interaction
		this.video.play();
	}

	seeked() {
		if (this.video.buffered.length === 0 || this.video.buffered.end(0) >= this.video.duration - 1) {
			this.video.removeEventListener('seeked', this.seekedHandler);
			this.video.pause();
			this.video.currentTime = 0;
			this.wrapper.classList.add('m-loaded');

			this.initialX = 0;
			this.lastStep = 0;
			this.step = 0;

			this.initEventListeners();
		} else {
			this.video.currentTime = this.video.buffered.end(0);
		}
	}

	pan() {
		const { pixelToFrame } = this.settings;
		this.step = Math.floor(this.deltaX / pixelToFrame);
	}

	panLeft() {
		const { boost, frameRate } = this.settings;

		if (this.step !== this.lastStep && !this.video.seeking) {
			this.video.currentTime -= (1 + -this.velocityX * boost) / frameRate; // eslint-disable-line
			this.lastStep = this.step;

			if (this.video.currentTime === 0) {
				this.video.currentTime = this.video.duration;
			}
		}
	}

	panRight() {
		const { boost, frameRate } = this.settings;

		if (this.step !== this.lastStep && !this.video.seeking) {
			this.video.currentTime += (1 + this.velocityX * boost) / frameRate; // eslint-disable-line
			this.lastStep = this.step;

			if (this.video.currentTime === this.video.duration) {
				this.video.currentTime = 0;
			}
		}
	}

	onTouchMove(event) {
		const eventX = event.touches !== undefined ? event.touches[0].pageX : event.clientX;

		this.deltaX = (this.initialX - eventX);

		this.calculateVelocity();
		this.pan();

		if (this.step < this.lastStep) {
			this.panLeft();
		}

		if (this.step > this.lastStep) {
			this.panRight();
		}
	}

	calculateVelocity() {
		this.velocityX = (this.step - this.lastStep) / 20;
		//const rawAcceleration = this.deltaX / 360;
		//this.velocityX = rawAcceleration < 5 ? rawAcceleration : 5;
	}

	wrapVideo() {
		this.wrapper = document.createElement('div');
		this.wrapper.className = 'c-video360';
		this.video.parentNode.insertBefore(this.wrapper, this.video);
		this.wrapper.appendChild(this.video);
	}

	onDragStart(event) { // eslint-disable-line
		event.preventDefault();
	}
}
