export interface CaptureApi {
  takeScreenshot: () => void;
  startGifCapture: () => void;
  isCapturingGif: boolean;
}

const noop = () => {};

let api: CaptureApi = {
  takeScreenshot: noop,
  startGifCapture: noop,
  isCapturingGif: false,
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export const captureStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): CaptureApi {
    return api;
  },
  setCapture(next: CaptureApi) {
    if (api === next) return;
    api = next;
    emit();
  },
};
