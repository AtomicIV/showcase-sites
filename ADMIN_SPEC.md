# Đặc Tả 100 Trang Quản Trị (QT-01 – QT-100)

Dòng sản phẩm thứ hai của showcase: **bảng điều khiển / phần mềm quản trị** cho thương hiệu giả định thuộc đủ các ngành nghề Việt Nam. Đây là một phân loại riêng với **dãy số riêng**, không dùng chung số với landing page (`01`–`501`).

- Thư mục: `sites/qt-NN-slug/` (vd. `qt-01-nhip-admin`, `qt-02-…`, `qt-100-…`). Các tool `shoot` / `sheet` / `smoke` / `deep` nhận đúng tên thư mục này.
- `meta.json`: giống landing (xem `VIETNAMESE_SPEC.md`), với `"category": "Admin"` và `"field"` là một trong 13 field chuẩn.
- Catalog: `build-catalog` tự xếp `qt-*` sau toàn bộ landing. Trang chỉ hiện trong section **Trang quản trị** với số `QT-NN`, và không tính vào số đếm, bộ lọc hay marquee của landing.
- Mẫu chuẩn: **QT-01 Nhịp Admin** (`sites/qt-01-nhip-admin`). Đọc file này trước khi làm trang đầu tiên.

Mọi ràng buộc chung của `BRIEF.md` + `VIETNAMESE_SPEC.md` vẫn áp dụng: 1 file HTML tự chứa, chỉ dùng các CDN đã liệt kê, font Google có `/* vietnamese */` trong danh sách đã kiểm chứng, tiếng Việt 100%, thương hiệu và con người đều giả định, chống cắt dấu, footer hoặc mục "Giới thiệu" có dòng `Thiết kế concept — thương hiệu giả định.`

---

## 1. Admin khác landing ở đâu

Landing được chấm theo cảm xúc khi cuộn. Admin được chấm theo cảm giác **đang dùng một phần mềm thật, làm việc hằng ngày được**. Vì vậy **bỏ** yêu cầu landing "pinned scrollytelling" và "5–8 section". Thay bằng:

| Bắt buộc | Chi tiết |
|---|---|
| **App shell** | Điều hướng chính + thanh trên (breadcrumb, tìm kiếm, thông báo, tài khoản). Bố cục lấy theo **archetype** của trang ở mục 2, không phải trang nào cũng sidebar trái. |
| **3–5 màn hình (view)** | Định tuyến bằng hash (`#don-hang`), F5 vẫn mở đúng view, `document.title` đổi theo view. Mỗi view có bố cục riêng, không lặp lại cùng một lưới thẻ. |
| **1 tương tác đặc trưng của ngành** | Cột "Tương tác đặc trưng" ở mục 3. Đây là thứ người xem nhớ, phải chạy thật bằng chuột, cảm ứng và bàn phím. |
| **Bảng dữ liệu thật** | Ít nhất 1 bảng có sắp xếp, lọc/tìm, chọn nhiều + thao tác hàng loạt, phân trang hoặc cuộn ảo, và trạng thái rỗng. |
| **Biểu đồ tự vẽ** | SVG/canvas tự viết (không dùng thư viện chart), có tooltip, đổi khoảng thời gian thì biến hình chứ không nháy. |
| **Form có kiểm tra** | Thông báo lỗi tiếng Việt ngay tại trường, lưu thì có toast, có hoàn tác (undo) cho thao tác xóa. |
| **Dữ liệu tiếng Việt như thật** | Tên người, địa chỉ, SĐT `09x`, giá `1.250.000 ₫` / `1,2 tr`, ngày `dd/mm/yyyy`, mốc thời gian tương đối tính từ `new Date()` để không bao giờ cũ. Dữ liệu sinh bằng seed cố định để ảnh chụp ổn định. |
| **Sáng / tối** | Cả hai theme đều hoàn chỉnh, nhớ lựa chọn trong `localStorage` (bọc try/catch). |
| **Bảng lệnh `Ctrl K`** | Nhảy view, tìm bản ghi, chạy lệnh nhanh. `Esc` đóng mọi lớp phủ theo thứ tự trên cùng trước. |
| **Responsive** | 390 / 820 / 1100 / 1440 px, 0px tràn ngang. Bảng trên mobile chuyển thành thẻ hoặc cuộn ngang *trong* khung. Menu mobile off-canvas có `aria-expanded`, focus vào trong, `Esc` đóng. |
| **Reduced motion** | `.rm`: bỏ số chạy, bỏ biến hình biểu đồ, nội dung vẫn đầy đủ. |
| **Dung lượng** | Khoảng 1.500–2.300 dòng (QT-01 là 2.219 dòng). |

### Bài học từ QT-01 (đừng lặp lại)

- Rule ẩn chữ khi thu gọn sidebar (`.collapsed .x span`) đã ẩn nhầm cả avatar/ô chữ cái. Hãy nhắm đúng phần tử chữ: `>span:not(.dot)`.
- Popover/menu bên trong sidebar `overflow:hidden` sẽ bị cắt. Ở rail hẹp, cho menu bay ra ngoài (`position:fixed`, tính `top` theo nút lúc mở).
- `display: revert` trả phần tử về mặc định của trình duyệt (span thành inline) chứ không về style của mình. Muốn hiện lại thì dùng selector cụ thể hơn, đừng dùng revert.
- Không đặt `transform` trong CSS `transition` cho phần tử mà GSAP cũng di chuyển (đã ghi trong `BRIEF.md`).
- Test cả 3 trạng thái điều hướng: mở rộng, thu gọn (nút) và rail tự động ≤1100px, mỗi trạng thái đều mở hết menu/popover.

### Bài học từ pilot (QT-02, QT-13, QT-36)

