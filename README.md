# Google Translate Shortcuts

Extension Chrome/Edge (Manifest V3) bổ sung phím tắt cho toàn bộ chức năng của [translate.google.com](https://translate.google.com), và cho phép dịch nhanh văn bản đang chọn từ bất kỳ trang nào.

## Cài đặt

1. Mở `chrome://extensions` (Edge: `edge://extensions`).
2. Bật **Developer mode** (Chế độ dành cho nhà phát triển).
3. Bấm **Load unpacked** và chọn thư mục này.
4. Tải lại các tab Google Dịch đang mở.

Nhấn `?` (hoặc `Alt+/`) trên trang Google Dịch để xem bảng phím tắt.

## Phím tắt

### Chế độ dịch
| Phím | Chức năng |
|---|---|
| `Alt+1` | Dịch văn bản |
| `Alt+2` | Dịch hình ảnh |
| `Alt+3` | Dịch tài liệu |
| `Alt+4` | Dịch trang web |

### Ngôn ngữ
| Phím | Chức năng |
|---|---|
| `Alt+S` | Hoán đổi ngôn ngữ (Google có sẵn `Ctrl+Shift+S`) |
| `Alt+Q` | Mở bộ chọn ngôn ngữ nguồn, con trỏ ở ô tìm kiếm |
| `Alt+W` | Mở bộ chọn ngôn ngữ đích, con trỏ ở ô tìm kiếm |
| `Alt+Z` | Nguồn: Phát hiện ngôn ngữ |
| `Alt+[` / `Alt+]` | Ngôn ngữ nguồn gần đây: trước / sau |
| `Alt+Shift+[` / `Alt+Shift+]` | Ngôn ngữ đích gần đây: trước / sau |

### Văn bản nguồn
| Phím | Chức năng |
|---|---|
| `Alt+I` hoặc `/` | Đưa con trỏ vào ô nhập (ô văn bản, hoặc ô URL ở chế độ Trang web) |
| `Alt+X` | Xóa văn bản nguồn |
| `Alt+V` | Dịch bằng giọng nói (bật/tắt micro) |
| `Alt+J` | Nghe văn bản nguồn / dừng |
| `Alt+M` | Chọn mô hình dịch (Nâng cao / Cổ điển) |
| `Alt+Shift+I` | Công cụ nhập (bàn phím ảo, viết tay) |

### Bản dịch
| Phím | Chức năng |
|---|---|
| `Alt+C` | Sao chép bản dịch |
| `Alt+K` | Nghe bản dịch / dừng |
| `Alt+B` | Lưu / bỏ lưu bản dịch (ngôi sao) |
| `Alt+G` | Tìm bản dịch trên Google |
| `Alt+R` | Đánh giá bản dịch |
| `Alt+O` | Chia sẻ bản dịch |
| `Alt+A` | Mở / đóng từ điển (khi dịch một từ) |

### Hình ảnh & tài liệu
| Phím | Chức năng |
|---|---|
| `Alt+U` | Chọn tệp để tải lên |
| `Alt+P` | Dán hình ảnh từ bộ nhớ tạm |

### Trang
| Phím | Chức năng |
|---|---|
| `Alt+H` | Lịch sử dịch (bấm lại để đóng) |
| `Alt+L` | Bản dịch đã lưu |
| `Alt+T` | Đổi giao diện sáng / tối |
| `Alt+,` | Cài đặt |
| `Alt+/` hoặc `?` | Hiện / ẩn bảng phím tắt |
| `Esc` | Đóng bảng phím tắt / bộ chọn ngôn ngữ |

### Mọi trang web
| Phím | Chức năng |
|---|---|
| `Alt+Shift+T` | Mở Google Dịch với văn bản đang chọn (dùng lại tab Google Dịch nếu đã mở) |
| Chuột phải → **Dịch "…" bằng Google Dịch** | Như trên, qua menu chuột phải |

`Alt+Shift+T` đổi được tại `chrome://extensions/shortcuts`.

## Nguyên tắc chọn phím

- Mọi phím tắt dùng `Alt`, nên vẫn gõ được bình thường trong ô nhập và không bị Unikey/EVKey (Telex, VNI) can thiệp. Phím được nhận theo vị trí vật lý (`KeyboardEvent.code`), nên không phụ thuộc bố cục bàn phím.
- Tránh các phím Chrome/Windows giữ riêng: `Alt+D`, `Alt+E`, `Alt+F`, `Alt+←/→`, `Ctrl+T/W/N/L`…
- `/` và `?` chỉ có tác dụng khi con trỏ không nằm trong ô nhập.

## Cách hoạt động

`content.js` tìm các nút của Google Dịch theo thuộc tính `jsname` (không đổi theo ngôn ngữ giao diện), dự phòng bằng `aria-label` tiếng Anh và tiếng Việt, rồi bấm nút đó. Nếu Google thay đổi giao diện và một phím không còn tác dụng, extension sẽ hiện thông báo nhỏ ở cuối trang. Khi đó chỉ cần sửa bảng `el` trong `content.js`.
