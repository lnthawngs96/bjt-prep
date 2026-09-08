import { MOCK_MEDIA_BY_ID } from '@/mock/materials';
import type { MediaAsset } from '@/lib/prisma-types';

/**
 * CHỮ KÝ HÀM NÀY KHÔNG ĐƯỢC ĐỔI.
 * Giai đoạn tĩnh: r2Key là đường dẫn tương đối trong public/, URL = '/' + r2Key.
 * TODO(r2): thay ruột bằng presigned URL R2 hết hạn 10 phút, gắn với attempt
 * đang mở. Giữ nguyên chữ ký thì không component nào phải sửa.
 */
export async function getPlaybackUrl(mediaId: string): Promise<string> {
  // TODO(r2): const key = (await db.mediaAsset.findUnique({ where: { id: mediaId } }))?.r2Key
  //           return getSignedUrl(r2, new GetObjectCommand({ Bucket, Key: key }), { expiresIn: 600 })
  const media = MOCK_MEDIA_BY_ID.get(mediaId);
  if (!media) throw new Error(`Không tìm thấy media: ${mediaId}`);
  return '/' + media.r2Key;
}

export async function getMediaAsset(mediaId: string): Promise<MediaAsset | null> {
  // TODO(db): return db.mediaAsset.findUnique({ where: { id: mediaId } })
  return MOCK_MEDIA_BY_ID.get(mediaId) ?? null;
}

/** Mảng peak tính sẵn lúc upload — vẽ sóng mà không phải tải cả file audio. */
export async function getWaveform(mediaId: string): Promise<number[] | null> {
  // TODO(db): select waveform from media_asset
  const media = MOCK_MEDIA_BY_ID.get(mediaId);
  return Array.isArray(media?.waveform) ? (media.waveform as number[]) : null;
}