- `smoke` chỉ bấm được các nút của view đang mở (QT-02: 11/114). Mỗi trang phải có thêm script riêng trong `tools/_scratch/` mở **từng view** từ đầu và bấm hết control trong view đó. Script này đã bắt được 3 lỗi crash ở QT-02 (input kích hoạt trước khi view được mở, animation biểu đồ còn chạy khi đổi view, mất focus sau khi vẽ lại).
- Code của một view không được giả định là view đó đã từng render: listener toàn cục, `Ctrl K` và router đều có thể gọi vào view chưa mở.
- Headless Chrome báo hệ thống đang ở chế độ tối. Nếu thương hiệu là theme sáng, cho mặc định sáng (lựa chọn đã lưu vẫn được ưu tiên), để thumbnail catalog đúng màu.
- Intro phải xong trong khoảng 1,5 giây: `build-catalog` chụp thumbnail sau 2,2 giây, và khi máy bận thì thumbnail sẽ chụp trúng giữa intro (QT-36 từng bị như vậy).
- Nút nổi hoặc badge trên thanh tab: phần nội dung cuộn phải có đủ padding dưới để dòng cuối cuộn ra khỏi nút.
- Sheet hoặc modal nằm trong khung giả lập (điện thoại, TV) không được che thanh trạng thái của khung.
- Class trạng thái kéo-thả (`.dragging`, `.ghost`, …) phải có tiền tố riêng, vì QT-02 từng bị trùng với `.btn.ghost`.
- Trang có lịch/ca theo giờ phải đẹp ở **mọi giờ trong ngày**: sau giờ đóng cửa, mục đã xong vẫn phải đọc rõ (giảm bão hòa + dấu ✓, không mờ gần như mất). Phải chụp kiểm tra cả ban ngày bằng cách giả `Date` qua `page.evaluateOnNewDocument` (vd. 10:20 hôm nay), vì QA hay chạy vào buổi tối.
- `build-catalog` chụp landing 8 trang song song, nhưng chụp các trang `qt-` **lần lượt từng trang** với 3 giây chờ intro (song song thì intro nặng chạy không kịp, nhóm 1 từng hỏng 7/9 thumbnail). Sau mỗi lần build vẫn nên ghép `thumbs/qt-*.jpg` vào một ảnh để xem (vd. `tools/_scratch/qt-thumbs-sheet.cjs`).
- Toast không được che nút hành động chính, bàn phím số hay footer của modal (QT-09, QT-12 từng bị). Tối đa 2 toast cùng lúc.
- Nhãn chữ trên bản đồ, sơ đồ hay biểu đồ không được đè lên nhau (QT-16 từng bị: tên khu dính liền nhau, nhãn shipper đè tên quán).
- Giữ dưới khoảng 2.300 dòng. Cắt bớt view phụ trước khi cắt tương tác đặc trưng.

### QA cho mỗi trang

```
node tools/shoot.cjs qt-NN-slug desktop 1
node tools/shoot.cjs qt-NN-slug mobile 1
node tools/sheet.cjs qt-NN-slug desktop
node tools/sheet.cjs qt-NN-slug mobile
node tools/smoke.cjs qt-NN-slug desktop
node tools/smoke.cjs qt-NN-slug mobile
node tools/deep.cjs  qt-NN-slug
```

`deep` tải trang kèm `?static`. **Bắt buộc:** khi URL có `static`, trang phải dừng mọi thứ tự cập nhật (feed trực tiếp, đồng hồ, ticker, mốc "x phút trước") sau lần render đầu, để phần "scroll-consistency" chỉ so bố cục và animation. Cả hai phần `static: ok` và `scroll consistent` đều phải sạch. Mẫu: hằng `STATIC` trong QT-01.

Thêm một bước tay: chụp từng view ở cả 2 theme, mở hết menu/popover ở rail thu gọn, rồi **mở ảnh ra xem**.

---

## 2. Archetype bố cục (để 100 trang không thành 100 bản sao của QT-01)

| Mã | Bố cục | Hợp với |
|---|---|---|
| **A1** | Sidebar trái cổ điển + dashboard thẻ KPI (như QT-01) | Bán hàng, vận hành chung |
| **A2** | Thanh điều hướng trên + tab ngang, nội dung tràn rộng | CRM, phân tích, LMS |
| **A3** | Icon rail + panel điều hướng phụ (2 tầng) | SaaS nhiều module |
| **A4** | Master–detail 3 cột (danh sách, chi tiết, ngữ cảnh) | Hồ sơ, ticket, bệnh án, vụ việc |
| **A5** | Bản đồ / sơ đồ mặt bằng là trung tâm, panel nổi | Giao vận, kho, tòa nhà, bãi |
| **A6** | Lịch / timeline tài nguyên là trung tâm | Đặt lịch, phòng, ca |
| **A7** | Kanban / Gantt là trung tâm | Quy trình, dự án, sản xuất |
| **A8** | POS / cảm ứng: nút lớn, khổ tablet ngang | Quầy, thu ngân, bán vé |
| **A9** | Tường giám sát (NOC) tối, nhiều ô realtime, chế độ toàn màn hình | Bếp, nhà máy, SOC, điều hành |
| **A10** | Bảng tính dày đặc: ô sửa trực tiếp, phím tắt, cố định cột | Kế toán, kho, định lượng |
| **A11** | Mobile-first: tab bar dưới; desktop hiện trong khung điện thoại kèm panel phụ | Nhân viên hiện trường, giáo viên, chủ trọ |
| **A12** | Trình dựng kéo-thả node/khối | Chatbot, email, giáo trình, tự động hóa |

Mỗi nhóm 10 trang dùng **ít nhất 6 archetype khác nhau**, và không có 2 trang liền số nào trùng archetype và tông màu.

---

## 3. Danh sách 99 trang (QT-02 – QT-100)

Font chỉ là gợi ý từ danh sách đã kiểm chứng; trước khi làm, kiểm tra cặp font chưa có trang admin nào dùng (`grep -h fonts sites/qt-*/meta.json`).

