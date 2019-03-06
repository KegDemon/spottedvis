import {
  AudioAnalysisInterface,
  Pitch,
  PreCalcPitch,
  Segment
} from '../interfaces';

class WebWorkerService {
  public register(): Worker | void {
    if (!('Worker' in window)) return void 0;

    const blobUrl = URL.createObjectURL(
      new Blob([`(${this.worker.toString()})()`], {
        type: 'application/javascript'
      })
    );

    const worker = new Worker(blobUrl);

    URL.revokeObjectURL(blobUrl);

    return worker;
  }

  private worker(): void {
    let maxValue = 0;
    let curveValues: Array<number> = [];

    const _createCurveValues = (): Array<number> => {
      const rangeCollection = [];
      const d = 1.025 * Math.pow(maxValue, 0.1);

      for (let i = 0; i < 10; ++i) {
        rangeCollection.push(Math.pow(d, i) - 0.75);
      }

      return rangeCollection;
    };

    const _getMax = (segments: Array<Segment>): number => {
      let ret = 0;

      for (let i = 0, ii = segments.length; i < ii; ++i) {
        const max = Math.max(...segments[i].timbre.map(t => Math.abs(t)));

        ret = ret < max ? max : ret;
      }

      return ret;
    };

    const _getPeakValue = (val: number): number => {
      for (let i = 10; i > 0; --i) {
        if (val > curveValues[i - 1]) {
          return i;
        }
      }

      return 0;
    };

    const _parseData = ({ segments }: AudioAnalysisInterface): Array<Pitch> => {
      maxValue = _getMax(segments);
      curveValues = _createCurveValues();

      return segments.map(val => ({
        d: val.pitches
          .map((curr, i) => ({
            p: curr,
            t: _getPeakValue(Math.abs(val.timbre[i]))
          }))
          .sort((a: PreCalcPitch, b: PreCalcPitch) => a.p - b.p)
          .map((val: PreCalcPitch) => val.t),
        s: val.start,
        t: +(val.duration * 1000).toFixed(3)
      }));
    };

    const audioAnalysis = (url: string, token: string): void => {
      if (!url || !token) return;

      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((data: Response) => data.json())
        .then((data: AudioAnalysisInterface) => {
          const returnData = { type: 'analysis', data: _parseData(data) };

          self.postMessage(returnData, [
            new ArrayBuffer(JSON.stringify(returnData).length * 8)
          ] as any);

          returnData.data.length = 0;
          curveValues.length = 0;
        })
        .catch(e => {
          console.error({ error: e });
        });
    };

    const messageHandler = ({ data }: MessageEvent) => {
      switch (data.type) {
        case 'analysis':
          audioAnalysis(data.url, data.token);
          break;
      }
    };

    self.addEventListener('message', messageHandler, false);
  }
}

export { WebWorkerService };
