import { db } from '@/lib/db';
import type { MediaAsset } from '@/lib/prisma-types';

/**
 * CHỮ KÝ HÀM NÀY KHÔNG ĐƯỢC ĐỔI.
 * Hiện tại: r2Key là đường dẫn tương đối trong public/, URL = '/' + r2Key.
 * TODO(r2): thay ruột bằng presigned URL R2 hết hạn 10 phút:
 *   return getSignedUrl(r2, new GetObjectCommand({ Bucket, Key: media.r2Key }), { expiresIn: 600 })
 */
export async function getPlaybackUrl(mediaId: string): Promise<string> {
  const media = await db.mediaAsset.findUnique({ where: { id: mediaId }, select: { r2Key: true } });
  if (!media) throw new Error(`Không tìm thấy media: ${mediaId}`);
  return '/' + media.r2Key;
}

export async function getMediaAsset(mediaId: string): Promise<MediaAsset | null> {
  return db.mediaAsset.findUnique({ where: { id: mediaId } });
}

/** Mảng peak tính sẵn lúc upload — vẽ sóng mà không phải tải cả file audio. */
export async function getWaveform(mediaId: string): Promise<number[] | null> {
  const media = await db.mediaAsset.findUnique({ where: { id: mediaId }, select: { waveform: true } });
  return Array.isArray(media?.waveform) ? (media.waveform as number[]) : null;
}