### Nhóm 1 (QT-02–QT-11): Y tế & Sức khỏe
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-02 | `qt-02-an-tam-his` | **An Tâm Clinic** | HIS phòng khám đa khoa: tiếp đón, hàng đợi, bệnh án, kê đơn | Health & Wellness | A4 | Trắng lâm sàng + xanh ngọc (`Lexend` + `IBM Plex Mono`) | Bảng hàng đợi gọi số theo phòng, kéo bệnh nhân giữa phòng khám; đơn thuốc cảnh báo tương tác thuốc |
| QT-03 | `qt-03-nha-khoa-ngoc-trai` | **Nha khoa Ngọc Trai** | Lịch hẹn & kế hoạch điều trị nha khoa | Health & Wellness | A6 | Hồng ngọc trai pastel (`Fraunces` + `Manrope`) | Sơ đồ 32 răng: chạm chọn tình trạng từng răng → kế hoạch điều trị, báo giá, trả góp |
| QT-04 | `qt-04-nha-thuoc-bach-thao` | **Chuỗi nhà thuốc Bách Thảo** | Kho thuốc theo lô/hạn dùng, 12 chi nhánh | Health & Wellness | A10 | Xanh dược + giấy trắng (`Public Sans` + `Source Code Pro`) | Lưới tồn kho sửa trực tiếp, cảnh báo cận date FEFO, kéo lập phiếu chuyển kho giữa chi nhánh |
| QT-05 | `qt-05-labviet-lis` | **LabViet** | LIS quản lý mẫu xét nghiệm | Health & Wellness | A7 | Trắng lạnh + cyan (`IBM Plex Sans` + `IBM Plex Mono`) | Nhập mã ống mẫu → mẫu chạy qua các trạm; kết quả ngoài khoảng tham chiếu tự tô màu, duyệt và ký số |
| QT-06 | `qt-06-giuong-benh-hoa-binh` | **Bệnh viện Hòa Bình** | Điều phối giường bệnh nội trú | Health & Wellness | A5 | Navy y khoa (`Be Vietnam Pro` + `JetBrains Mono`) | Sơ đồ khoa 3 tầng (SVG): kéo bệnh nhân chờ vào giường trống, tỷ lệ lấp đầy và dự kiến ra viện cập nhật |
| QT-07 | `qt-07-la-sen-spa` | **Lá Sen Spa** | Đặt lịch kỹ thuật viên & phòng trị liệu | Health & Wellness | A6 | Be ấm, lá sen (`Cormorant Garamond` + `Mulish`) | Timeline ngang theo phòng/KTV: kéo giãn ca, báo trùng lịch, hoa hồng KTV tự tính |
| QT-08 | `qt-08-thep-fitness` | **Thép Fitness** | Hội viên, check-in, huấn luyện viên | Sport & Outdoors | A2 | Đen + cam neon kiểu brutal (`Anton` + `Barlow`) | Màn check-in quét thẻ; heatmap giờ cao điểm 7×24; gia hạn và bảo lưu gói |
| QT-09 | `qt-09-binh-yen-tam-ly` | **Bình Yên** | Quản lý ca tư vấn tâm lý | Health & Wellness | A4 | Xanh rêu dịu (`Literata` + `Nunito`) | Ghi chú phiên theo mẫu SOAP; biểu đồ thang điểm PHQ-9 qua các phiên; nhắc lịch |
| QT-10 | `qt-10-thu-y-bon-chan` | **Thú Y Bốn Chân** | Hồ sơ thú cưng, tiêm chủng, khám | Kids & Pets | A3 | Vàng bơ + nâu (`Baloo 2` + `Nunito`) | Lịch tiêm tự sinh theo loài/tuổi; biểu đồ cân nặng; xem trước tin nhắc tái khám |
| QT-11 | `qt-11-telemed-sai-gon` | **TeleMed Sài Gòn** | Trực ca khám từ xa | Health & Wellness | A9 | Tối + xanh ngọc (`Onest` + `Geist Mono`) | Lưới ca chờ có SLA đếm ngược; phân bác sĩ theo chuyên khoa; phòng gọi mô phỏng |

### Nhóm 2 (QT-12–QT-21): Ẩm thực & Bán lẻ thực phẩm
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-12 | `qt-12-bep-me-nau-pos` | **Bếp Mẹ Nấu** | POS nhà hàng: bàn & order | Food & Drink | A8 | Kem + đỏ gạch (`Bricolage Grotesque` + `Space Mono`) | Sơ đồ bàn: kéo gộp/tách bàn, gọi món, chia hóa đơn theo người, in tạm tính |
| QT-13 | `qt-13-lua-hong-kds` | **Lửa Hồng** | Màn hình bếp (KDS) | Food & Drink | A9 | Đen than + vàng lửa (`Big Shoulders Display` + `JetBrains Mono`) | Vé món chảy theo trạm nướng/chiên/lạnh, đồng hồ đỏ dần khi trễ, bump vé bằng phím số |
| QT-14 | `qt-14-rang-xay-dong-ops` | **Rang Xay Đồng** | Vận hành chuỗi 30 quán cà phê | Food & Drink | A1 | Nâu cà phê + kem (`Fraunces` + `Work Sans`) | Bản đồ quán (SVG) tô màu theo doanh thu; so sánh 2 quán; công thức pha có định lượng |
| QT-15 | `qt-15-bep-trung-tam-gao` | **Bếp trung tâm Gạo** | Định lượng & đặt nguyên vật liệu | Food & Drink | A10 | Xanh lá + trắng (`Archivo` + `Inconsolata`) | Nhập số suất dự kiến → bung định mức (BOM) ra nguyên liệu, so với tồn, tạo đơn đặt hàng NCC |
| QT-16 | `qt-16-ship-nhanh-pho` | **Ship Nhanh Phố** | Điều phối shipper giao đồ ăn | Food & Drink | A5 | Vàng chanh + đen (`Lexend` + `Chivo Mono`) | Bản đồ khu vực: kéo đơn chưa gán vào shipper, tuyến giao tự sắp xếp, ETA |
| QT-17 | `qt-17-tran-chau-club` | **Trân Châu Club** | CRM khách hàng thân thiết | Food & Drink | A2 | Tím khoai môn pastel (`Quicksand` + `Mona Sans`) | Trình dựng phân khúc (điều kiện lồng nhau) → đếm khách realtime, phễu RFM, gửi voucher |
| QT-18 | `qt-18-nha-ngoi-tiec` | **Tiệc Nhà Ngói** | Đặt bàn & sảnh tiệc cưới | Food & Drink | A6 | Đỏ son + vàng (`Playfair Display` + `Be Vietnam Pro`) | Lịch sảnh theo buổi; tính menu theo mâm; tiền cọc và lịch thanh toán |
| QT-19 | `qt-19-banh-mi-pho-franchise` | **Bánh Mì Phố** | Nhượng quyền & kiểm tra cửa hàng | Food & Drink | A3 | Cam + giấy kraft (`Paytone One` + `Asap`) | Checklist audit có chấm điểm và ảnh; bảng xếp hạng đối tác nhượng quyền |
| QT-20 | `qt-20-men-lanh-brewery` | **Men Lạnh Brewery** | Giám sát mẻ ủ bia thủ công | Food & Drink | A9 | Đồng + đen (`Unbounded` + `Reddit Mono`) | 12 bồn ủ với nhiệt độ và tỷ trọng realtime, đường cong lên men, cảnh báo lệch |
| QT-21 | `qt-21-mart-24h` | **Mart 24h** | Chuỗi cửa hàng tiện lợi: tồn & trưng bày | Food & Drink | A1 | Xanh lá + vàng (`Barlow` + `Overpass Mono`) | Planogram: kéo sản phẩm lên kệ, cảnh báo hết hàng theo vị trí kệ |

