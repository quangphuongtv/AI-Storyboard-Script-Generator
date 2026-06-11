/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Film, Sparkles, Copy, Check, MapPin, Settings,
  Video, Eye, EyeOff, Volume2, Download, RefreshCcw, RotateCcw, History, Trash2,
  Play, FileText, Code, CheckCircle2, ChevronRight, Image as ImageIcon,
  HelpCircle, AlertCircle, Loader2, List, Clipboard, Layers, Upload
} from 'lucide-react';
import { StoryboardResponse, StoryboardScene, SavedScript, GeneratorOptions } from './types';

// ----------------- SAFE LOCAL STORAGE HELPERS -----------------
// These helpers isolate the application from throwing security or sandboxing exceptions
// if localStorage is blocked by iframe constraints in AI Studio.
const safeGetItem = (key: string): string => {
  try {
    return localStorage.getItem(key) || "";
  } catch (e) {
    console.warn("localStorage.getItem is blocked or failed:", key, e);
    return "";
  }
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage.setItem is blocked or failed:", key, e);
  }
};

const safeRemoveItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("localStorage.removeItem is blocked or failed:", key, e);
  }
};
// ----------------------------------------------------------------

// Danh sách các kịch bản mẫu thú vị để người dùng bấm chọn nhanh
const EXAMPLES = [
  {
    title: "Truyền thuyết Thánh Gióng",
    description: "Đứa trẻ Phù Đổng vươn vai dẹp giặc",
    idea: "Đứa trẻ ba tuổi ở làng Phù Đổng bấy lâu không biết nói cười, bỗng nghe tiếng sứ giả truyền lời vua kêu gọi người hiền dẹp giặc Ân cứu nước thì liền nói được. Đứa trẻ lớn nhanh như thổi, vươn vai biến thành một tráng sĩ khổng lồ, mặc giáp sắt, cầm roi sắt, cưỡi ngựa sắt phun lửa xông trận dẹp tan quân giặc rồi bay về trời."
  },
  {
    title: "Sự tích bánh chưng bánh giầy",
    description: "Lang Liêu và lễ vật dâng vua cha",
    idea: "Hoàng tử Lang Liêu nghèo khó, được thần tiên mách bảo trong giấc mơ, đã dùng những hạt gạo nếp dẻo thơm, đậu xanh và thịt heo để tạo nên hai loại bánh: Bánh chưng hình vuông tượng trưng cho Đất, Bánh giầy hình tròn tượng trưng cho Trời để dâng lên vua cha nhân dịp đầu xuân."
  },
  {
    title: "Phi hành gia cô độc Kepler",
    description: "Tín hiệu cổ đại Kepler-186f",
    idea: "Hành trình của một phi hành gia cô đơn trên hành tinh đóng băng Kepler-186f hoang vu. Bất ngờ, anh tìm thấy một tháp tín hiệu bằng pha lê cổ đại chìm dưới lớp băng mỏng đang phát ra nguồn năng lượng lấp lánh và bản nhạc cổ điển vang vào vũ trụ."
  },
  {
    title: "Hồ Gươm: Hoàn gươm thần",
    description: "Lê Lợi gặp rùa vàng bên hồ"
  , idea: "Sau khi đánh đuổi giặc Minh, vua Lê Lợi dạo chơi bằng thuyền trên hồ Tả Vọng. Đột nhiên một cụ Rùa Vàng khổng lồ nổi lên, cất tiếng yêu cầu vua trả lại thanh gươm Thuận Thiên mà Long Vương đã cho mượn đánh giặc. Nhà vua tháo gươm dâng lên, Rùa ngậm gươm và lặn sâu xuống đáy hồ lấp lánh hào quang."
  }
];

const STYLES = [
  { id: "Cinematic Landscape Epic", label: "Điện ảnh Sử thi (Epic)", icon: "🎬" },
  { id: "Pixar 3D Animation", label: "Hoạt hình Pixar 3D", icon: "🧸" },
  { id: "Cinematic Realism", label: "Điện ảnh Cinematic", icon: "🎥" },
  { id: "Hyper Realistic Photo", label: "Tả thực Realistic", icon: "📷" },
  { id: "Neon Cyberpunk Noir", label: "Tương lai Cyberpunk", icon: "🌐" },
  { id: "Studio Ghibli Anime", label: "Anime Màu Nước Ghibli", icon: "🎨" },
  { id: "Dark Fantasy Mythic", label: "Ảo mộng u tối (Dark Fantasy)", icon: "👹" },
  { id: "Historical Document", label: "Tài liệu lịch sử chân thực", icon: "📜" },
  { id: "Sci-Fi Space Opera", label: "Viễn tưởng Vũ trụ (Sci-Fi)", icon: "🚀" }
];

const TONES = [
  { id: "Epic Orchestral", label: "Hùng hồn, kịch tính, hoành tráng" },
  { id: "Warm Poetic", label: "Sâu lắng, ấm áp, đậm chất thơ" },
  { id: "Atmospheric Ambient", label: "Bí ẩn, u ám, trầm buồn" },
  { id: "Natural Soundscape Only", label: "Tự nhiên, không thoại, tả tả thực" }
];

const SCENE_COUNTS = [
  { value: 0, label: "AUTO (Tự động)" },
  { value: 3, label: "3 Cảnh" },
  { value: 5, label: "5 Cảnh" },
  { value: 8, label: "8 Cảnh" },
  { value: 12, label: "12 Cảnh" }
];

const LANGUAGES = [
  { id: "Tiếng Việt", label: "Tiếng Việt" },
  { id: "Tiếng Anh", label: "Tiếng Anh (English)" },
  { id: "Tiếng Trung", label: "Tiếng Trung (Chinese)" },
  { id: "Tiếng Nhật", label: "Tiếng Nhật (Japanese)" },
  { id: "Tiếng Pháp", label: "Tiếng Pháp (French)" }
];

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 (Ngang)", cls: "aspect-[16/9]" },
  { id: "9:16", label: "9:16 (Dọc)", cls: "aspect-[9/16]" },
  { id: "1:1", label: "1:1 (Vuông)", cls: "aspect-[1/1]" }
];

const LOADING_STEPS = [
  "Đang tiếp nhận ý tưởng cốt truyện...",
  "Đang khởi chạy mạng thần kinh Gemini...",
  "Phác thảo cấu trúc phân cảnh chi tiết...",
  "Biên soạn hành động vật lý & biểu cảm nhân vật...",
  "Dịch thuật ngữ cinematic góc máy sang tiếng Việt...",
  "Kiến tạo lời thoại thuyết minh VO & hiệu ứng âm thanh SFX...",
  "Tinh lọc từ khóa tả thực Image Prompt điện ảnh tiếng Anh...",
  "Sắp xếp timeline thời gian phân cảnh chuẩn chỉ..."
];

