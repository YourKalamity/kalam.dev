export interface AniState { frames: string[]; delays: number[] }

export const CURSOR_ANI: Record<'busy' | 'working', AniState> = {
  "busy": {
    "frames": [
      "/cursors/busy/0.cur",
      "/cursors/busy/1.cur",
      "/cursors/busy/2.cur",
      "/cursors/busy/3.cur",
      "/cursors/busy/4.cur",
      "/cursors/busy/5.cur",
      "/cursors/busy/6.cur",
      "/cursors/busy/7.cur",
      "/cursors/busy/8.cur",
      "/cursors/busy/9.cur",
      "/cursors/busy/10.cur",
      "/cursors/busy/11.cur",
      "/cursors/busy/12.cur",
      "/cursors/busy/13.cur",
      "/cursors/busy/14.cur",
      "/cursors/busy/15.cur",
      "/cursors/busy/16.cur",
      "/cursors/busy/17.cur"
    ],
    "delays": [
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33
    ]
  },
  "working": {
    "frames": [
      "/cursors/working/0.cur",
      "/cursors/working/1.cur",
      "/cursors/working/2.cur",
      "/cursors/working/3.cur",
      "/cursors/working/4.cur",
      "/cursors/working/5.cur",
      "/cursors/working/6.cur",
      "/cursors/working/7.cur",
      "/cursors/working/8.cur",
      "/cursors/working/9.cur",
      "/cursors/working/10.cur",
      "/cursors/working/11.cur",
      "/cursors/working/12.cur",
      "/cursors/working/13.cur",
      "/cursors/working/14.cur",
      "/cursors/working/15.cur",
      "/cursors/working/16.cur",
      "/cursors/working/17.cur"
    ],
    "delays": [
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33,
      33
    ]
  }
};