### Nhóm 3 (QT-22–QT-31): Thời trang, Làm đẹp & Thương mại
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-22 | `qt-22-lua-ha-dong-pim` | **Lụa Hà Đông Studio** | Quản lý sản phẩm & biến thể | Fashion & Beauty | A4 | Trắng ngà + đen (`Cormorant` + `Hanken Grotesk`) | Ma trận size × màu nhập hàng loạt; kéo sắp xếp ảnh lookbook |
| QT-23 | `qt-23-keo-vang-salon` | **Kéo Vàng Salon** | Lịch stylist & khách | Fashion & Beauty | A6 | Đen + vàng đồng (`Bona Nova` + `Manrope`) | Lịch theo stylist, chèn khách vãng lai vào khe trống, chia hoa hồng |
| QT-24 | `qt-24-da-moc-live` | **Da Mộc Live** | Điều hành livestream bán hàng | Fashion & Beauty | A9 | Hồng neon + đen (`Dela Gothic One` + `Be Vietnam Pro`) | Bình luận chốt đơn trôi realtime, gắn mã sản phẩm, đếm tồn trực tiếp, doanh thu theo phút |
| QT-25 | `qt-25-xuong-may-kim-chi` | **Xưởng May Kim Chỉ** | Kế hoạch chuyền may | Fashion & Beauty | A7 | Xám xi măng + vàng phấn (`IBM Plex Sans Condensed` + `IBM Plex Mono`) | Gantt chuyền may: kéo đơn sang chuyền khác, tính hiệu suất SAM |
| QT-26 | `qt-26-kim-hoan-phuc` | **Kim Hoàn Phúc** | Trang sức & giá vàng | Fashion & Beauty | A1 | Đen nhung + vàng (`Prata` + `Public Sans`) | Bảng giá vàng theo giờ; giá sản phẩm = trọng lượng × giá + công; in tem |
| QT-27 | `qt-27-mac-dep-doi-tra` | **Mặc Đẹp** | CSKH & đổi trả | Fashion & Beauty | A4 | Trắng + xanh dương (`Epilogue` + `Source Code Pro`) | Hộp ticket có mẫu trả lời nhanh; quy trình đổi trả (RMA) nhiều bước |
| QT-28 | `qt-28-huong-viet-b2b` | **Hương Việt** | Đơn sỉ & đại lý nước hoa | Fashion & Beauty | A2 | Tím mận + kem (`Noto Serif Display` + `Lexend`) | Bảng giá theo cấp đại lý, công nợ và hạn mức, tự chặn đơn vượt hạn mức |
| QT-29 | `qt-29-mong-xinh-pos` | **Móng Xinh** | POS tiệm nail | Fashion & Beauty | A8 | Hồng pastel (`Comfortaa` + `Nunito`) | Chọn dịch vụ, gán thợ, chia tip, chốt ca |
| QT-30 | `qt-30-cho-phien-seller` | **Chợ Phiên Online** | Trung tâm người bán sàn TMĐT | Fashion & Beauty | A3 | Cam + trắng (`Wix Madefor Text` + `Geist Mono`) | Điểm sức khỏe shop, lịch khuyến mãi kéo thả, phễu chuyển đổi |
| QT-31 | `qt-31-mat-sang-optic` | **Mắt Sáng Optic** | Đơn kính & đo khúc xạ | Fashion & Beauty | A4 | Xanh băng (`Exo 2` + `Inconsolata`) | Nhập độ cầu/trụ/trục 2 mắt, chọn tròng, mô phỏng độ dày tròng theo chiết suất |