export default function App() {
  const [sessionOptions, setSessionOptions] = useState<GeneratorOptions>({
    storyIdea: "",
    style: "Cinematic Landscape Epic",
    sceneCount: 0,
    tone: "Epic Orchestral",
    characterConsistency: "",
    outputLanguage: "Tiếng Việt",
    aspectRatio: "16:9"
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const [currentScript, setCurrentScript] = useState<StoryboardResponse | null>(null);
  const [history, setHistory] = useState<SavedScript[]>([]);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Trạng thái sinh hình ảnh demo của từng phân cảnh
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({});

  // Trạng thái sinh hình ảnh cho các yếu tố chính (Elements)
  const [elementImages, setElementImages] = useState<Record<string, string>>({});
  const [generatingElements, setGeneratingElements] = useState<Record<string, boolean>>({});
  const [copiedElementKey, setCopiedElementKey] = useState<string | null>(null);
  
  // Trạng thái sao chép prompt
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Trạng thái cấu hình API Key cá nhân
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return safeGetItem("gemini_custom_api_key");
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const apiPopoverRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Monitor scroll for header visual transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (apiPopoverRef.current && !apiPopoverRef.current.contains(event.target as Node)) {
        setShowKeyInput(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveApiKey = (key: string) => {
    let sanitized = key.trim();
    if ((sanitized.startsWith('"') && sanitized.endsWith('"')) || (sanitized.startsWith("'") && sanitized.endsWith("'"))) {
      sanitized = sanitized.slice(1, -1).trim();
    }
    setCustomApiKey(sanitized);
    safeSetItem("gemini_custom_api_key", sanitized);
  };

  const handleResetStoryboard = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSessionOptions({
      storyIdea: "",
      style: "Cinematic Landscape Epic",
      sceneCount: 0,
      tone: "Epic Orchestral",
      characterConsistency: "",
      outputLanguage: "Tiếng Việt",
      aspectRatio: "16:9"
    });
    setLoading(false);
    setLoadingStepIndex(0);
    setError(null);
    setCurrentScript(null);
    setExpandedImage(null);
    setImageError(null);
    setGeneratingImages({});
    setSceneImages({});
    setElementImages({});
    setGeneratingElements({});
    setCopiedElementKey(null);
    setCopiedSceneIndex(null);
    setCopiedScript(false);
    setCopiedJson(false);
  };

  // Auto-switch loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Listen for Escape key to close expanded image
  useEffect(() => {
    if (!expandedImage) return;
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        setExpandedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedImage]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = safeGetItem("aistudio_storyboard_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (newScript: StoryboardResponse, idea: string, opts: GeneratorOptions) => {
    try {
      const item: SavedScript = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        title: newScript.ten_video || "Kịch bản chưa đặt tên",
        idea,
        style: opts.style,
        sceneCount: opts.sceneCount,
        characterConsistency: opts.characterConsistency,
        data: newScript,
        outputLanguage: opts.outputLanguage,
        aspectRatio: opts.aspectRatio
      };
      const updated = [item, ...history].slice(0, 15); // limit to 15 items
      setHistory(updated);
      safeSetItem("aistudio_storyboard_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Save to history failed", e);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    safeSetItem("aistudio_storyboard_history", JSON.stringify(updated));
  };

  // Submit idea to API /api/generate-storyboard
  const handleGenerateScript = async () => {
    if (!sessionOptions.storyIdea.trim()) {
      setError("Vui lòng nhập ý tưởng video hoặc chọn kịch bản mẫu trước khi tiếp tục.");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setLoadingStepIndex(0);
    setError(null);
    setCurrentScript(null);
    setSceneImages({}); // Reset images for new gen
    setElementImages({}); // Reset element images

    try {
      const response = await fetch("/api/generate-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sessionOptions, customApiKey }),
        signal: controller.signal
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gặp sự cố không mong muốn từ hệ thống.");
      }

      setCurrentScript(data);
      saveToHistory(data, sessionOptions.storyIdea, sessionOptions);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("Kịch bản generation bị hủy bởi người dùng.");
        return;
      }
      console.error(err);
      setError(err.message || "Không thể khởi tạo kịch bản kịch tính từ AI. Vui lòng kiểm tra phím API.");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  };

  // Request demo image for a scene
  const handleGenerateDemoImage = async (sceneNo: number, prompt: string) => {
    if (generatingImages[sceneNo]) return;

    // Collect reference images matching the scene's ma_tham_chieu_elements
    const referenceImages: Array<{ code: string; dataUrl: string }> = [];
    if (currentScript && currentScript.elements_phim) {
      const scene = currentScript.danh_sach_phan_canh.find(s => s.so_phan_canh === sceneNo);
      if (scene && scene.ma_tham_chieu_elements && scene.ma_tham_chieu_elements.length > 0) {
        scene.ma_tham_chieu_elements.forEach(code => {
          if (elementImages[code]) {
            referenceImages.push({ code, dataUrl: elementImages[code] });
          }
        });
      }
    }

    setGeneratingImages(prev => ({ ...prev, [sceneNo]: true }));
    try {
      const response = await fetch("/api/generate-demo-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, referenceImages, customApiKey, aspectRatio: sessionOptions.aspectRatio })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Không thể phác họa ảnh bối cảnh.");
      }

      setSceneImages(prev => ({ ...prev, [sceneNo]: data.imageUrl }));
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || "Gặp lỗi không hợp lệ khi sinh ảnh.");
    } finally {
      setGeneratingImages(prev => ({ ...prev, [sceneNo]: false }));
    }
  };

  // Request image for a main element using its unique key/ref code
  const handleGenerateElementImage = async (key: string, prompt: string) => {
    if (generatingElements[key]) return;

    setGeneratingElements(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch("/api/generate-demo-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, customApiKey, aspectRatio: sessionOptions.aspectRatio })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Không thể phác họa ảnh yếu tố này.");
      }

      setElementImages(prev => ({ ...prev, [key]: data.imageUrl }));
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || "Gặp lỗi không hợp lệ khi sinh ảnh yếu tố.");
    } finally {
      setGeneratingElements(prev => ({ ...prev, [key]: false }));
    }
  };

  const downloadElementImage = (key: string, title: string) => {
    const imgUrl = elementImages[key];
    if (!imgUrl) return;

    const displayType = key.toUpperCase();
    const cleanTitle = sanitizeFilename(title);
    const filename = `${displayType}_${cleanTitle}.png`;

    if (imgUrl.startsWith('data:')) {
      const link = document.createElement("a");
      link.href = imgUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      fetch(imgUrl)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
          console.error("Lỗi khi tải ảnh yếu tố trực tiếp:", err);
          const link = document.createElement("a");
          link.href = imgUrl;
          link.target = "_blank";
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    }
  };

  // Clipboard copies
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSceneIndex(index);
    setTimeout(() => setCopiedSceneIndex(null), 2000);
  };

  const copyElementPromptToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedElementKey(type);
    setTimeout(() => setCopiedElementKey(null), 2000);
  };

  const copyFullMarkdown = () => {
    if (!currentScript) return;

    let md = `# Kịch Bản Phân Cảnh: ${currentScript.ten_video}\n\n`;
    md += `**Ý tưởng ban đầu:** ${sessionOptions.storyIdea}\n`;
    md += `**Phong cách:** ${sessionOptions.style}\n`;
    md += `**Tông giọng:** ${sessionOptions.tone}\n`;
    md += `**Số phân cảnh:** ${currentScript.danh_sach_phan_canh.length} phân cảnh\n\n`;

    if (currentScript.elements_phim) {
      md += `## CÁC YẾU TỐ CHÍNH (FILM ELEMENTS)\n\n`;
      
      const nv = currentScript.elements_phim.nhan_vat;
      md += `### 👤 Nhân vật: ${nv.ten} [Mã: ${nv.ma_tham_chieu || ""}]\n`;
      md += `- **Mô tả:** ${nv.mo_ta}\n`;
      md += `- **AI Prompt tạo ảnh (2-Panel Character Sheet):**\n  \`\`\`\n  ${nv.prompt_tao_anh_2_panel}\n  \`\`\`\n\n`;

      const bc = currentScript.elements_phim.boi_canh;
      md += `### 📍 Bối cảnh chủ đạo: ${bc.ten} [Mã: ${bc.ma_tham_chieu || ""}]\n`;
      md += `- **Mô tả bối cảnh:** ${bc.mo_ta}\n`;
      md += `- **AI Prompt vẽ bối cảnh:**\n  \`\`\`\n  ${bc.prompt_tao_anh}\n  \`\`\`\n\n`;

      const dc = currentScript.elements_phim.dao_cu;
      md += `### 🗡️ Đạo cụ biểu tượng: ${dc.ten} [Mã: ${dc.ma_tham_chieu || ""}]\n`;
      md += `- **Mô tả đạo cụ:** ${dc.mo_ta}\n`;
      md += `- **AI Prompt vẽ đạo cụ:**\n  \`\`\`\n  ${dc.prompt_tao_anh}\n  \`\`\`\n\n`;
    }

    md += `---\n\n`;

    currentScript.danh_sach_phan_canh.forEach((scene) => {
      md += `## Phân cảnh ${scene.so_phan_canh} (${scene.thoi_luong})\n`;
      md += `- **Bối cảnh:** ${scene.boi_canh}\n`;
      if (scene.ma_tham_chieu_elements && scene.ma_tham_chieu_elements.length > 0) {
        md += `- **Yếu tố tham gia:** ${scene.ma_tham_chieu_elements.join(', ')}\n`;
      }
      md += `- **Góc quay:** ${scene.goc_quay}\n`;
      if (scene.chuyen_dong_camera) {
        md += `- **Chuyển động camera:** ${scene.chuyen_dong_camera}\n`;
      }
      md += `- **Biểu cảm chủ đạo:** ${scene.bieu_cam_tag}\n`;
      md += `- **Hành động & Diễn biến:** ${scene.hanh_dong_va_bieu_cam}\n`;
      md += `- **Lời thoại / VO / SFX:**\n  > ${scene.loi_thoai_vo_sfx}\n`;
      md += `- **Mô tả hình ảnh AI Prompt:**\n  \`\`\`\n  ${scene.mo_ta_hinh_anh_ai_prompt}\n  \`\`\`\n`;
      if (scene.ai_video_prompt) {
        md += `- **Prompt chuyển động tạo video (AI Video Prompt):**\n  \`\`\`\n  ${scene.ai_video_prompt}\n  \`\`\`\n`;
      }
      md += `\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Export files & custom sanitization
  const sanitizeFilename = (title: string): string => {
    if (!title) return "Kich ban";
    let normalized = title;
    normalized = normalized.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    normalized = normalized.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    normalized = normalized.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    normalized = normalized.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    normalized = normalized.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    normalized = normalized.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    normalized = normalized.replace(/đ/g, "d");
    
    normalized = normalized.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    normalized = normalized.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    normalized = normalized.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    normalized = normalized.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    normalized = normalized.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    normalized = normalized.replace(/Ỳ|Ý|Y|Ỷ|Ỹ/g, "Y");
    normalized = normalized.replace(/Đ/g, "D");
    
    // Normalize and strip out remaining combined acoustic components
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Keep alphanumeric, spaces, dashes and underscores
    const chars = Array.from(normalized);
    const allowed = chars.map(c => {
      if (/[a-zA-Z0-9 ]/.test(c)) {
        return c;
      }
      if (c === '-' || c === '_') return c;
      return '';
    }).join('');

    return allowed.replace(/\s+/g, ' ').trim();
  };

  const downloadSceneImage = (sceneNo: number) => {
    const imgUrl = sceneImages[sceneNo];
    if (!imgUrl) return;

    const formattedNo = sceneNo.toString().padStart(2, '0');
    const filename = `Scene ${formattedNo}.png`;

    if (imgUrl.startsWith('data:')) {
      const link = document.createElement("a");
      link.href = imgUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      fetch(imgUrl)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
          console.error("Lỗi khi tải ảnh trực tiếp:", err);
          const link = document.createElement("a");
          link.href = imgUrl;
          link.target = "_blank";
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    }
  };

  const downloadMarkdownFile = () => {
    if (!currentScript) return;
    
    let md = `# Kịch Bản Phân Cảnh: ${currentScript.ten_video}\n\n`;
    md += `**Ý tưởng ban đầu:** ${sessionOptions.storyIdea}\n`;
    md += `**Phong cách:** ${sessionOptions.style}\n`;
    md += `**Tông giọng:** ${sessionOptions.tone}\n`;
    md += `**Thời điểm tạo:** ${new Date().toLocaleString('vi-VN')}\n\n`;

    if (currentScript.elements_phim) {
      md += `## CÁC YẾU TỐ CHÍNH (FILM ELEMENTS)\n\n`;
      
      const nv = currentScript.elements_phim.nhan_vat;
      md += `### 👤 Nhân vật: ${nv.ten} [Mã: ${nv.ma_tham_chieu || ""}]\n`;
      md += `- **Mô tả:** ${nv.mo_ta}\n`;
      md += `- **AI Prompt tạo ảnh (2-Panel Character Sheet):**\n  \`\`\`\n  ${nv.prompt_tao_anh_2_panel}\n  \`\`\`\n\n`;

      const bc = currentScript.elements_phim.boi_canh;
      md += `### 📍 Bối cảnh chủ đạo: ${bc.ten} [Mã: ${bc.ma_tham_chieu || ""}]\n`;
      md += `- **Mô tả bối cảnh:** ${bc.mo_ta}\n`;
      md += `- **AI Prompt vẽ bối cảnh:**\n  \`\`\`\n  ${bc.prompt_tao_anh}\n  \`\`\`\n\n`;

      const dc = currentScript.elements_phim.dao_cu;
      md += `### 🗡️ Đạo cụ biểu tượng: ${dc.ten} [Mã: ${dc.ma_tham_chieu || ""}]\n`;
      md += `- **Mô tả đạo cụ:** ${dc.mo_ta}\n`;
      md += `- **AI Prompt vẽ đạo cụ:**\n  \`\`\`\n  ${dc.prompt_tao_anh}\n  \`\`\`\n\n`;
    }

    md += `---\n\n`;

    currentScript.danh_sach_phan_canh.forEach((scene) => {
      md += `## PHÂN CẢNH ${scene.so_phan_canh} [Thời lượng: ${scene.thoi_luong}]\n\n`;
      md += `* **Bối cảnh:** ${scene.boi_canh}\n`;
      if (scene.ma_tham_chieu_elements && scene.ma_tham_chieu_elements.length > 0) {
        md += `* **Yếu tố tham gia:** ${scene.ma_tham_chieu_elements.join(', ')}\n`;
      }
      md += `* **Góc máy:** ${scene.goc_quay}\n`;
      if (scene.chuyen_dong_camera) {
        md += `* **Chuyển động camera:** ${scene.chuyen_dong_camera}\n`;
      }
      md += `* **Biểu cảm chủ đạo:** ${scene.bieu_cam_tag}\n\n`;
      md += `### Mô tả hành động & Biểu lộ nhân vật:\n`;
      md += `${scene.hanh_dong_va_bieu_cam}\n\n`;
      md += `### Thuyết minh & Âm thanh (VO / SFX):\n`;
      md += `> ${scene.loi_thoai_vo_sfx}\n\n`;
      md += `### AI Image Prompt (Midjourney/Kling):\n`;
      md += `\`\`\`text\n${scene.mo_ta_hinh_anh_ai_prompt}\n\`\`\`\n\n`;
      if (scene.ai_video_prompt) {
        md += `### AI Video Prompt (Runway/Sora/Luma/Kling):\n`;
        md += `\`\`\`text\n${scene.ai_video_prompt}\n\`\`\`\n\n`;
      }
      md += `* * * * * * * * * * * * * * * * * * * * * * *\n\n`;
    });

    const filename = sanitizeFilename(currentScript.ten_video);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyFullJson = () => {
    if (!currentScript) return;
    navigator.clipboard.writeText(JSON.stringify(currentScript, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const downloadJsonFile = () => {
    if (!currentScript) return;
    const jsonStr = JSON.stringify(currentScript, null, 2);
    const filename = sanitizeFilename(currentScript.ten_video);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadRecoveryJsonFile = () => {
    if (!currentScript) return;
    const recoveryPayload = {
      type: "storyboard_recovery_pack",
      version: "1.0",
      sessionOptions,
      currentScript,
      sceneImages,
      elementImages
    };
    const jsonStr = JSON.stringify(recoveryPayload, null, 2);
    const filename = sanitizeFilename(`Kịch_bản_${currentScript.ten_video}_recovery`);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadStoryboardJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const payload = JSON.parse(text);

        if (payload && payload.type === "storyboard_recovery_pack") {
          setError(null);
          if (payload.sessionOptions) {
            setSessionOptions(payload.sessionOptions);
          }
          if (payload.currentScript) {
            setCurrentScript(payload.currentScript);
          }
          if (payload.sceneImages) {
            setSceneImages(payload.sceneImages);
          }
          if (payload.elementImages) {
            setElementImages(payload.elementImages);
          }
        } else if (payload && (payload.ten_video || payload.danh_sach_phan_canh)) {
          setError(null);
          setCurrentScript(payload);
          setSessionOptions(prev => ({
            ...prev,
            storyIdea: prev.storyIdea || payload.ten_video || ""
          }));
          setSceneImages({});
          setElementImages({});
        } else {
          setError("Tệp JSON tải lên không đúng định dạng phục hồi hoặc kịch bản phân cảnh.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Đã xảy ra lỗi khi đọc tệp JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-[#333333] text-slate-200 flex flex-col font-sans overflow-x-hidden">
      
      {/* HEADER BAR */}
      <header className={`h-14 border-b transition-all duration-300 ease-in-out flex items-center justify-between px-6 shrink-0 sticky top-0 z-[100] ${
        isScrolled 
          ? "bg-[#101012]/92 backdrop-blur-lg border-neutral-800 shadow-2xl shadow-black/70" 
          : "border-[#2e2e33] bg-[#1a1a1c]/95 backdrop-blur-md shadow-xl shadow-black/30"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-black font-bold text-sm">AI</div>
          <div>
            <h1 className="text-[18.2px] font-black tracking-wider uppercase flex items-center gap-2">
              <span className="title-glow-flow">TRÌNH BIÊN DỊCH PHÂN CẢNH AI</span>
              <span className="text-[10px] font-mono font-bold tracking-tight bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.2 rounded uppercase">Studio Mode</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative" ref={apiPopoverRef}>
          {/* NÚT NHẬP API KEY */}
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer relative z-40 select-none ${
              customApiKey
                ? "bg-emerald-950/40 text-emerald-500 hover:bg-emerald-950/60 border border-emerald-500/20"
                : "bg-red-600 hover:bg-red-500 text-white animate-pulse border border-red-500 shadow-md shadow-red-600/10"
            }`}
          >
            <Settings className={`w-3.5 h-3.5 ${!customApiKey ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span>{customApiKey ? "API Key: Đã Nhập" : "Nhập API Key"}</span>
            {customApiKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
          </button>

          {/* POPOVER DIALOG CHỈNH SỬA KEY */}
          {showKeyInput && (
            <div className="absolute right-0 top-10 w-72 bg-[#202020] border border-[#333] p-4 rounded-xl shadow-2xl z-50 text-left space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Cấu hình API Key (Gemini)</span>
                <span className="text-[9px] font-mono text-slate-400">client-side lock</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Sau khi nhập, chìa khóa này sẽ được mã hóa lưu cục bộ trong trình duyệt của bạn để chạy phân tích kịch bản và vẽ bối cảnh từ Gemini.
              </p>
              <div className="space-y-1 relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={customApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  placeholder="Nhập Gemini API Key của bạn..."
                  className="w-full bg-black border border-[#333] rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showSecret ? "Ẩn khóa bí mật" : "Hiển thị khóa bí mật"}
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                {customApiKey ? (
                  <button
                    onClick={() => {
                      handleSaveApiKey("");
                    }}
                    className="text-red-400 hover:underline hover:text-red-300 transition-colors font-semibold"
                  >
                    Xóa API Key
                  </button>
                ) : (
                  <span className="text-red-400 font-mono italic">Chưa có API key</span>
                )}
                
                <button
                  onClick={() => setShowKeyInput(false)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded text-[10px] transition-colors"
                >
                  Xong
                </button>
              </div>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex gap-2 text-[10px] uppercase font-bold text-slate-500">
              <span 
                onClick={currentScript ? downloadJsonFile : undefined}
                className={`px-2 py-1 bg-[#222] rounded transition-all select-none ${
                  currentScript 
                    ? "text-[#4dabf7] border border-[#4dabf7]/30 bg-[#4dabf7]/5 hover:bg-[#4dabf7]/20 cursor-pointer active:scale-95" 
                    : "text-slate-500"
                }`}
                title={currentScript ? "Bấm để tải nhanh tệp JSON kịch bản" : "JSON Engine Sẵn Sàng"}
              >
                {currentScript ? "⬇ Tải JSON Kịch Bản" : "JSON Export Active"}
              </span>

              <span className={`px-2 py-1 border rounded ${
                customApiKey 
                  ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' 
                  : 'border-slate-800 text-slate-500 bg-[#222]/40'
              }`}>
                {customApiKey ? "● Custom API Active" : "● Connected to Gemini"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full px-4 md:px-6 py-4 flex flex-col lg:flex-row items-stretch gap-4 transition-all duration-300">
        
        {/* LEFT COLUMN: CONTROL PANEL */}
        <div className="w-full lg:w-[38%] xl:w-[32%] flex flex-col gap-4 shrink-0 transition-all duration-300">
          
          {/* TRÌNH NHẬP LIỆU Ý TƯỞNG */}
          <div className="bg-[#202020] border border-[#333] rounded-xl p-4 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-amber-500 h-full"></div>
            
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1. Ý tưởng cốt truyện thô</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono font-medium">VIETNAMESE</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Nhập bối cảnh, câu chuyện mộc mạc để AI cấu trúc thành phân cảnh điện ảnh chi tiết.
            </p>

            <textarea
              className="w-full h-32 bg-black border border-[#222] rounded-lg p-3 text-xs leading-relaxed text-slate-200 placeholder-slate-600 font-sans focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all custom-scrollbar resize-none"
              placeholder="Ví dụ: Sự tích Sơn Tinh Thuỷ Tinh đánh nhau tranh giành Mỵ Nương, Thủy Tinh dâng bão táp, Sơn Tinh dâng cao núi đồi dẹp giặc nước..."
              value={sessionOptions.storyIdea}
              onChange={(e) => setSessionOptions(prev => ({ ...prev, storyIdea: e.target.value }))}
            />

            {/* INTUITIVE RECOVERY ENGINE: LOAD STORYBOARD */}
            <div className="pt-1 pb-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLoadStoryboardJson}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-[#1C1C1F] hover:bg-[#111] border border-[#222] hover:border-amber-500/30 text-amber-500 hover:text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer group"
                title="Chọn tệp JSON phục hồi (.JSON) để tải lại toàn bộ tiến độ, tham số và hình ảnh"
              >
                <Upload className="w-3.5 h-3.5 text-amber-500 group-hover:-translate-y-0.5 transition-transform duration-300" />
                <span>Load Kịch bản (.JSON)</span>
              </button>
            </div>

            {/* QUICK EXAMPLES ROW */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <span>💡 Chọn nhanh kịch bản mẫu:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setSessionOptions(prev => ({ ...prev, storyIdea: ex.idea }))}
                    className="text-left p-2.5 bg-[#1C1C1F] border border-[#222]/80 rounded-lg hover:border-amber-500/30 hover:bg-[#202024] transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-slate-300 group-hover:text-amber-500 transition-colors">{ex.title}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{ex.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* THAM SỐ CẤU HÌNH KỊCH BẢN */}
          <div className="bg-[#202020] border border-[#333] rounded-xl p-4 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-amber-500 h-full"></div>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-amber-500" />
              <span>2. Cấu hình phân cảnh điện ảnh</span>
            </h3>

            {/* STYLES SELECTOR */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Phong cách hình ảnh & Không khí:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSessionOptions(prev => ({ ...prev, style: st.id }))}
                    className={`p-2 px-2.5 text-left rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      sessionOptions.style === st.id 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md' 
                        : 'bg-black/40 border-[#222] text-slate-400 hover:border-slate-700 hover:bg-[#1C1C1F]'
                    }`}
                  >
                    <span className="text-sm">{st.icon}</span>
                    <span className="truncate font-medium text-[11px]">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SCENE TONES SELECTOR */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tông nền thuyết minh & Nhạc nền:</label>
              <div className="relative">
                <select
                  value={sessionOptions.tone}
                  onChange={(e) => setSessionOptions(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full bg-black border border-[#222] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none font-sans"
                >
                  {TONES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
            </div>

            {/* SCENE COUNTS */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số lượng phân cảnh:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {SCENE_COUNTS.map((block) => (
                  <button
                    key={block.value}
                    onClick={() => setSessionOptions(prev => ({ ...prev, sceneCount: block.value }))}
                    className={`py-1.5 px-1 text-center rounded-lg border text-[10px] transition-all flex flex-col items-center justify-center cursor-pointer ${
                      sessionOptions.sceneCount === block.value 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold' 
                        : 'bg-black/40 border-[#222] text-slate-500 hover:border-slate-700 hover:bg-[#1C1C1F]'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{block.value === 0 ? "AUTO" : block.value}</span>
                    <span className="text-[8px] text-slate-500 font-medium font-sans uppercase tracking-tight">{block.value === 0 ? "Tự động" : "Cảnh"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OUTPUT LANGUAGE SELECTOR */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngôn ngữ đầu ra (Output Language):</label>
              <div className="relative">
                <select
                  value={sessionOptions.outputLanguage || "Tiếng Việt"}
                  onChange={(e) => setSessionOptions(prev => ({ ...prev, outputLanguage: e.target.value }))}
                  className="w-full bg-black border border-[#222] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none font-sans"
                >
                  {LANGUAGES.map(langOpt => (
                    <option key={langOpt.id} value={langOpt.id}>{langOpt.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
            </div>

            {/* ASPECT RATIO SELECTOR */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tỷ lệ khung hình (Aspect Ratio):</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratioOpt) => (
                  <button
                    key={ratioOpt.id}
                    onClick={() => setSessionOptions(prev => ({ ...prev, aspectRatio: ratioOpt.id }))}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all flex flex-col items-center justify-center cursor-pointer ${
                      sessionOptions.aspectRatio === ratioOpt.id 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold' 
                        : 'bg-black/40 border-[#222] text-slate-500 hover:border-slate-700 hover:bg-[#1C1C1F]'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{ratioOpt.id}</span>
                    <span className="text-[10px] text-slate-500 font-medium font-sans uppercase tracking-tight">{ratioOpt.label.split(' ')[1] || ""}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* ĐỒNG NHẤT NHÂN VẬT (CHARACTER consistency) */}
            <div className="space-y-2 bg-[#1C1C1F] p-3 rounded-lg border border-[#222]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. Đồng nhất nhân vật chủ đạo</span>
                </label>
                <span className="text-[8px] font-mono text-amber-500 font-bold bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20 uppercase tracking-wider">AI Synced</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                Nhập đặc điểm mô tả chi tiết ngoại hình nhân vật chính để AI gài vào tất cả bối cảnh vẽ minh họa độc lập (như trang phục, gương mặt, màu sắc, phụ kiện,...):
              </p>
              <textarea
                className="w-full h-16 bg-black border border-[#2A2A2E] rounded-md p-2 text-xs leading-normal text-slate-200 placeholder-slate-600 font-sans focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
                placeholder="Ví dụ: Một tráng sĩ dũng mãnh, tóc đen cài ngọc, mặc thiết giáp bạc lấp lánh phản chiếu ánh lửa cổ xưa..."
                value={sessionOptions.characterConsistency || ""}
                onChange={(e) => setSessionOptions(prev => ({ ...prev, characterConsistency: e.target.value }))}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleGenerateScript}
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-wider rounded-lg shadow-md uppercase text-xs transition-all flex items-center justify-center gap-1.5 select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Xử lý kịch bản...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Phân tích kịch bản AI ⚡</span>
                </>
              )}
            </button>

            {/* RESET STORYBOARD BUTTON */}
            <button
              type="button"
              onClick={handleResetStoryboard}
              disabled={!(loading || currentScript !== null)}
              className="w-full py-2 bg-[#1C1C1F] hover:bg-black border border-[#333] hover:border-red-500/30 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-2 group"
              title={loading ? "Dừng tiến trình hiện tại và khởi tạo lại hệ thống" : "Khởi tạo lại toàn bộ hệ thống về trạng thái ban đầu"}
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400 group-hover:-rotate-180 transition-transform duration-500" />
              <span>{loading ? "Dừng & Reset" : "Reset Storyboard"}</span>
            </button>
          </div>

          {/* LỊCH SỬ KỊCH BẢN */}
          {history.length > 0 && (
            <div className="bg-[#202020] border border-[#333] rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-slate-100">
                <h4 className="font-display font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kịch bản đã tạo ({history.length})</span>
                </h4>
                <button
                  onClick={() => {
                    if (confirm("Xóa toàn bộ lịch sử kịch bản?")) {
                      setHistory([]);
                      safeRemoveItem("aistudio_storyboard_history");
                    }
                  }}
                  className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa sạch</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      setCurrentScript(h.data);
                      setSessionOptions({
                        storyIdea: h.idea,
                        style: h.style,
                        sceneCount: h.sceneCount,
                        tone: sessionOptions.tone,
                        characterConsistency: h.characterConsistency || "",
                        outputLanguage: h.outputLanguage || "Tiếng Việt",
                        aspectRatio: h.aspectRatio || "16:9"
                      });
                      setSceneImages({});
                      setElementImages({});
                    }}
                    className={`p-2 bg-[#1C1C1F] hover:bg-[#202024] border rounded-lg flex items-center justify-between group transition-all cursor-pointer ${
                      currentScript?.ten_video === h.title ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#222]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-500 transition-colors">
                        {h.title}
                      </div>
                      <div className="text-[9px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                        <span>{h.sceneCount} SEGMENTS</span>
                        <span>•</span>
                        <span>{h.style.split(' ').pop()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteHistoryItem(h.id, e)}
                      className="p-1 text-slate-600 hover:text-rose-400 hover:bg-white/5 rounded cursor-pointer"
                      title="Xóa kịch bản"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: MAIN PREVIEW CONTENT */}
        <div className="w-full lg:flex-1 flex flex-col min-h-[500px] transition-all duration-300">
          
          <AnimatePresence mode="wait">
            
            {/* 1. STATE: LOADING SCREEN */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 bg-[#202020] border border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-lg"
              >
                <div className="relative w-20 h-20">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                  {/* Inner slower reverse ring */}
                  <div className="absolute inset-1.5 rounded-full border-2 border-slate-700/30 border-b-amber-500/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                  {/* Central flashing icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-amber-500 animate-pulse">
                    <Film className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-2 max-w-md">
                  <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Đang khởi tạo bối cảnh kịch bản...</h4>
                  <p className="text-[11px] text-amber-500 leading-relaxed font-mono min-h-[2.5rem] flex items-center justify-center bg-black/40 border border-[#222] px-3 py-1.5 rounded">
                    🎨 {LOADING_STEPS[loadingStepIndex]}
                  </p>
                </div>

                <div className="w-full max-w-xs bg-black rounded-full h-1 overflow-hidden p-[1px] border border-[#222]">
                  <motion.div
                    className="bg-amber-500 h-full rounded-full"
                    initial={{ width: "5%" }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 15, ease: "easeInOut" }}
                  />
                </div>

                <p className="text-[9px] text-slate-500 font-mono italic">Kịch bản phân tách cấu trúc sâu có thể mất khoảng 5-15 giây để xử lý chuyên sâu.</p>
              </motion.div>
            )}

            {/* 2. STATE: SYSTEM ERROR SCREEN */}
            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 bg-[#202020] border border-red-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="p-2 bg-red-950/40 text-red-400 border border-red-500/30 rounded-full">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-400">Xảy ra lỗi cấu hình hệ thống</h4>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">{error}</p>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed max-w-md mt-2 font-mono text-justify bg-black p-3 rounded border border-[#222]">
                  Đảm bảo bạn đã cấu hình <code className="font-mono bg-[#1C1C1F] px-1 py-0.5 rounded text-amber-500">GEMINI_API_KEY</code> trong bảng <strong className="text-slate-300">Settings &gt; Secrets</strong> trên giao diện của AI Studio.
                </div>
                <button
                  onClick={handleGenerateScript}
                  className="px-4 py-2 bg-red-[#1C1C1F] hover:bg-[#202024] text-red-400 border border-red-500/30 text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Gửi lại yêu cầu</span>
                </button>
              </motion.div>
            )}

            {/* 3. STATE: EMPTY LAYOUT (INTRO) */}
            {!currentScript && !loading && !error && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 bg-[#202020] border border-[#333] border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="w-12 h-12 bg-black border border-[#222] rounded-lg flex items-center justify-center text-slate-500">
                  <Film className="w-6 h-6 opacity-60" />
                </div>
                
                <div className="space-y-1.5 max-w-lg">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Chưa có kịch bản phân cảnh</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nhập ý tưởng video mộc của bạn vào ô bên trái hoặc lựa chọn một trong những mẫu có sẵn để kích hoạt bộ xử lý kịch bản sử thi từ Gemini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl w-full pt-2">
                  <div className="p-3 bg-black/40 rounded-lg border border-[#222]">
                    <div className="text-amber-500 font-bold font-mono text-[10px] uppercase tracking-wider">01. Cấu trúc chuẩn</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Khung hình phân cảnh tuần tự với thông số góc quay bối cảnh cụ thể.</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-[#222]">
                    <div className="text-amber-500 font-bold font-mono text-[10px] uppercase tracking-wider">02. Thuyết minh & SFX</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Nội dung thoại tiếng Việt và hiệu ứng âm thanh môi trường chuẩn chỉ.</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-[#222]">
                    <div className="text-amber-500 font-bold font-mono text-[10px] uppercase tracking-wider">03. AI Image Prompt</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Prompt thiết kế tinh lọc bằng tiếng Anh giúp sinh ảnh minh họa siêu đẹp.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. STATE: PREVIEW GENERATED RESULTS */}
            {currentScript && !loading && !error && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="flex-1 space-y-4"
              >
                
                {/* MOUNTED HEADER CARD */}
                <div className="bg-[#202020] border border-[#333] rounded-xl p-4 shadow-md relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-bold font-mono uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                        {sessionOptions.style.split(' ').pop() || "Sử thi"}
                      </span>
                      <span className="text-[9px] font-bold font-mono uppercase tracking-wider bg-zinc-800 text-slate-300 border border-[#222] px-2 py-0.5 rounded">
                        🎬 {currentScript.danh_sach_phan_canh.length} phân cảnh
                      </span>
                    </div>

                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                      {currentScript.ten_video}
                    </h2>

                    <p className="text-xs text-slate-400 leading-relaxed italic bg-black p-3 rounded-lg border border-[#222]">
                      &ldquo;{sessionOptions.storyIdea}&rdquo;
                    </p>
                  </div>
                </div>

                {/* CÁC YẾU TỐ CHÍNH (KEY ELEMENTS) */}
                {currentScript.elements_phim && (() => {
                  const characters = Array.isArray(currentScript.elements_phim.nhan_vat) 
                    ? currentScript.elements_phim.nhan_vat 
                    : (currentScript.elements_phim.nhan_vat ? [currentScript.elements_phim.nhan_vat] : []);

                  const locations = Array.isArray(currentScript.elements_phim.boi_canh) 
                    ? currentScript.elements_phim.boi_canh 
                    : (currentScript.elements_phim.boi_canh ? [currentScript.elements_phim.boi_canh] : []);

                  const props = Array.isArray(currentScript.elements_phim.dao_cu) 
                    ? currentScript.elements_phim.dao_cu 
                    : (currentScript.elements_phim.dao_cu ? [currentScript.elements_phim.dao_cu] : []);

                  const totalCharacters = characters.length;
                  const totalLocations = locations.length;
                  const totalProps = props.length;

                  const currentRatio = ASPECT_RATIOS.find(r => r.id === sessionOptions.aspectRatio) || ASPECT_RATIOS[0];
                  const aspectClass = currentRatio.cls;

                  return (
                    <div className="bg-[#202020] border border-[#333] rounded-xl p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-[#333] pb-3 text-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-500" />
                          <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-100">
                            CÁC YẾU TỐ CHÍNH (KEY ELEMENTS)
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                            👤 {totalCharacters} Nhân vật
                          </span>
                          <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-bold">
                            📍 {totalLocations} Bối cảnh
                          </span>
                          <span className="text-[10px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded font-bold">
                            🗡️ {totalProps} Đạo cụ
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        
                        {/* CHARACTER CATEGORY COL */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-1.5 text-amber-500 border-b border-amber-500/20 pb-1.5">
                            <span className="text-xs">👤</span>
                            <span className="text-[11px] font-bold tracking-wider uppercase font-sans">
                              Danh Sách Nhân Vật ({totalCharacters})
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
                            {characters.map((nv, idx) => {
                              const itemKey = nv.ma_tham_chieu || `nhan_vat_${idx}`;
                              return (
                                <div key={itemKey} className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500"></div>
                                  
                                  <div className="space-y-1.5">
                                    <div className="text-xs font-bold text-slate-100 flex items-center flex-wrap gap-1.5">
                                      <span>{idx + 1}. {nv.ten}</span>
                                      {nv.ma_tham_chieu && (
                                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 font-mono text-[9px] rounded border border-amber-500/20">
                                          {nv.ma_tham_chieu}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
                                      {nv.mo_ta}
                                    </p>
                                  </div>

                                  {/* Image for Character */}
                                  <div className="space-y-2 pt-1">
                                    <div className={`relative ${aspectClass} bg-black rounded-lg overflow-hidden border border-[#333] flex flex-col items-center justify-center text-center group`}>
                                      {elementImages[itemKey] ? (
                                        <>
                                          <img
                                            src={elementImages[itemKey]}
                                            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                                            alt={`Nhân vật ${nv.ten}`}
                                            referrerPolicy="no-referrer"
                                            onClick={() => setExpandedImage(elementImages[itemKey])}
                                          />
                                          <button
                                            onClick={() => downloadElementImage(itemKey, nv.ten)}
                                            className="absolute bottom-2 right-2 p-1 bg-black/80 hover:bg-black text-white hover:text-amber-400 border border-[#222] hover:border-amber-500/40 rounded text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all shadow-md z-10"
                                          >
                                            <Download className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Tải ảnh</span>
                                          </button>
                                        </>
                                      ) : (
                                        <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-slate-600">
                                          {generatingElements[itemKey] ? (
                                            <div className="space-y-1 flex flex-col items-center">
                                              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                              <div className="text-[8px] font-mono tracking-wider text-amber-400 animate-pulse uppercase">AI drawing...</div>
                                            </div>
                                          ) : (
                                            <>
                                              <ImageIcon className="w-6 h-6 opacity-30 mb-1" />
                                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center">Khung hình nhân vật</span>
                                              <span className="text-[8px] text-slate-500 max-w-[130px] text-center mt-0.5">2-Panel Character Sheet</span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {generatingElements[itemKey] && (
                                        <div className="absolute inset-x-0 h-0.5 bg-amber-500 shadow-lg shadow-amber-500/50 animate-[bounce_2s_infinite] top-0"></div>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleGenerateElementImage(itemKey, nv.prompt_tao_anh_2_panel || nv.prompt_tao_anh)}
                                      disabled={generatingElements[itemKey] || loading}
                                      className={`w-full py-1.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                        elementImages[itemKey]
                                          ? 'bg-zinc-800 hover:bg-zinc-700 text-slate-400 border border-[#222]'
                                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20'
                                      }`}
                                    >
                                      {generatingElements[itemKey] ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          <span>Đang vẽ...</span>
                                        </>
                                      ) : elementImages[itemKey] ? (
                                        <>
                                          <RefreshCcw className="w-3 h-3" />
                                          <span>Vẽ lại nhân vật ⚡</span>
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3" />
                                          <span>Vẽ nhân vật (2-Panel)</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Prompt for Character */}
                                  <div className="flex flex-col pt-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest block">AI Prompt (2-Panel Character Sheet)</span>
                                      <button
                                        onClick={() => copyElementPromptToClipboard(nv.prompt_tao_anh_2_panel || nv.prompt_tao_anh, itemKey)}
                                        className="text-slate-500 hover:text-white bg-black hover:bg-zinc-800 border border-[#222] p-1 px-1.5 rounded text-[8px] font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                      >
                                        {copiedElementKey === itemKey ? <span className="text-emerald-400 font-mono text-[8px]">Copied</span> : <span>Copy</span>}
                                      </button>
                                    </div>
                                    <div className="p-2 bg-black rounded-md border border-[#333] font-mono text-[9px] leading-relaxed text-green-400 select-all text-justify h-16 overflow-y-auto custom-scrollbar">
                                      {nv.prompt_tao_anh_2_panel || nv.prompt_tao_anh}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* BOI CANH CATEGORY COL */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-1.5 text-teal-400 border-b border-teal-500/20 pb-1.5">
                            <span className="text-xs">📍</span>
                            <span className="text-[11px] font-bold tracking-wider uppercase font-sans">
                              Danh Sách Bối Cảnh ({totalLocations})
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
                            {locations.map((bc, idx) => {
                              const itemKey = bc.ma_tham_chieu || `boi_canh_${idx}`;
                              return (
                                <div key={itemKey} className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-0.5 bg-teal-500"></div>
                                  
                                  <div className="space-y-1.5">
                                    <div className="text-xs font-bold text-slate-100 flex items-center flex-wrap gap-1.5">
                                      <span>{idx + 1}. {bc.ten}</span>
                                      {bc.ma_tham_chieu && (
                                        <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-400 font-mono text-[9px] rounded border border-teal-500/20">
                                          {bc.ma_tham_chieu}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
                                      {bc.mo_ta}
                                    </p>
                                  </div>

                                  {/* Image for Location */}
                                  <div className="space-y-2 pt-1">
                                    <div className={`relative ${aspectClass} bg-black rounded-lg overflow-hidden border border-[#333] flex flex-col items-center justify-center text-center group`}>
                                      {elementImages[itemKey] ? (
                                        <>
                                          <img
                                            src={elementImages[itemKey]}
                                            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                                            alt={`Bối cảnh ${bc.ten}`}
                                            referrerPolicy="no-referrer"
                                            onClick={() => setExpandedImage(elementImages[itemKey])}
                                          />
                                          <button
                                            onClick={() => downloadElementImage(itemKey, bc.ten)}
                                            className="absolute bottom-2 right-2 p-1 bg-black/80 hover:bg-black text-white hover:text-amber-400 border border-[#222] hover:border-amber-500/40 rounded text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all shadow-md z-10"
                                          >
                                            <Download className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Tải ảnh</span>
                                          </button>
                                        </>
                                      ) : (
                                        <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-slate-600">
                                          {generatingElements[itemKey] ? (
                                            <div className="space-y-1 flex flex-col items-center">
                                              <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                                              <div className="text-[8px] font-mono tracking-wider text-teal-400 animate-pulse uppercase">AI drawing...</div>
                                            </div>
                                          ) : (
                                            <>
                                              <ImageIcon className="w-6 h-6 opacity-30 mb-1" />
                                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center">Khung hình bối cảnh</span>
                                              <span className="text-[8px] text-slate-500 max-w-[130px] mt-0.5 text-center">Quang cảnh góc rộng</span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {generatingElements[itemKey] && (
                                        <div className="absolute inset-x-0 h-0.5 bg-teal-500 shadow-lg shadow-teal-500/50 animate-[bounce_2s_infinite] top-0"></div>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleGenerateElementImage(itemKey, bc.prompt_tao_anh)}
                                      disabled={generatingElements[itemKey] || loading}
                                      className={`w-full py-1.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                        elementImages[itemKey]
                                          ? 'bg-zinc-800 hover:bg-zinc-700 text-slate-400 border border-[#222]'
                                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20'
                                      }`}
                                    >
                                      {generatingElements[itemKey] ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          <span>Đang vẽ...</span>
                                        </>
                                      ) : elementImages[itemKey] ? (
                                        <>
                                          <RefreshCcw className="w-3 h-3" />
                                          <span>Vẽ lại bối cảnh ⚡</span>
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3" />
                                          <span>Vẽ bối cảnh</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Prompt for Location */}
                                  <div className="flex flex-col pt-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[9px] font-bold text-teal-400/80 uppercase tracking-widest block">AI Prompt (Location Landscape)</span>
                                      <button
                                        onClick={() => copyElementPromptToClipboard(bc.prompt_tao_anh, itemKey)}
                                        className="text-slate-500 hover:text-white bg-black hover:bg-zinc-800 border border-[#222] p-1 px-1.5 rounded text-[8px] font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                      >
                                        {copiedElementKey === itemKey ? <span className="text-emerald-400 font-mono text-[8px]">Copied</span> : <span>Copy</span>}
                                      </button>
                                    </div>
                                    <div className="p-2 bg-black rounded-md border border-[#333] font-mono text-[9px] leading-relaxed text-green-400 select-all text-justify h-16 overflow-y-auto custom-scrollbar">
                                      {bc.prompt_tao_anh}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* DAO CU CATEGORY COL */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-1.5 text-violet-400 border-b border-violet-500/20 pb-1.5">
                            <span className="text-xs">🗡️</span>
                            <span className="text-[11px] font-bold tracking-wider uppercase font-sans">
                              Danh Sách Đạo Cụ ({totalProps})
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
                            {props.map((dc, idx) => {
                              const itemKey = dc.ma_tham_chieu || `dao_cu_${idx}`;
                              return (
                                <div key={itemKey} className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-0.5 bg-violet-500"></div>
                                  
                                  <div className="space-y-1.5">
                                    <div className="text-xs font-bold text-slate-100 flex items-center flex-wrap gap-1.5">
                                      <span>{idx + 1}. {dc.ten}</span>
                                      {dc.ma_tham_chieu && (
                                        <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 font-mono text-[9px] rounded border border-violet-500/20">
                                          {dc.ma_tham_chieu}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
                                      {dc.mo_ta}
                                    </p>
                                  </div>

                                  {/* Image for Prop */}
                                  <div className="space-y-2 pt-1">
                                    <div className={`relative ${aspectClass} bg-black rounded-lg overflow-hidden border border-[#333] flex flex-col items-center justify-center text-center group`}>
                                      {elementImages[itemKey] ? (
                                        <>
                                          <img
                                            src={elementImages[itemKey]}
                                            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                                            alt={`Đạo cụ ${dc.ten}`}
                                            referrerPolicy="no-referrer"
                                            onClick={() => setExpandedImage(elementImages[itemKey])}
                                          />
                                          <button
                                            onClick={() => downloadElementImage(itemKey, dc.ten)}
                                            className="absolute bottom-2 right-2 p-1 bg-black/80 hover:bg-black text-white hover:text-amber-400 border border-[#222] hover:border-amber-500/40 rounded text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all shadow-md z-10"
                                          >
                                            <Download className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Tải ảnh</span>
                                          </button>
                                        </>
                                      ) : (
                                        <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-slate-600">
                                          {generatingElements[itemKey] ? (
                                            <div className="space-y-1 flex flex-col items-center">
                                              <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                                              <div className="text-[8px] font-mono tracking-wider text-violet-400 animate-pulse uppercase">AI drawing...</div>
                                            </div>
                                          ) : (
                                            <>
                                              <ImageIcon className="w-6 h-6 opacity-30 mb-1" />
                                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center">Khung hình đạo cụ</span>
                                              <span className="text-[8px] text-slate-500 max-w-[130px] mt-0.5 text-center">Vật thể đơn lẻ biệt lập</span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {generatingElements[itemKey] && (
                                        <div className="absolute inset-x-0 h-0.5 bg-violet-500 shadow-lg shadow-violet-500/50 animate-[bounce_2s_infinite] top-0"></div>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleGenerateElementImage(itemKey, dc.prompt_tao_anh)}
                                      disabled={generatingElements[itemKey] || loading}
                                      className={`w-full py-1.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                        elementImages[itemKey]
                                          ? 'bg-zinc-800 hover:bg-zinc-700 text-slate-400 border border-[#222]'
                                          : 'bg-violet-500/10 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20'
                                      }`}
                                    >
                                      {generatingElements[itemKey] ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          <span>Đang vẽ...</span>
                                        </>
                                      ) : elementImages[itemKey] ? (
                                        <>
                                          <RefreshCcw className="w-3 h-3" />
                                          <span>Vẽ lại đạo cụ ⚡</span>
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3" />
                                          <span>Vẽ đạo cụ</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Prompt for Prop */}
                                  <div className="flex flex-col pt-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[9px] font-bold text-violet-400/80 uppercase tracking-widest block font-sans">AI Prompt (Prop Solo Item)</span>
                                      <button
                                        onClick={() => copyElementPromptToClipboard(dc.prompt_tao_anh, itemKey)}
                                        className="text-slate-500 hover:text-white bg-black hover:bg-zinc-800 border border-[#222] p-1 px-1.5 rounded text-[8px] font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                      >
                                        {copiedElementKey === itemKey ? <span className="text-emerald-400 font-mono text-[8px]">Copied</span> : <span>Copy</span>}
                                      </button>
                                    </div>
                                    <div className="p-2 bg-black rounded-md border border-[#333] font-mono text-[9px] leading-relaxed text-green-400 select-all text-justify h-16 overflow-y-auto custom-scrollbar">
                                      {dc.prompt_tao_anh}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* TIMELINE OF SCENES */}
                <div className="space-y-4">
                  {currentScript.danh_sach_phan_canh.map((scene, idx) => {
                    const hasImage = !!sceneImages[scene.so_phan_canh];
                    const isGeneratingImg = !!generatingImages[scene.so_phan_canh];

                    return (
                      <div
                        id={`scene-container-${scene.so_phan_canh}`}
                        key={scene.so_phan_canh}
                        className="bg-[#202020] border border-[#333] rounded-xl overflow-hidden shadow-md"
                      >
                        
                        {/* SCENE HEADER BAR */}
                        <div className="bg-[#18181B] border-b border-[#222] p-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">
                              SCENE {scene.so_phan_canh.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Duration: {scene.thoi_luong}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* MOOD TAG */}
                            <span className="inline-block px-2.5 py-0.5 bg-red-950/40 text-red-400 border border-red-500/20 rounded-full text-[9px] font-semibold uppercase">
                              {scene.bieu_cam_tag}
                            </span>
                          </div>
                        </div>

                        {/* SCENE CONTENT GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
                          
                          {/* STORYBOARD IMAGE FRAME GENERATOR */}
                          <div className="md:col-span-4 flex flex-col justify-between gap-2.5">
                            
                            {/* RENDER IMAGE PLACEHOLDER OR Base64 */}
                            <div className={`relative ${ASPECT_RATIOS.find(r => r.id === sessionOptions.aspectRatio)?.cls || "aspect-video"} bg-black rounded-lg overflow-hidden border border-[#333] flex flex-col items-center justify-center text-center group`}>
                              {hasImage ? (
                                <>
                                  <img
                                    src={sceneImages[scene.so_phan_canh]}
                                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                                    alt={`Mô tả phân cảnh ${scene.so_phan_canh}`}
                                    referrerPolicy="no-referrer"
                                    onClick={() => setExpandedImage(sceneImages[scene.so_phan_canh])}
                                  />
                                  {/* FLOATING ACTION OVERLAY FOR DOWNLOADING IMAGE */}
                                  <button
                                    onClick={() => downloadSceneImage(scene.so_phan_canh)}
                                    className="absolute bottom-2 right-2 p-1.5 px-2.5 bg-black/80 hover:bg-black text-white hover:text-amber-400 border border-[#222] hover:border-amber-500/40 rounded text-[9px] font-bold tracking-widest uppercase flex items-center gap-1 cursor-pointer transition-all shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 active:scale-95"
                                    title={`Tải ảnh mẫu Scene ${scene.so_phan_canh.toString().padStart(2, '0')}`}
                                  >
                                    <Download className="w-4 h-4 text-amber-500" />
                                    <span>Tải ảnh</span>
                                  </button>
                                </>
                              ) : (
                                <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-slate-600 group-hover:text-slate-500 transition-colors">
                                  {isGeneratingImg ? (
                                    <div className="space-y-2 flex flex-col items-center">
                                      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                      <div className="text-[9px] font-mono tracking-wider text-amber-400 animate-pulse uppercase">AI painting...</div>
                                    </div>
                                  ) : (
                                    <>
                                      <ImageIcon className="w-8 h-8 opacity-30 group-hover:scale-110 transition-transform mb-1" />
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Khung hình phân cảnh</span>
                                      <span className="text-[8px] text-slate-500 mt-0.5 max-w-[150px]">Chưa sinh ảnh phác họa</span>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {/* SCANNER OVERLAY FOR GENERATION */}
                              {isGeneratingImg && (
                                <div className="absolute inset-x-0 h-0.5 bg-amber-500 shadow-lg shadow-amber-500/50 animate-[bounce_2s_infinite] top-0"></div>
                              )}
                            </div>

                            {/* TRIGGER ART BUTTON */}
                            <button
                              onClick={() => handleGenerateDemoImage(scene.so_phan_canh, scene.mo_ta_hinh_anh_ai_prompt)}
                              disabled={isGeneratingImg || loading}
                              className={`w-full py-1.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                hasImage
                                  ? 'bg-[#1C1C1F] hover:bg-[#202024] text-slate-400 border border-[#222]'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20'
                              }`}
                            >
                              {isGeneratingImg ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Đang sinh ảnh...</span>
                                </>
                              ) : hasImage ? (
                                <>
                                  <RefreshCcw className="w-3 h-3" />
                                  <span>Vẽ lại ảnh mẫu ⚡</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  <span>Vẽ phác họa bối cảnh</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* TEXTUAL DETAILS FIELDS */}
                          <div className="md:col-span-8 space-y-3">
                            
                            {/* METADATA CHRONICLE */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              
                              {/* ENVIRONMENT */}
                              <div className="p-2 bg-[#1C1C1F] border border-[#2A2A2E] rounded-lg flex items-start gap-2">
                                <div className="p-1 bg-black text-amber-500 rounded text-xs shrink-0">
                                  <MapPin className="w-3 h-3" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Bối cảnh / Setting:</div>
                                  <div className="text-xs font-semibold text-slate-100 mt-0.5 truncate">{scene.boi_canh}</div>
                                </div>
                              </div>

                              {/* CAMERA ANGLE */}
                              <div className="p-2 bg-[#1C1C1F] border border-[#2A2A2E] rounded-lg flex items-start gap-2">
                                <div className="p-1 bg-black text-amber-500 rounded text-xs shrink-0">
                                  <Video className="w-3 h-3" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Góc quay / Camera Angle:</div>
                                  <div className="text-xs font-semibold text-slate-100 mt-0.5 truncate" title={scene.goc_quay}>{scene.goc_quay}</div>
                                </div>
                              </div>

                              {/* CAMERA MOVEMENT */}
                              <div className="p-2 bg-[#1C1C1F] border border-[#2A2A2E] rounded-lg flex items-start gap-2">
                                <div className="p-1 bg-black text-amber-500 rounded text-xs shrink-0">
                                  <Play className="w-3 h-3" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Chuyển động / Camera:</div>
                                  <div className="text-xs font-semibold text-slate-100 mt-0.5 truncate" title={scene.chuyen_dong_camera || "Camera tĩnh hoặc mặc định"}>
                                    {scene.chuyen_dong_camera || "Camera tĩnh / Mặc định"}
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* PARTICIPATING ELEMENTS REFERENCES */}
                            {scene.ma_tham_chieu_elements && scene.ma_tham_chieu_elements.length > 0 && currentScript.elements_phim && (
                              <div className="p-2.5 bg-[#171719] border border-[#2A2A2E] rounded-lg">
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-sans mb-1.5">
                                  Yếu tố tham gia trong cảnh (Film Elements & Reference Codes):
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {scene.ma_tham_chieu_elements.map((code, idx) => {
                                    let elementLabel = code;
                                    let colorClass = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                                    let refImgUrl = "";
                                    
                                    const characters = Array.isArray(currentScript.elements_phim!.nhan_vat) 
                                      ? currentScript.elements_phim!.nhan_vat 
                                      : (currentScript.elements_phim!.nhan_vat ? [currentScript.elements_phim!.nhan_vat] : []);

                                    const locations = Array.isArray(currentScript.elements_phim!.boi_canh) 
                                      ? currentScript.elements_phim!.boi_canh 
                                      : (currentScript.elements_phim!.boi_canh ? [currentScript.elements_phim!.boi_canh] : []);

                                    const props = Array.isArray(currentScript.elements_phim!.dao_cu) 
                                      ? currentScript.elements_phim!.dao_cu 
                                      : (currentScript.elements_phim!.dao_cu ? [currentScript.elements_phim!.dao_cu] : []);

                                    const matchNv = characters.find(item => item.ma_tham_chieu === code);
                                    const matchBc = locations.find(item => item.ma_tham_chieu === code);
                                    const matchDc = props.find(item => item.ma_tham_chieu === code);

                                    if (matchNv) {
                                      elementLabel = `👤 ${matchNv.ten} (${code})`;
                                      colorClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
                                      if (elementImages[code]) {
                                        refImgUrl = elementImages[code];
                                      }
                                    } else if (matchBc) {
                                      elementLabel = `📍 ${matchBc.ten} (${code})`;
                                      colorClass = "bg-teal-500/15 text-teal-400 border-teal-500/30";
                                      if (elementImages[code]) {
                                        refImgUrl = elementImages[code];
                                      }
                                    } else if (matchDc) {
                                      elementLabel = `🗡️ ${matchDc.ten} (${code})`;
                                      colorClass = "bg-violet-500/15 text-violet-400 border-violet-500/30";
                                      if (elementImages[code]) {
                                        refImgUrl = elementImages[code];
                                      }
                                    }

                                    return (
                                      <span key={idx} className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${colorClass}`}>
                                        {refImgUrl ? (
                                          <img 
                                            src={refImgUrl} 
                                            className="w-4 h-4 rounded-full object-cover border border-white/20 shrink-0 cursor-zoom-in hover:scale-110 transition-transform" 
                                            alt={elementLabel} 
                                            referrerPolicy="no-referrer"
                                            onClick={() => setExpandedImage(refImgUrl)}
                                            title="Xem phóng to ảnh tham chiếu"
                                          />
                                        ) : null}
                                        <span>{elementLabel}</span>
                                        {refImgUrl && (
                                          <span className="text-[9px] text-emerald-400 font-sans font-bold flex items-center gap-0.5" title="Đã liên kết ảnh làm mẫu tham chiếu">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span>Link</span>
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* ACTION EXPOSITION */}
                            <div>
                              <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1 font-sans">
                                Hành động & Biểu cảm nhân vật
                              </div>
                              <p className="p-3 bg-[#1C1C1F] rounded-lg border border-[#2A2A2E] text-xs leading-relaxed text-slate-300">
                                {scene.hanh_dong_va_bieu_cam}
                              </p>
                            </div>

                            {/* DIALOGUE & AUDIO */}
                            <div>
                              <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1 font-sans">
                                Lời thoại / VO / SFX
                              </div>
                              <div className="p-3 bg-[#1C1C1F] rounded-lg border border-[#2A2A2E] border-l-4 border-l-amber-500 text-xs">
                                <p className="text-[10px] font-mono text-amber-500 mb-1">[SFX/VO & Audio Design]</p>
                                <p className="italic text-slate-200 font-medium">&ldquo;{scene.loi_thoai_vo_sfx}&rdquo;</p>
                              </div>
                            </div>

                            {/* IMAGE GENERATION PROMPT CARD */}
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-sans">Mô tả hình ảnh - AI Image Prompt</span>
                                <button
                                  onClick={() => copyToClipboard(scene.mo_ta_hinh_anh_ai_prompt, scene.so_phan_canh)}
                                  className="text-slate-500 hover:text-white bg-black hover:bg-zinc-800 border border-[#222] p-1 px-2 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                                  title="Sao chép prompt"
                                >
                                  {copiedSceneIndex === scene.so_phan_canh ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>Copy Prompt</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="relative p-3 bg-black rounded-lg border border-[#333] font-mono text-[10px] leading-relaxed text-green-400 select-all text-justify break-words">
                                {scene.mo_ta_hinh_anh_ai_prompt}
                              </div>
                            </div>

                            {/* AI VIDEO PROMPT CARD */}
                            {scene.ai_video_prompt && (
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest block font-sans">Mô tả chuyển động - AI Video Prompt</span>
                                  <button
                                    onClick={() => copyToClipboard(scene.ai_video_prompt!, scene.so_phan_canh + 1000)}
                                    className="text-slate-500 hover:text-white bg-black hover:bg-zinc-800 border border-[#222] p-1 px-2 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                                    title="Sao chép video prompt"
                                  >
                                    {copiedSceneIndex === scene.so_phan_canh + 1000 ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-2.5 h-2.5" />
                                        <span>Copy Prompt</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="relative p-3 bg-black rounded-lg border border-[#333] font-mono text-[10px] leading-relaxed text-sky-400 select-all text-justify break-words">
                                  {scene.ai_video_prompt}
                                </div>
                              </div>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* ACTIONS BUTTONS GRID (MOVED TO BOTTOM) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#202020] border border-[#333] rounded-xl p-4 shadow-md">
                  <button
                    onClick={copyFullMarkdown}
                    className="py-2.5 px-3 bg-[#1C1C1F] hover:bg-[#202024] border border-[#222] text-slate-300 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedScript ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép kịch bản (MD)</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép kịch bản (MD)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={copyFullJson}
                    className="py-2.5 px-3 bg-[#1C1C1F] hover:bg-[#202024] border border-[#222] text-slate-300 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép kịch bản (JSON)</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5" />
                        <span>Sao chép kịch bản (JSON)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadRecoveryJsonFile}
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black rounded text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    title="Lưu kịch bản cùng toàn bộ hình ảnh và tham số để khôi phục hoặc load lại sau"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Lưu Kịch Bản (.JSON)</span>
                  </button>

                  <button
                    onClick={downloadJsonFile}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tải kịch bản (.JSON)</span>
                  </button>
                </div>

                {/* END DISCLAIMER AND ASSISTANT FOOTNOTE */}
                <div className="bg-[#202020] border border-[#333] rounded-xl p-3 flex items-center justify-between text-[10px]">
                  <div className="text-slate-500 font-medium font-sans">
                    Kịch bản phân cảnh mang tính gợi ý điện ảnh cao, bạn có thể điều chỉnh hoặc tái sinh từng bối cảnh cụ thể.
                  </div>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-amber-500 hover:underline font-bold font-sans uppercase shrink-0"
                  >
                    Cuộn lên đầu ↑
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </main>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-[#202020] border-t border-[#333] px-4 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex gap-4">
          <span>MODE: STORYBOARD_STRUCTURED_V1</span>
          <span>PLATFORM: GOOGLE_AI_STUDIO_SANDBOX</span>
        </div>
        <div className="flex gap-4">
          <span>UTF-8</span>
          <span className="text-emerald-500">● RUNNING WITH GEMINI 2.5 FLASH</span>
        </div>
      </footer>

      {/* CLICK-TO-ENLARGE LIGHTBOX MODAL */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 cursor-zoom-out select-none"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black border border-[#333] hover:border-red-500/40 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer z-50 flex items-center justify-center"
              title="Đóng xem thử"
            >
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5">Đóng (Esc) ✕</span>
            </button>
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            >
              <img
                src={expandedImage}
                className={`max-w-full max-h-[80vh] rounded-lg object-contain border border-[#444] shadow-2xl ${
                  sessionOptions.aspectRatio === "1:1" ? "aspect-square" : 
                  sessionOptions.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
                }`}
                alt="Enlarged Core Frame"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="mt-4 text-xs font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest flex items-center gap-1.5">
              <span>Aspect Ratio:</span>
              <span className="text-amber-500 font-bold">{sessionOptions.aspectRatio}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRÌNH HIỂN THỊ LỖI SINH HÌNH ẢNH MINH HỌA */}
      <AnimatePresence>
        {imageError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1C1C1F] border border-red-500/30 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative space-y-4 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-950/40 text-rose-500 border border-red-500/20 rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-rose-400 font-sans">
                    Sự Cố Tạo Giao Diện Ảnh Minh Họa
                  </h3>
                  <div className="text-xs text-slate-300 leading-relaxed font-sans max-h-48 overflow-y-auto pr-1">
                    {imageError.includes("QUOTA_EXCEEDED") ? (
                      <div>
                        <p className="font-semibold text-amber-400 mb-1">Hết giới hạn sử dụng (Quota Exceeded):</p>
                        <p>Hạn mức yêu cầu vẽ ảnh miễn phí tạm thời của hệ thống đã vượt quá giới hạn cho phép trong phút này. Vui lòng đợi hoặc đổi sang Key cá nhân.</p>
                      </div>
                    ) : (
                      <p>{imageError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hướng dẫn khắc phục và phím hành động */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-2 text-[11px] leading-relaxed text-slate-400 font-sans">
                <p className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Cách khắc phục ngay lập tức:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Tự lấy một mã <strong className="text-slate-300">Gemini API Key</strong> miễn phí nhanh chóng tại trang chủ <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-amber-500 underline hover:text-amber-400">Google AI Studio</a>.</li>
                  <li>Click vào nút màu đỏ nhấp nháy <strong className="text-slate-300">"Nhập API Key"</strong> ở góc trên bên phải trang web này.</li>
                  <li>Dán key của bạn vào và nhấn <strong className="text-slate-300">Lưu</strong>, mọi công việc thiết kế vẽ cảnh sẽ được mở khóa chạy mượt mà ngay tắp lự!</li>
                </ol>
              </div>

              {/* Các nút bấm điều khiển */}
              <div className="flex items-center gap-2.5 justify-end pt-2 text-xs">
                <button
                  onClick={() => setImageError(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setImageError(null);
                    setShowKeyInput(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider rounded-lg shadow-lg shadow-red-600/10 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Nhập My API Key</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
