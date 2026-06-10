/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StoryboardScene {
  so_phan_canh: number;
  thoi_luong: string;
  hanh_dong_va_bieu_cam: string;
  bieu_cam_tag: string;
  loi_thoai_vo_sfx: string;
  loi_thoai?: string; // Dialogue
  goc_quay: string;
  boi_canh: string;
  mo_ta_hinh_anh_ai_prompt: string;
  chuyen_dong_camera?: string;
  ai_video_prompt?: string;
  ma_tham_chieu_elements?: string[];
}

export interface StoryboardElementItem {
  ten: string;
  mo_ta: string;
  prompt_tao_anh: string;
  ma_tham_chieu: string;
}

export interface StoryboardCharacterItem {
  ten: string;
  mo_ta: string;
  prompt_tao_anh_2_panel: string;
  ma_tham_chieu: string;
}

export interface StoryboardElements {
  nhan_vat: StoryboardCharacterItem[];
  boi_canh: StoryboardElementItem[];
  dao_cu: StoryboardElementItem[];
}

export interface StoryboardResponse {
  ten_video: string;
  danh_sach_phan_canh: StoryboardScene[];
  elements_phim?: StoryboardElements;
}

export interface GeneratorOptions {
  storyIdea: string;
  style: string;
  sceneCount: number;
  tone: string;
  characterConsistency?: string;
  outputLanguage: string;
  aspectRatio: string;
}

export interface SavedScript {
  id: string;
  timestamp: number;
  title: string;
  idea: string;
  style: string;
  sceneCount: number;
  characterConsistency?: string;
  data: StoryboardResponse;
  outputLanguage?: string;
  aspectRatio?: string;
}