### Nhóm 4 (QT-32–QT-41): Bất động sản, Xây dựng & Nhà ở
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-32 | `qt-32-son-ha-gio-hang` | **Sơn Hà Land** | Rổ hàng dự án căn hộ | Finance & Property | A5 | Xanh ngọc + cát (`Gelasio` + `Archivo`) | Sa bàn tầng × căn: trạng thái giữ chỗ/cọc/đã bán đổi màu, khóa căn khi có sale đang giữ |
| QT-33 | `qt-33-sky-garden-cu-dan` | **Sky Garden Residence** | Vận hành tòa nhà & cư dân | Home & Living | A3 | Xanh lá + xám (`Hanken Grotesk` + `Reddit Mono`) | Phản ánh cư dân → ticket kỹ thuật; phí dịch vụ theo căn; trạng thái thang máy |
| QT-34 | `qt-34-mong-vung-tien-do` | **Móng Vững** | Tiến độ công trình | Science & Industry | A7 | Vàng bảo hộ + đen (`Oswald` + `IBM Plex Mono`) | Gantt hạng mục có đường găng: kéo giãn một việc thì các việc phụ thuộc dịch theo; nhật ký công trường |
| QT-35 | `qt-35-go-moc-nha-bao-gia` | **Gỗ Mộc Nhà** | Báo giá & sản xuất nội thất | Home & Living | A10 | Nâu gỗ + kem (`Lora` + `Cabin`) | Bóc tách khối lượng tấm ván → sơ đồ cắt ván tối ưu (nesting), phần trăm hao hụt |
| QT-36 | `qt-36-nha-tro-xanh` | **Nhà Trọ Xanh** | Quản lý phòng trọ / chung cư mini | Home & Living | A11 | Xanh lá non (`Be Vietnam Pro` + `Space Mono`) | Chốt số điện nước → hóa đơn tự tính theo bậc thang, mã QR thu tiền |
| QT-37 | `qt-37-tho-tot-dieu-phoi` | **Thợ Tốt** | Điều phối thợ sửa chữa tại nhà | Home & Living | A5 | Cam + xanh đậm (`Barlow Condensed` + `Barlow`) | Việc theo khu vực, gợi ý thợ gần nhất, báo giá vật tư tại chỗ |
| QT-38 | `qt-38-hub-cong-sinh` | **Hub Cộng Sinh** | Coworking đặt chỗ | Finance & Property | A5 | Trắng + vàng nghệ (`Space Grotesk` + `Chivo Mono`) | Sơ đồ tầng: chọn bàn/phòng họp theo giờ, tỷ lệ sử dụng theo khu |
| QT-39 | `qt-39-vlxd-ba-mien` | **VLXD Ba Miền** | Kho & giao vật liệu xây dựng | Science & Industry | A1 | Xám bê tông + đỏ (`Archivo Narrow` + `Overpass Mono`) | Lệnh xuất kho → xếp hàng lên xe theo tải trọng, phiếu giao hàng |
| QT-40 | `qt-40-nang-xanh-solar` | **Nắng Xanh Solar** | Giám sát điện mặt trời áp mái | Science & Industry | A9 | Xanh đêm + vàng (`Tektur` + `JetBrains Mono`) | 40 hệ khách hàng: sản lượng theo giờ, inverter lỗi, tiền tiết kiệm |
| QT-41 | `qt-41-nha-an-smarthome` | **Nhà An** | Trung tâm điều khiển nhà thông minh | Home & Living | A11 | Kính mờ tối (`Mona Sans` + `Geist Mono`) | Sơ đồ nhà bật/tắt thiết bị; trình dựng kịch bản "nếu… thì…" |

### Nhóm 5 (QT-42–QT-51): Du lịch, Lưu trú & Vận tải hành khách
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-42 | `qt-42-hoi-an-riverside-pms` | **Hội An Riverside** | PMS khách sạn | Travel & Leisure | A6 | Vàng nghệ + xanh rêu (`Cormorant Upright` + `Manrope`) | Tape chart: kéo đặt phòng theo ngày/phòng; check-in; trạng thái dọn phòng |
| QT-43 | `qt-43-may-homestay-channel` | **Mây Homestay** | Quản lý kênh OTA | Travel & Leisure | A2 | Hồng đất + kem (`Bitter` + `Mulish`) | Ma trận giá × ngày đồng bộ 4 kênh giả định, quy tắc giá theo mùa |
| QT-44 | `qt-44-dat-viet-tour` | **Đất Việt Travel** | Điều hành tour | Travel & Leisure | A7 | Xanh biển (`Signika` + `Source Code Pro`) | Đoàn đi qua các bước; phân HDV/xe; danh sách phòng (rooming list) |
| QT-45 | `qt-45-xe-khach-phuong-nam` | **Xe Khách Phương Nam** | Bán vé & sơ đồ ghế | Travel & Leisure | A8 | Xanh lá đậm + cam (`Saira` + `Space Mono`) | Sơ đồ giường nằm 2 tầng: giữ ghế, đổi chuyến, in vé |
| QT-46 | `qt-46-canh-sen-air-occ` | **Cánh Sen Air** | Trung tâm điều hành bay | Travel & Leisure | A9 | Xanh đêm + hổ phách (`Chakra Petch` + `JetBrains Mono`) | Gantt theo tàu bay: chậm chuyến lan truyền sang chặng sau; phân tổ bay |
| QT-47 | `qt-47-vinh-ngoc-cruise` | **Vịnh Ngọc Cruise** | Đặt cabin du thuyền | Travel & Leisure | A5 | Trắng + navy (`Noto Serif` + `Maven Pro`) | Mặt cắt 3 boong chọn cabin; gói dịch vụ; danh sách hành khách |
| QT-48 | `qt-48-dao-ky-thu-ve` | **Đảo Kỳ Thú** | Vé & lưu lượng khu vui chơi | Travel & Leisure | A9 | Màu kẹo ngọt (`Grandstander` + `Varela Round`) | Lưu lượng theo trò chơi realtime, thời gian chờ, mở thêm làn |
| QT-49 | `qt-49-doi-thong-golf` | **Đồi Thông Golf** | Đặt giờ tee & caddie | Sport & Outdoors | A6 | Xanh cỏ + trắng (`EB Garamond` + `Fira Sans`) | Lưới tee time 18 lỗ, flight 4 người, phân caddie và xe điện |
| QT-50 | `qt-50-visa-nhanh` | **Visa Nhanh** | Hồ sơ visa | Travel & Leisure | A4 | Xanh nhạt + đỏ dấu mộc (`Source Serif 4` + `Source Sans 3`) | Checklist giấy tờ theo quốc gia, tiến trình hồ sơ, hạn nộp |
| QT-51 | `qt-51-leu-sao-glamping` | **Lều Sao** | Đặt chỗ glamping | Travel & Leisure | A5 | Xanh rừng + cam lửa trại (`Josefin Sans` + `Patrick Hand`) | Bản đồ lều theo đêm, combo BBQ, dự báo thời tiết |

