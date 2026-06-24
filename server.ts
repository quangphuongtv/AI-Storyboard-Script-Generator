/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API Route 1: Generate storyboard
app.post("/api/generate-storyboard", async (req, res) => {
  try {
    const { storyIdea, style, sceneCount, tone, customApiKey, characterConsistency, outputLanguage, aspectRatio } = req.body;
    if (!storyIdea || typeof storyIdea !== "string") {
      return res.status(400).json({ error: "Yêu cầu nhập ý tưởng video" });
    }

    const rawApiKey = customApiKey || process.env.GEMINI_API_KEY;
    const apiKey = (typeof rawApiKey === "string" ? rawApiKey : "").trim();
    if (!apiKey) {
      return res.status(401).json({ 
        error: "GEMINI_API_KEY chưa được cấu hình. Vui lòng tự nhập Gemini API Key cá nhân bằng cách nhấn nút đỏ 'NHẬP GEMINI API KEY' ở góc trên bên phải màn hình để tiếp tục ngay lập tức!"
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

      const count = sceneCount === undefined ? 0 : Number(sceneCount);
      const userStyle = style || "Cinematic Epic";
      const userTone = tone || "Hùng hồn, kịch tính";
      const lang = outputLanguage || "Tiếng Việt";
      const ar = aspectRatio || "16:9";

      const systemInstruction = `Bạn là một chuyên gia biên kịch và cố vấn nghệ thuật AI xuất sắc, chuyên sáng tạo nội dung kịch bản cho video hoạt hình viral từ 3 đến 8 phút.
Nhiệm vụ của bạn là tiếp nhận bối cảnh/ý tưởng video (Ý tưởng Video) từ người dùng, phân tích kỹ và phân cảnh (scene/shot) thật chi tiết, cuốn hút, đảm bảo đầy đủ tình tiết của câu chuyện cùng lời thoại và thuyết minh dẫn dắt hấp dẫn nhất.

BẮT BUỘC kịch bản phân cảnh chi tiết (Storyboard Script) của bạn phải được thiết kế và triển khai chặt chẽ theo CÔNG THỨC NÂNG CAO ĐỂ LÀM VIDEO VIRAL PHIM HOẠT HÌNH DÙNG CẤU TRÚC 9 GIAI ĐOẠN sau:
1. Hook (Móc câu 5–15 giây đầu): Đập ngay vào mắt người xem bằng một chi tiết tò mò, kịch tính, hoặc tình huống bất ngờ để giữ chân khán giả tuyệt đối.
2. Giới thiệu nhân vật: Thiết lập nhanh danh tính, cá tính, nét đặc trưng hoặc bối cảnh của nhân vật chính.
3. Mục tiêu của nhân vật: Khao khát lớn, đích đến hoặc động lực hành động cốt lõi của nhân vật.
4. Xung đột xuất hiện: Biến cố ngáng đường nhân vật chính, phá vỡ thế cân bằng cũ.
5. Thử thách tăng dần: Các khó khăn liên tục ập tới gắp lửa bỏ tay người, nâng cao cao trào và kịch tính.
6. Khủng hoảng: Điểm rơi sâu nhất khi mọi hy vọng dường như vụt tắt khiến nhân vật đau đớn, đứng trước lựa chọn sinh tử nghẹt thở.
7. Cao trào: Trận chiến, quyết định bùng nổ, đối mặt trực diện vượt lên số phận đẩy kịch tính lên đỉnh điểm.
8. Giải quyết: Kết cục hành trình, gỡ nút thắt một cách thông minh, bất ngờ và thỏa đáng.
9. Bài học cảm xúc: Thông điệp triết lý nhân văn sâu sắc lắng đọng chạm tới tim người xem, tăng khả năng viral và tương tác chia sẻ cảm xúc tốt.

QUY TẮC THIẾT KẾ PHÙ HỢP BỐI CẢNH LỊCH SỬ VÀ ĐỊA LÝ:
- Bạn BẮT BUỘC phải phân tích và xác định rõ thời kỳ xảy ra câu chuyện (ví dụ: lịch sử thời cổ đại, thời phong kiến, thế kỷ 19, hiện tại, tương lai...) và địa điểm cụ thể của câu chuyện (ví dụ: miền Nam Việt Nam - trước năm 1975, New York - năm 2050...) dựa trên ý tưởng cốt truyện người dùng cung cấp.
- Từ thời kỳ lịch sử và vị trí địa lý được xác định độc lập này, bạn phải trực tiếp thiết kế các cấu trúc bối cảnh, mô tả ngoại hình/phong cách nhân vật và đạo cụ (quần áo, đồ dùng sinh hoạt, phương tiện di chuyển, vũ khí...) sao cho đồng bộ hoàn hảo, mang tính lịch sử và vùng miền chân thực, hoàn toàn phù hợp và tôn vinh bối cảnh chính xác đó.

Bạn phải xác nhận các cài đặt tham số đầu vào được thiết lập và thiết kế sẵn:
- Số lượng phân cảnh yêu cầu: ${count === 0 ? "AUTO (Tự động chia nhỏ chi tiết trải dọc đủ 9 giai đoạn)" : `${count} phân cảnh (phân bổ hợp lý cho đủ 9 giai đoạn)`}
- Tỷ lệ khung hình: ${ar}
- Phong cách hình ảnh: ${userStyle}
- Ngôn ngữ đầu ra: ${lang}

Bạn PHẢI phân chia phân cảnh thật chi tiết, đảm bảo phản ánh đầy đủ diễn biến tình tiết cốt truyện, tuyệt đối không được gộp tắt lược bỏ cốt truyện. Biên soạn đầy đủ lời thoại, hoặc lời dẫn chuyện (HÃY BIÊN SOẠN THOẠI ĐỐI ĐÁP CÀNG NHIỀU CÀNG TỐT) cho các nhân vật xuất hiện.

Đối với kịch bản phim, bạn cần tuân thủ cấu trúc Thiết kế Key Element chính xác như sau:
1. Định nghĩa một key_element riêng biệt cho mỗi thực thể hình ảnh lặp lại:
   - element character: dành cho từng nhân vật quan trọng hoặc có tên.
   - element scene: dành cho từng địa điểm riêng biệt (tương ứng với các bối cảnh chủ đạo trong danh sách 'boi_canh' của JSON Schema).
   - prop element: dành cho bất kỳ vật thể nào giữ vai trò trung tâm trong cốt truyện (tương ứng với các đạo cụ trong danh sách 'dao_cu' của JSON Schema).

2. Đối với Nhân vật (Character/Element Character):
   - Cung cấp mô tả ngoại hình chính xác trong mô tả: Độ tuổi, Dáng người, Màu da, Kiểu tóc, Trang phục theo từng cảnh nếu có thay đổi.
   - Nếu nhân vật xuất hiện với nhiều tạo hình: Bắt buộc gắn nhãn từng phiên bản rõ ràng (Ví dụ: Look A: [mô tả], Look B: [mô tả]).
   - Prompt tạo ảnh 2-panel character sheet (trường 'prompt_tao_anh_2_panel') viết bằng tiếng Anh phải được xây dựng như sau:
     + Cấu trúc prompt: Viết thành một đoạn văn liền mạch, không dùng tiêu đề phụ hay gạch đầu dòng, đi theo trình tự chính xác sau: Danh tính nhân vật/chủ thể -> Trang phục và đạo cụ -> Môi trường/background -> Cỡ cảnh và bố cục -> Chất lượng ánh sáng và color grade -> Texture và chi tiết -> Micro-expression hoặc pose phù hợp cảm xúc.
     + Quy tắc Character Sheet 2-Panel:
       * Nếu nhân vật chỉ xuất hiện một hình dạng: chỉ rõ bố cục 2 panel trong prompt: "left: head-and-shoulders portrait | right: full-body standing pose (front view, side view, back view)", background một màu trung tính.
       * Nếu nhân vật xuất hiện với nhiều hình dạng: chỉ rõ bố cục 2 panel trong prompt: Up (mô tả Look A) được chia thành 2 phần: "left: head-and-shoulders portrait | right: full-body standing pose" với background là một màu trung tính; Down (mô tả Look B) được chia thành 2 phần: "left: head-and-shoulders portrait | right: full-body standing pose" với background là một màu trung tính.
     + Ràng buộc tính đồng nhất (Khóa định danh): Đồng thời khóa chặt các dấu hiệu nhận diện đặc trưng trong prompt bao gồm: màu mắt, kiểu tóc thực sự chính xác, chi tiết trang phục để đảm bảo giữ ổn định tạo hình xuyên suốt các shot.

3. Đối với Bối cảnh (Location/Element Scene) & Đạo cụ (Props/Prop Element):
   - Prompt tạo ảnh tham chiếu (trường 'prompt_tao_anh' của 'boi_canh' và 'dao_cu') viết bằng tiếng Anh phải được xây dựng liền mạch làm một đoạn văn duy nhất không chứa tiêu đề phụ, bám sát tuyệt đối công thức: Danh tính chủ thể/vật thể -> Trang phục và đạo cụ -> Môi trường/background -> Cỡ cảnh và bố cục -> Chất lượng ánh sáng và color grade -> Texture và chi tiết -> Micro-expression hoặc pose/không khí phù hợp cảm xúc.

4. Đối với chế độ phân tách phân cảnh cần tuân thủ nghiêm ngặt:
   - Các phân cảnh được gọi là "Shot" thay vì "Scene".
   - Thời lượng mỗi phân cảnh (shot) bắt buộc phải từ 5 đến 10 giây (ví dụ: '00-06s', '06-12s', '12-20s',...), được chia nhỏ linh hoạt tùy theo lời thoại và hành động cụ thể diễn ra trong shot đó của câu chuyện.
   - Nếu chạy chế độ AUTO (sceneCount = 0): Phân tách kịch bản thành các shot phẳng tiếp nối nhau bám sát đầy đủ 9 giai đoạn của cốt truyện, đảm bảo thời lượng mỗi shot từ 5 đến 10 giây.
   - Nếu chạy chế độ chọn trước phân cảnh (sceneCount > 0): Chia nhỏ kịch bản thành chính xác số shot yêu cầu (${count}) phân bổ đều khắc khoải bối cảnh qua 9 giai đoạn cốt truyện, với thời lượng của mỗi shot duy trì từ 5 đến 10 giây.

5. Đối với mỗi phân cảnh (shot), cung cấp đầy đủ:
   - Số thứ tự phân cảnh (Shot number) và Thời lượng (Duration từ 5 đến 10 giây).
   - Xác định mảng mã tham chiếu các Element tham gia vào phân cảnh đó (ma_tham_chieu_elements).
   - Hành động & Biểu cảm nhân vật (Action & Expression).
   - Lời thoại (Dialogue) của nhân vật hoặc lời thoại trực thoại.
   - Thuyết minh / VO / SFX: LỜI THOẠI / VO / SFX - [SFX/VO & Audio Design], phải bắt đầu hoặc chứa nội dung của lời thoại (Dialogue) này một cách tự nhiên kèm thuyết minh phụ và SFX âm thanh.
   - Góc quay (Camera Angle), Chuyển động camera (Camera Movement), Bối cảnh không gian xảy ra phân cảnh.
   - Mô tả hình ảnh - AI Prompt: Prompt tiếng Anh chi tiết, nhúng các mã tham chiếu của những element tham gia vào phân cảnh này (Ví dụ: "[character_he_hero] standing in [location_forest]..."). BẮT BUỘC chèn thêm nội dung chi tiết của các yếu tố BỐI CẢNH / SETTING (ví dụ: "Setting: [location_forest] with dense fog...") và GÓC QUAY / CAMERA ANGLE (ví dụ: "Camera angle: Medium close-up, high angle view...") vào trong prompt mô tả hình ảnh này bằng tiếng Anh.
   - Prompt chuyển động tạo video (AI Video Prompt): Prompt tiếng Anh cho AI tạo video. BẮT BUỘC mô tả chuyển động trôi chảy mượt mà điện ảnh, chèn thêm nội dung chi tiết của các thành phần CHUYỂN ĐỘNG / CAMERA (ví dụ: "Camera movement: slow pan right..."), và chèn luôn kịch bản âm thanh [SFX/VO & Audio Design] (Dialogue/giọng nói/thuyết minh/hiệu ứng) tương ứng của phân cảnh đó để AI đồng bộ hóa chuyển động. Kết thúc bằng dòng 'No subtitle, No text, No background music'.

6. Ngôn ngữ của toàn bộ tài liệu (bao gồm tên video, tên yếu tố, mô tả ngoại hình, mô tả bối cảnh, bối cảnh phân cảnh/shot, hành động & biểu cảm, lời thoại, hiệu ứng âm thanh, diễn giải góc máy, chuyển động...) BẮT BUỘC phải viết bằng ngôn ngữ đầu ra được thiết lập: ${lang}. Các trường prompt tiếng Anh tạo ảnh và prompt video vẫn giữ ngôn ngữ gốc là Tiếng Anh.`;

      let prompt = `Hãy thiết kế kịch bản hoạt hình chi tiết chất lượng cao và phân tích các yếu tố cốt lõi cho ý tưởng sau: "${storyIdea}".

Ý tưởng kịch bản này PHẢI được phân tích cực kỳ kỹ lưỡng, đặc sắc, bám sát các tình tiết gốc rễ truyền cảm hứng, và được phân bổ chi tiết thành từng phân cảnh kịch tính dựa trên CẤU TRÚC 9 GIAI ĐOẠN SỬ THI/VIRAL (Hook -> Giới thiệu nhân vật -> Mục tiêu -> Xung đột xuất hiện -> Thử thách tăng dần -> Khủng hoảng cực độ -> Cao trào bùng nổ -> Giải quyết nút thắt -> Bài học đạo đức sâu sắc). Hãy mở rộng chi tiết các nét hành động biểu cảm, biên soạn đầy đủ mọi câu thoại lột tả sinh động, cùng lời dẫn chuyện cảm xúc lôi cuốn nhất.

Yêu cầu bổ sung kì vọng:
- Phong cách phim mong muốn: ${userStyle}
- Tông giọng hội thoại / VO / Nhạc nền: ${userTone}
- Tỷ lệ khung hình: ${ar}
- Thiết lập ngôn ngữ đầu ra: ${lang}
- Quy tắc chia phân cảnh: Phân tách kịch bản thành các phân cảnh gọi là "Shot", thời lượng của mỗi Shot bắt buộc từ 5 đến 10 giây (linh hoạt tùy thuộc độ dài lời thoại và diễn biến hành động). Chế độ phân tách: ${count === 0 ? "AUTO (sceneCount = 0): Tự động chia nhỏ chi tiết dọc đủ 9 giai đoạn" : `Chia đều thành chính xác ${count} shot`}.`;

      if (characterConsistency && characterConsistency.trim()) {
        prompt += `\n- ĐẢM BẢO ĐỒNG NHẤT NHÂN VẬT CHÍNH (Character Consistency): Tích hợp chi tiết đặc điểm miêu tả sau đây vào tất cả các phân cảnh, bối cảnh và đặc biệt phải lưu giữ miêu tả này trong thuộc tính 'Mô tả hình ảnh - AI Prompt' (mo_ta_hinh_anh_ai_prompt) tiếng Anh của từng cảnh, cũng như trong phần phân tích Nhân vật phim và đi kèm với mã tham chiếu tương ứng: "${characterConsistency}".`;
      }

      prompt += `\n- Trả về đúng định dạng JSON Schema được cấu hình.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ten_video: {
                type: Type.STRING,
                description: "Tiêu đề hoa mỹ, cuốn hút và đúng bối cảnh của video kịch bản."
              },
              elements_phim: {
                type: Type.OBJECT,
                description: "Phân tích và mô tả CÁC YẾU TỐ CHÍNH (KEY ELEMENTS) có trong phim bao gồm Nhân vật, Bối cảnh chủ đạo, Đạo cụ quan trọng và mã tham chiếu tương ứng",
                properties: {
                  nhan_vat: {
                    type: Type.ARRAY,
                    description: "Mô tả chi tiết tất cả nhân vật xuất hiện trong phim",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        ten: { type: Type.STRING, description: "Tên nhân vật chính hoặc phụ" },
                        ma_tham_chieu: { type: Type.STRING, description: "Mã tham chiếu dạng [character_ten]" },
                        mo_ta: { type: Type.STRING, description: "Mô tả chi tiết ngoại hình, độ tuổi, dáng người, màu da, kiểu tóc và trang phục theo từng cảnh. Hỗ trợ đa tạo hình Look A, Look B." },
                        prompt_tao_anh_2_panel: {
                          type: Type.STRING,
                          description: "Prompt bằng tiếng Anh chi tiết để tạo ảnh Character Sheet 2 panel. Thể hiện Look A (Up) và Look B (Down) trên nền một màu trung tính để khóa màu mắt, kiểu tóc ổn định."
                        }
                      },
                      required: ["ten", "ma_tham_chieu", "mo_ta", "prompt_tao_anh_2_panel"]
                    }
                  },
                  boi_canh: {
                    type: Type.ARRAY,
                    description: "Mô tả chi tiết các bối cảnh chủ đạo",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        ten: { type: Type.STRING, description: "Tên không gian bối cảnh chủ đạo" },
                        ma_tham_chieu: { type: Type.STRING, description: "Mã tham chiếu dạng [location_ten]" },
                        mo_ta: { type: Type.STRING, description: "Mô tả chi tiết bố cục không gian, điều kiện ánh sáng, tông màu chủ đạo và cảm xúc không gian truyền tải" },
                        prompt_tao_anh: { type: Type.STRING, description: "Prompt tiếng Anh liền mạch viết trực tiếp dưới góc nhìn đạo diễn briefing camera, theo sơ đồ chủ thể, trang phục, môi trường nền, cỡ cảnh, ánh sáng, texture, biểu cảm" }
                      },
                      required: ["ten", "ma_tham_chieu", "mo_ta", "prompt_tao_anh"]
                    }
                  },
                  dao_cu: {
                    type: Type.ARRAY,
                    description: "Mô tả chi tiết các đạo cụ biểu tượng",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        ten: { type: Type.STRING, description: "Tên đạo cụ biểu tượng" },
                        ma_tham_chieu: { type: Type.STRING, description: "Mã tham chiếu dạng [prop_ten]" },
                        mo_ta: { type: Type.STRING, description: "Mô tả hình thể, chất liệu, hoa văn kì ảo của đạo cụ độc lập" },
                        prompt_tao_anh: { type: Type.STRING, description: "Prompt tiếng Anh liền mạch viết trực tiếp dưới góc nhìn đạo diễn briefing camera, theo sơ đồ chủ thể, trang phục, môi trường nền, cỡ cảnh, ánh sáng, texture, biểu cảm" }
                      },
                      required: ["ten", "ma_tham_chieu", "mo_ta", "prompt_tao_anh"]
                    }
                  }
                },
                required: ["nhan_vat", "boi_canh", "dao_cu"]
              },
              danh_sach_phan_canh: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    so_phan_canh: {
                      type: Type.INTEGER,
                      description: "Số thứ tự phân cảnh / shot (1, 2, 3...)"
                    },
                    thoi_luong: {
                      type: Type.STRING,
                      description: "Thời lượng phân cảnh / shot, ví dụ: '00-07s', bắt buộc từ 5 đến 10 giây phù hợp với lời thoại và hành động."
                    },
                    ma_tham_chieu_elements: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Danh sách các mã tham chiếu của yếu tố có tham gia vào phân cảnh này"
                    },
                    hanh_dong_va_bieu_cam: {
                      type: Type.STRING,
                      description: "Miêu tả chi tiết hành động vật lý bám sát diễn biến cốt truyện và biểu cảm nhân vật"
                    },
                    bieu_cam_tag: {
                      type: Type.STRING,
                      description: "Từ khóa biểu cảm chủ đạo"
                    },
                    loi_thoai: {
                      type: Type.STRING,
                      description: "Lời thoại nhân vật (Dialogue) xuất hiện trong phân cảnh"
                    },
                    loi_thoai_vo_sfx: {
                      type: Type.STRING,
                      description: "Chứa lời thoại Dialogue, giọng thuyết minh (VO) hoặc thiết kế âm thanh (SFX) cụ thể"
                    },
                    goc_quay: {
                      type: Type.STRING,
                      description: "Góc quay điện ảnh bằng tiếng Anh kèm giải nghĩa"
                    },
                    chuyen_dong_camera: {
                      type: Type.STRING,
                      description: "Chuyển động camera điện ảnh"
                    },
                    boi_canh: {
                      type: Type.STRING,
                      description: "Địa điểm không gian xảy ra phân cảnh"
                    },
                    mo_ta_hinh_anh_ai_prompt: {
                      type: Type.STRING,
                      description: "Prompt tiếng Anh viết cực kỳ chi tiết của phân cảnh, nhúng các mã tham chiếu, và BẮT BUỘC chứa nội dung chi tiết của các yếu tố BỐI CẢNH / SETTING cùng GÓC QUAY / CAMERA ANGLE ở dạng tiếng Anh."
                    },
                    ai_video_prompt: {
                      type: Type.STRING,
                      description: "AI Video Prompt bằng tiếng Anh. Phải nhúng các mã tham chiếu, bối cảnh, di chuyển nhân vật, và BẮT BUỘC chèn thêm mô tả chi tiết của thành phần CHUYỂN ĐỘNG / CAMERA kèm lời thoại/thuyết minh [SFX/VO & Audio Design] (Dialogue). Kết thúc bằng 'No subtitle, No text, No background music'."
                    }
                  },
                  required: [
                    "so_phan_canh",
                    "thoi_luong",
                    "ma_tham_chieu_elements",
                    "hanh_dong_va_bieu_cam",
                    "bieu_cam_tag",
                    "loi_thoai",
                    "loi_thoai_vo_sfx",
                    "goc_quay",
                    "chuyen_dong_camera",
                    "boi_canh",
                    "mo_ta_hinh_anh_ai_prompt",
                    "ai_video_prompt"
                  ]
                }
              }
            },
            required: [
              "ten_video",
              "elements_phim",
              "danh_sach_phan_canh"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không nhận được phản hồi kịch bản từ Gemini");
      }

      const extractedContent = JSON.parse(responseText.trim());
      res.json(extractedContent);

    } catch (error: any) {
      console.error("Storyboard generation error:", error);
      let errMsg = error.message || "Gặp sự cố khi sinh kịch bản từ mô hình AI. Vui lòng thử lại.";
      if (
        errMsg.includes("Quota exceeded") || 
        errMsg.includes("429") || 
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        (error.status === "RESOURCE_EXHAUSTED") ||
        (error.code === 429)
      ) {
        errMsg = "QUOTA_EXCEEDED: Đã vượt quá hạn định (quota) sử dụng kịch bản miễn phí của hệ thống đối với Gemini trong phút này. Bạn vui lòng tự nhập Gemini API Key cá nhân bằng cách nhấn nút đỏ 'NHẬP GEMINI API KEY' ở góc trên bên phải màn hình để tiếp tục ngay lập tức!";
      }
      res.status(500).json({ 
        error: errMsg 
      });
    }
  });

  // API Route 2: Generate Demo Image using gemini-2.5-flash-image
  app.post("/api/generate-demo-image", async (req, res) => {
    try {
      const { prompt, referenceImages, customApiKey, aspectRatio, imageSize } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Yêu cầu cung cấp prompt mô tả vẽ ảnh" });
      }

      const rawApiKey = customApiKey || process.env.GEMINI_API_KEY;
      const apiKey = (typeof rawApiKey === "string" ? rawApiKey : "").trim();
      if (!apiKey) {
        return res.status(401).json({ 
          error: "GEMINI_API_KEY chưa được cấu hình. Vui lòng tự nhập Gemini API Key cá nhân bằng cách nhấn nút đỏ 'NHẬP GEMINI API KEY' ở góc trên bên phải màn hình để tiếp tục ngay lập tức!"
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const parts: any[] = [];
      if (Array.isArray(referenceImages) && referenceImages.length > 0) {
        for (const refImg of referenceImages) {
          if (refImg.dataUrl && typeof refImg.dataUrl === "string") {
            const matches = refImg.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              parts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              });
              parts.push({
                text: `Reference image for element with code ${refImg.code}. Use this image as consistent reference for this element in the scene and maintain visual consistency.`
              });
            }
          }
        }
      }

      let ratioSuffix = "";
      if (aspectRatio) {
        ratioSuffix = `, aspect ratio ${aspectRatio}`;
      }

      parts.push({
        text: `${prompt}, cinematic style, digital art, high quality, highly detailed${ratioSuffix}`
      });

      // Invoke gemini-3.1-flash-image (Nano Banana 2) to generate illustration parts with technical imageConfig matching ratio and selected resolution
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: parts
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            imageSize: imageSize || "1K"
          }
        }
      });

      let base64Image = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Image) {
        return res.status(500).json({ error: "Mô hình sinh ảnh không trả về phần inlineData chứa base64 image." });
      }

      res.json({ imageUrl: `data:image/png;base64,${base64Image}` });

    } catch (error: any) {
      console.error("Demo Image generation error:", error);
      let errMsg = error.message || "Gặp lỗi trong quá trình tạo hình ảnh minh họa bối cảnh.";
      if (
        errMsg.includes("Quota exceeded") || 
        errMsg.includes("429") || 
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        (error.status === "RESOURCE_EXHAUSTED") ||
        (error.code === 429)
      ) {
        errMsg = "QUOTA_EXCEEDED: Hạn định (quota) vẽ ảnh miễn phí của hệ thống đối với Gemini hiện tại đã hết lượt trong phút này. Bạn vui lòng tự nhập Gemini API Key cá nhân bằng cách nhấn nút đỏ 'NHẬP GEMINI API KEY' ở góc trên bên phải màn hình để tiếp tục tạo ảnh không bị gián đoạn!";
      }
      res.status(500).json({ 
        error: errMsg 
      });
    }
  });

  // Serverless / Production Optimization: Register static paths synchronously to ensure instant availability in Vercel.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development Mode: Setup Vite dynamically and asynchronously
    async function setupVite() {
      try {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } catch (err) {
        console.error("Failed to start Vite dev server:", err);
      }
    }
    setupVite();
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

export default app;
