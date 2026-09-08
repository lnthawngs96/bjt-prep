/**
 * Sóng giả khi media chưa có mảng peak tính sẵn. Sinh bằng công thức chứ
 * không random: random thì mỗi lần render ra một hình, nhìn như đang tải lại.
 */
export const AUDIO_FALLBACK_WAVEFORM = Array.from(
  { length: 40 },
  (_, i) => 30 + ((i * 37) % 60),
);