### Nhóm 6 (QT-52–QT-61): Tài chính, Bảo hiểm, Kế toán & Pháp lý
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-52 | `qt-52-so-cai-viet` | **Sổ Cái Việt** | Kế toán doanh nghiệp | Finance & Property | A10 | Giấy kẻ + xanh mực (`Spectral` + `Inconsolata`) | Nhập chứng từ định khoản Nợ/Có, chặn lưu khi lệch; sổ cái; bảng cân đối |
| QT-53 | `qt-53-thu-hoi-pro` | **Thu Hồi Pro** | Quản lý công nợ phải thu | Finance & Property | A1 | Đỏ rượu + xám (`Petrona` + `Barlow`) | Phân nhóm tuổi nợ, kịch bản nhắc nợ, ghi nhận cam kết trả |
| QT-54 | `qt-54-vay-xanh-tham-dinh` | **Vay Xanh** | Thẩm định khoản vay | Finance & Property | A4 | Xanh tiền + trắng (`Hepta Slab` + `Work Sans`) | Chấm điểm hồ sơ với trọng số chỉnh được; lịch trả nợ dư nợ giảm dần |
| QT-55 | `qt-55-an-phuc-boi-thuong` | **An Phúc Insurance** | Bồi thường bảo hiểm | Finance & Property | A7 | Xanh dương + vàng nắng (`Roboto Slab` + `Manrope`) | Hồ sơ đi qua các bước, đối chiếu điều khoản, duyệt mức chi theo thẩm quyền |
| QT-56 | `qt-56-quy-song-hong` | **Quỹ Sông Hồng** | Quản trị danh mục quỹ (số liệu giả lập) | Finance & Property | A9 | Đen + xanh lá terminal (`Chivo` + `Chivo Mono`) | Treemap phân bổ tài sản, mô phỏng tái cân bằng, đường NAV |
| QT-57 | `qt-57-luat-minh-chinh` | **Luật Minh Chính** | Vụ việc & giờ tính phí | Finance & Property | A4 | Nâu da + kem (`Old Standard TT` + `Public Sans`) | Bấm giờ làm việc theo vụ, lịch hạn tố tụng, hóa đơn theo giờ |
| QT-58 | `qt-58-ehoa-don` | **eHóa Đơn** | Phát hành & tra soát hóa đơn điện tử | Tech & Software | A2 | Xanh đậm + trắng (`Overpass` + `Overpass Mono`) | Lập hóa đơn nhiều thuế suất, mô phỏng ký số, đối chiếu sai lệch |
| QT-59 | `qt-59-luong-dung-hen` | **Lương Đúng Hẹn** | Nhân sự & tính lương | Tech & Software | A1 | Tím nhạt + trắng (`Familjen Grotesk` + `Geist Mono`) | Bảng lương tính BHXH và thuế TNCN lũy tiến, phiếu lương từng người |
| QT-60 | `qt-60-tin-phat-cam-do` | **Tín Phát** | Cầm đồ & định giá tài sản | Finance & Property | A8 | Đỏ + vàng (`Francois One` + `Cuprum`) | Phiếu cầm, lãi tính theo ngày, danh sách quá hạn chờ thanh lý |
| QT-61 | `qt-61-minh-bach-audit` | **Minh Bạch Audit** | Kiểm toán nội bộ | Finance & Property | A3 | Xám than + xanh ngọc (`Newsreader` + `Onest`) | Ma trận rủi ro xác suất × tác động kéo thả; theo dõi khắc phục phát hiện |

### Nhóm 7 (QT-62–QT-71): Giáo dục & Cộng đồng
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-62 | `qt-62-anh-duong-lms` | **Trường Ánh Dương** | LMS & sổ điểm | Education & Causes | A2 | Xanh bảng đen + phấn (`Andika` + `Patrick Hand`) | Sổ điểm tính trung bình theo hệ số, nhận xét mẫu, xuất học bạ |
| QT-63 | `qt-63-fluent-hub` | **Fluent Hub** | Xếp lớp & điểm danh trung tâm ngoại ngữ | Education & Causes | A6 | Đỏ cam + trắng (`Kanit` + `Sarabun`) | Lịch phòng/giáo viên, xếp lớp theo điểm test đầu vào |
| QT-64 | `qt-64-mam-xanh-nhat-ky` | **Mầm Xanh** | Nhật ký bé cho giáo viên mầm non | Kids & Pets | A11 | Pastel (`Mali` + `Itim`) | Điểm danh bằng chạm avatar; bữa ăn, giấc ngủ; gửi nhật ký cho phụ huynh |
| QT-65 | `qt-65-dh-phuong-dong-tuyen-sinh` | **ĐH Phương Đông** | Tuyển sinh | Education & Causes | A1 | Đỏ đô + vàng (`Playfair Display` + `Source Sans 3`) | Phễu tuyển sinh; mô phỏng điểm chuẩn theo tổ hợp và chỉ tiêu |
| QT-66 | `qt-66-thu-vien-hong-linh` | **Thư viện Hồng Lĩnh** | Mượn trả sách | Arts & Culture | A4 | Xanh rêu + giấy cũ (`Crimson Pro` + `Asap`) | Nhập mã sách mượn/trả, phạt quá hạn, bản đồ giá sách |
| QT-67 | `qt-67-quy-bat-com` | **Quỹ Bát Cơm** | Quản lý quyên góp minh bạch | Education & Causes | A2 | Cam ấm + kem (`Lora` + `Nunito`) | Sao kê thu/chi theo dự án, tiến độ công trình, trang công khai |
| QT-68 | `qt-68-tay-noi-tay` | **Tay Nối Tay** | Điều phối tình nguyện viên | Education & Causes | A6 | Xanh lá + vàng (`Shantell Sans` + `Manrope`) | Ca trực, ghép theo kỹ năng, tổng giờ đóng góp |
| QT-69 | `qt-69-lai-vung` | **Lái Vững** | Trường đào tạo lái xe | Education & Causes | A1 | Vàng biển báo + đen (`League Spartan` + `Overpass`) | Lịch thực hành theo xe/thầy, số km DAT, thi sát hạch thử |
| QT-70 | `qt-70-hoc-gi-cung-duoc` | **Học Gì Cũng Được** | CMS khóa học online | Education & Causes | A12 | Tím + vàng (`Anybody` + `Work Sans`) | Kéo thả chương/bài, trình tạo quiz, doanh thu affiliate |
| QT-71 | `qt-71-olympic-toan-tre` | **Olympic Toán Trẻ** | Tổ chức kỳ thi | Education & Causes | A10 | Xanh dương + đỏ (`Noticia Text` + `Inconsolata`) | Đánh số báo danh, phân phòng thi, chấm điểm và xếp giải |

