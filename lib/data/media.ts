import * as mock from './sources/mock/media';
import * as dbSource from './sources/db/media';
import { USE_DB } from './source';

/**
 * API công khai của tầng truy xuất media. Chữ ký getPlaybackUrl KHÔNG đổi
 * khi lên R2 — chỉ ruột của sources/db/media.ts đổi.
 */
const src: typeof mock = USE_DB ? dbSource : mock;

export const { getPlaybackUrl, getMediaAsset, getWaveform } = src;