### Nhóm 8 (QT-72–QT-81): Công nghệ & SaaS
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-72 | `qt-72-may-viet-cloud` | **Mây Việt Cloud** | Console triển khai | Tech & Software | A3 | Tím tối + xanh lá (`Space Grotesk` + `JetBrains Mono`) | Pipeline CI/CD chạy từng bước với log stream, rollback một chạm |
| QT-73 | `qt-73-tong-dai-lua` | **Tổng Đài Lúa** | Contact center | Tech & Software | A9 | Xanh dương + cam (`Hanken Grotesk` + `IBM Plex Mono`) | Wallboard cuộc gọi chờ, trạng thái tổng đài viên, sóng âm ghi âm |
| QT-74 | `qt-74-ho-tro-247` | **Hỗ Trợ 247** | ITSM: ticket & tài sản IT | Tech & Software | A4 | Trắng + xanh (`Public Sans` + `Geist Mono`) | Đồng hồ SLA, cây tài sản CMDB liên kết ticket |
| QT-75 | `qt-75-khien-so-soc` | **Khiên Số** | SOC giám sát an ninh mạng (giả lập) | Tech & Software | A9 | Đen + đỏ (`Pathway Extreme` + `Chivo Mono`) | Dòng cảnh báo theo mức độ, bản đồ sự kiện, playbook phản ứng từng bước |
| QT-76 | `qt-76-tro-ly-lan` | **Trợ Lý Lan** | Quản trị chatbot AI | Tech & Software | A12 | Gradient tím-hồng (`Be Vietnam Pro` + `IBM Plex Mono`) | Kéo nối node hội thoại; khung chat thử; thống kê ý định |
| QT-77 | `qt-77-thu-bay-email` | **Thư Bay** | Chiến dịch email marketing | Tech & Software | A12 | Vàng + đen (`Archivo` + `Reddit Mono`) | Soạn email kéo khối, A/B test, heatmap lượt click |
| QT-78 | `qt-78-xuong-sang-tao` | **Xưởng Sáng Tạo** | Dự án & chấm công agency | Media & Entertainment | A7 | Pastel nhiều màu (`Bricolage Grotesque` + `Inconsolata`) | Kanban + bấm giờ + lãi/lỗ từng dự án |
| QT-79 | `qt-79-cam-bien-viet-iot` | **Cảm Biến Việt** | Đội thiết bị IoT | Tech & Software | A5 | Teal tối (`Saira` + `Geist Mono`) | Bản đồ 500 thiết bị, cập nhật firmware theo đợt, telemetry |
| QT-80 | `qt-80-san-tai-ats` | **Săn Tài** | ATS tuyển dụng | Tech & Software | A7 | Xanh mint + trắng (`Manrope` + `Source Code Pro`) | Kéo ứng viên qua các vòng, phiếu đánh giá phỏng vấn, lịch hẹn |
| QT-81 | `qt-81-do-luong-analytics` | **Đo Lường** | Product analytics | Tech & Software | A2 | Tối + tím (`Mona Sans` + `Geist Mono`) | Tự dựng funnel, heatmap cohort giữ chân người dùng |

### Nhóm 9 (QT-82–QT-91): Sản xuất, Logistics, Năng lượng & Nông nghiệp
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-82 | `qt-82-co-khi-tien-bo-mes` | **Cơ Khí Tiến Bộ** | MES xưởng CNC | Science & Industry | A9 | Xám thép + vàng an toàn (`Barlow Condensed` + `IBM Plex Mono`) | OEE từng máy, ghi lý do dừng máy, lệnh sản xuất |
| QT-83 | `qt-83-kho-ba-mien-wms` | **Kho Ba Miền** | WMS kho hàng | Science & Industry | A5 | Cam + xám (`Archivo Narrow` + `Space Mono`) | Sơ đồ kệ theo vị trí, tuyến lấy hàng, gom đơn theo đợt |
| QT-84 | `qt-84-cang-cat-vang` | **Cảng Cát Vàng** | Quản lý bãi container | Science & Industry | A5 | Xanh biển + đỏ container (`Oswald` + `Space Mono`) | Lưới bãi xếp chồng container, kế hoạch đảo chuyển |
| QT-85 | `qt-85-tom-sach-ca-mau` | **Tôm Sạch Cà Mau** | Giám sát ao nuôi tôm | Science & Industry | A11 | Xanh nước + cam tôm (`Signika` + `Reddit Mono`) | Chỉ số pH, oxy, kiềm theo giờ; nhật ký cho ăn; dự báo thu hoạch |
| QT-86 | `qt-86-vuon-so-da-lat` | **Vườn Số Đà Lạt** | Nhà kính công nghệ cao | Science & Industry | A5 | Xanh lá + tím đèn grow (`Lexend` + `Chivo Mono`) | Sơ đồ luống, lịch tưới, nhật ký phun thuốc phục vụ truy xuất |
| QT-87 | `qt-87-gio-ninh-thuan-scada` | **Gió Ninh Thuận** | SCADA điện gió | Science & Industry | A9 | Đen + cyan (`Tektur` + `Inconsolata`) | 24 tuabin: gió và công suất, đường cong công suất, cảnh báo |
| QT-88 | `qt-88-truy-nguyen` | **Truy Nguyên** | Truy xuất nguồn gốc nông sản | Science & Industry | A4 | Xanh lá + giấy kraft (`Bitter` + `Work Sans`) | Cây lô hàng từ nông trại → đóng gói → phân phối, sinh mã QR |
| QT-89 | `qt-89-doi-xe-bac-nam` | **Đội Xe Bắc Nam** | Đội xe tải & nhiên liệu | Science & Industry | A5 | Vàng + xám đen (`Barlow` + `JetBrains Mono`) | Hành trình GPS, định mức dầu, lịch bảo dưỡng |
| QT-90 | `qt-90-nuoc-trong-xu-ly` | **Nước Trong** | Trạm xử lý nước thải | Science & Industry | A9 | Xanh dương + xám (`IBM Plex Sans Condensed` + `Reddit Mono`) | Sơ đồ quy trình bật/tắt bơm và van; chỉ tiêu xả thải so với quy chuẩn |
| QT-91 | `qt-91-dak-nong-coffee` | **Đắk Nông Coffee** | Thu mua & sấy cà phê | Food & Drink | A8 | Nâu đất + xanh lá (`Alfa Slab One` + `Asap`) | Phiếu cân thu mua, trừ cân theo độ ẩm, giá theo ngày |

### Nhóm 10 (QT-92–QT-100): Truyền thông, Văn hóa, Thể thao, Mẹ bé & Thú cưng
| # | Slug | Thương hiệu | Hệ thống quản trị | Field | Bố cục | Phong cách & font | Tương tác đặc trưng |
|---|---|---|---|---|---|---|---|
| QT-92 | `qt-92-bao-pho-cms` | **Báo Phố** | CMS tòa soạn | Media & Entertainment | A4 | Trắng giấy báo + đỏ (`Noto Serif Display` + `Source Sans 3`) | Luồng biên tập (viết → biên tập → duyệt → xuất bản), lịch xuất bản, lượt đọc realtime |
| QT-93 | `qt-93-rap-ngan-ha` | **Rạp Ngân Hà** | Lịch chiếu & bán vé | Media & Entertainment | A6 | Đen + đỏ nhung (`Bungee` + `Mulish`) | Lịch chiếu theo phòng, sơ đồ ghế, tỷ lệ lấp đầy |
| QT-94 | `qt-94-phong-thu-tim` | **Phòng Thu Tím** | Đặt phòng thu & dự án âm nhạc | Media & Entertainment | A6 | Tím + neon (`Unbounded` + `Space Mono`) | Đặt phòng thu, danh sách track theo dự án, chi phí |
| QT-95 | `qt-95-bao-tang-gom-viet` | **Bảo tàng Gốm Việt** | Kho & hồ sơ hiện vật | Arts & Culture | A4 | Đất nung + kem (`Cormorant SC` + `Lora`) | Hồ sơ hiện vật, vị trí trưng bày, quy trình cho mượn triển lãm |
| QT-96 | `qt-96-loi-dai-esports` | **Lôi Đài Esports** | Điều hành giải đấu | Sport & Outdoors | A2 | Đen + xanh neon (`Tourney` + `Chakra Petch`) | Nhánh đấu: nhập kết quả tự lan sang vòng sau; lịch trận; check-in đội |
| QT-97 | `qt-97-sao-mai-bong-da` | **Học viện Bóng Đá Sao Mai** | Quản lý cầu thủ trẻ | Sport & Outdoors | A3 | Xanh sân cỏ + trắng (`League Gothic` + `Barlow`) | Radar thể lực, giáo án buổi tập, kéo thả đội hình |
| QT-98 | `qt-98-pet-resort` | **Pet Resort** | Lưu trú thú cưng | Kids & Pets | A5 | Vàng + xanh (`Coiny` + `Nunito`) | Sơ đồ chuồng theo ngày, checklist chăm sóc, camera mô phỏng |
| QT-99 | `qt-99-me-be-yeu` | **Mẹ Bé Yêu** | Chuỗi mẹ & bé: khách hàng & tồn kho | Kids & Pets | A1 | Pastel xanh (`Quicksand` + `Overpass Mono`) | Theo dõi mẹ bầu theo tuần thai → gợi ý sản phẩm đúng giai đoạn |
| QT-100 | `qt-100-su-kien-lon` | **Sự Kiện Lớn** | Vận hành sự kiện | Media & Entertainment | A9 | Đen + vàng (`Big Shoulders Display` + `Geist Mono`) | Check-in QR theo cổng, sơ đồ chỗ ngồi, run-of-show đếm ngược |

---

## 4. Lộ trình (milestone nhỏ: làm → QA → sửa → chốt)

| Mốc | Việc | Xong khi |
|---|---|---|
| **M0 — Chuẩn bị** ✅ | (1) `?static` cho QT-01 + `deep` tải trang kèm `?static`. (2) Catalog: section Trang quản trị tự hiện bộ lọc theo ngành khi có hơn 12 trang, độc lập với bộ lọc landing. (Bỏ ý tách app shell thành đoạn tham khảo: các trang tham khảo thẳng QT-01, dễ hơn và không lệch nhau.) | QT-01: `deep` sạch ở `?static`; bộ lọc admin đã thử với 15 trang giả |
| **M1 — Pilot 3 trang** ✅ | QT-02 (A4), QT-13 (A9), QT-36 (A11): 3 archetype khác QT-01 nhất | Bạn duyệt ảnh chụp; chỉnh lại spec nếu chuẩn chưa đúng ý |
| **M2–M10 — Mỗi lần 1 nhóm** (nhóm 1–10 ✅ · 100/100 trang) | Làm các trang còn lại của từng nhóm theo thứ tự nhóm 1 → 10 | Mọi trang trong nhóm qua QA; `build-catalog` + `test-catalog` sạch; contact sheet cả nhóm đã xem |
| **M11 — Rà toàn bộ** | Contact sheet 100 trang cạnh nhau, tìm trang trùng bố cục/màu/font và làm lại | Không còn 2 trang nào nhìn như anh em sinh đôi |

Mỗi trang ghi `meta.json` **sau cùng**, chỉ khi đã qua QA (catalog bỏ qua thư mục chưa có `meta.json`). Nếu làm song song nhiều trang cùng lúc, mỗi luồng chỉ đụng thư mục `sites/qt-NN-*` của mình; `build-catalog` chạy một lần ở cuối nhóm.

Khối lượng: QT-01 dài 2.219 dòng. 99 trang ở mức này là việc lớn hơn cả 300 landing đang làm, nên đi theo nhóm, có pilot trước để chốt chuẩn rồi mới nhân rộng.
