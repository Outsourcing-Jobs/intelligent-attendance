---
name: ui-ux-pro-max
description: Skill thiết kế UI/UX đỉnh cao cho AI Assistant — Đặc trị giao diện xấu, tạo Design System sang trọng, hiện đại, hiệu ứng mượt mà. Dự án: Laravel + Livewire + Tailwind CSS (Woodcraft Management)
---

# UI/UX Pro Max — Design System & UI Revamp Skill

Skill này giúp AI kiến tạo giao diện **WOW ngay từ cái nhìn đầu tiên** — sang trọng, mượt mà, đồng bộ màu sắc. Đọc toàn bộ trước khi viết bất kỳ dòng code nào.

---

## 🎭 RULE #5: Làm UI Trông Như Người Design Thật — Không Phải AI

> Giao diện "AI style" = đều đều, đối xứng hoàn hảo, không có cá tính. Dưới đây là các kỹ thuật để phá vỡ cái nhìn đó.

### A. Typography — Dùng 2 Font với vai trò rõ ràng:
```html
<!-- Trong <head> — LUÔN nhúng 2 font này -->
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }          /* Body: modern, humanist */
    h1,h2,h3,h4,h5,h6 { font-family: 'Outfit', sans-serif; }       /* Heading: geometric, strong */
</style>
```

### B. Sidebar Active — Editorial Left Border (không dùng bg-color đồng đều):
```css
/* Thay vì bg-amber-100 nhàm chán, dùng left-border accent editorial */
.nav-active {
    background: linear-gradient(90deg, rgba(217,119,6,.12), rgba(217,119,6,.04)) !important;
    border-left: 3px solid #d97706 !important;
    color: #78350f !important;
    font-weight: 700 !important;
}
```

### C. Card Top Accent — 3px top border màu theo loại card:
```css
.card-amber  { border-top: 3px solid #f59e0b; }   /* Sản phẩm */
.card-emerald{ border-top: 3px solid #10b981; }   /* NVL */
.card-blue   { border-top: 3px solid #3b82f6; }   /* Đơn hàng */
.card-purple { border-top: 3px solid #8b5cf6; }   /* Sản xuất */
```

### D. Micro-details tạo cảm giác "cao cấp":
- **Scrollbar custom**: Width 5px, thumb hover amber → cảm giác polished
- **Stroke-width 1.75** cho SVG icon (thay 2) → mảnh hơn, tinh tế hơn
- **letter-spacing: -0.01em** cho heading lớn → look premium hơn
- **Font-feature-settings** `'cv02','cv03','cv04','cv11'` cho Plus Jakarta Sans → glyphs đẹp hơn
- **table tbody tr:hover** → `background: #fffbeb` (warm tint thay pure gray)

### E. Asymmetry rules — Phá vỡ sự đều đều:
```
❌ Không: padding: 20px (đều 4 chiều)
✅ Có:    padding: 20px 24px (top/bottom khác left/right)

❌ Không: gap: 16px (đều giữa mọi section)
✅ Có:    gap: 16px giữa cards, gap: 28px giữa sections

❌ Không: font-size: 14px (text body đều)
✅ Có:    labels: 10px uppercase tracked, body: 13px, heading: 15px bold, stat number: 28px black
```

### F. Checklist "Không phải AI":
- [ ] 2 font: Outfit (heading) + Plus Jakarta Sans (body) — không dùng single font
- [ ] Sidebar active dùng border-left accent, không phải bg tô đều
- [ ] Cards có top-border màu, không phải chỉ border đều 4 chiều
- [ ] Scrollbar custom (5px, amber hover)
- [ ] Table row hover dùng warm amber, không gray
- [ ] Icon stroke-width 1.75, không phải 2 đều đều
- [ ] Số liệu lớn dùng font-weight: 900, không phải 700

---

## 🚨 RULE #0: Layout Architecture — BẮT BUỘC ĐỌC TRƯỚC

> Sai layout = vỡ toàn bộ UI. **LUÔN dùng inline style cho offset**, không dùng Tailwind class cho các giá trị sau.

### Cấu trúc Layout Chuẩn

```
┌──────────────────────────────────────────────────┐  ← fixed, top:0, height:64px, z-index:50
│  TOPBAR: Logo + User Dropdown                    │
├─────────────┬────────────────────────────────────┤
│  SIDEBAR    │   MAIN CONTENT                     │
│  w:256px    │   padding-top: 64px                │
│  top: 64px  │   margin-left: 256px (sm+)         │
│  fixed      │                                    │
└─────────────┴────────────────────────────────────┘
```

### Template inline style chuẩn (copy nguyên xi):

```html
<!-- Topbar -->
<nav style="position:fixed;top:0;left:0;right:0;height:64px;z-index:50;"
     class="bg-white border-b border-slate-200 shadow-sm flex items-center">

<!-- Sidebar -->
<aside style="position:fixed;top:64px;left:0;width:256px;height:calc(100vh - 64px);z-index:40;overflow-y:auto;"
       class="transition-transform sm:translate-x-0 bg-white border-r border-slate-200">

<!-- Main content -->
<div style="padding-top:64px;" class="sm:ml-64">
    <div class="p-4 sm:p-6">...</div>
</div>
```

### Anti-patterns TUYỆT ĐỐI tránh:

| ❌ Sai | ✅ Đúng | Hậu quả nếu sai |
|---|---|---|
| `class="fixed top-16"` | `style="top:64px"` | top-16 JIT miss → sidebar đè navbar |
| `class="pt-16"` + inner `class="p-4"` | `style="padding-top:64px"` riêng div | p-4 override pt-16 → content bị che |
| `class="h-[calc(100vh-4rem)]"` | `style="height:calc(100vh - 64px)"` | Arbitrary JIT miss → sidebar sai chiều cao |
| Navigation render `<nav>` | Navigation chỉ render `<x-dropdown>` | Double navbar |
| SVG `<path d="...">` trong `<a>` | Dùng emoji 📦 🪵 thay thế | Ký tự bị escape → hiển thị `>` khổng lồ |
| Modal `z-50` | Modal `z-[60]` hoặc `style="z-index:60"` | Modal bị ẩn dưới navbar |

---

## 🎨 RULE #1: Color System — Bảng Màu Chính Xác

> **LUÔN dùng hex/rgba trong inline style** — không phụ thuộc Tailwind compile.

### Brand Colors (Luxury Woodcraft):

```
Background:    #f8fafc  (slate-50 — canvas nền trang)
Surface:       #ffffff  (white — nền card/panel)
Border:        #e2e8f0  (slate-200 — viền mặc định)
Border hover:  #fcd34d  (amber-300 — viền khi hover)

Text primary:  #1e293b  (slate-800 — tiêu đề, số liệu)
Text body:     #475569  (slate-600 — nội dung)
Text muted:    #94a3b8  (slate-400 — label, placeholder)
Text amber:    #b45309  (amber-700 — link, highlight)

Brand Primary: #78350f  (amber-900 — topbar logo, heading)
Brand Accent:  #f59e0b  (amber-400 — CTA button, active)
Brand Dark:    #1c0a00  (near-black walnut — banner bg)
```

### Gradient Presets (Icon Boxes & CTA):

```
Amber/Gold:   linear-gradient(135deg, #f59e0b, #b45309)   + box-shadow: 0 4px 12px rgba(217,119,6,.30)
Emerald:      linear-gradient(135deg, #10b981, #065f46)   + box-shadow: 0 4px 12px rgba(16,185,129,.30)
Blue/Indigo:  linear-gradient(135deg, #3b82f6, #4338ca)   + box-shadow: 0 4px 12px rgba(59,130,246,.30)
Purple:       linear-gradient(135deg, #8b5cf6, #6d28d9)   + box-shadow: 0 4px 12px rgba(139,92,246,.30)
Rose:         linear-gradient(135deg, #f43f5e, #be123c)   + box-shadow: 0 4px 12px rgba(244,63,94,.30)
Dark Banner:  linear-gradient(135deg, #1c0a00 0%, #78350f 50%, #292524 100%)
```

### Status Badge Colors:

```
Chờ xử lý:     background:#fffbeb; color:#92400e; border:1px solid #fde68a
Đang sản xuất:  background:#eef2ff; color:#3730a3; border:1px solid #c7d2fe
Hoàn thành:     background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0
Cảnh báo:       background:#fff1f2; color:#9f1239; border:1px solid #fecdd3
```

---

## ✨ RULE #2: Smooth UI — Công Thức Làm Giao Diện Mượt Mà

> **Mượt mà = Transition + Shadow + Transform kết hợp đúng chỗ.** Không cần JS phức tạp.

### A. CSS Transition trên element (dùng inline style):

```html
<!-- Mọi interactive element đều cần transition -->
<div style="transition: all 0.2s ease;">
```

### B. Card Hover Effect (KHÔNG dùng Tailwind hover:) — dùng JS onmouseover:

```html
<div style="...base styles...;transition:all .2s ease;"
     onmouseover="this.style.boxShadow='0 8px 24px rgba(217,119,6,.18)';
                  this.style.borderColor='#fcd34d';
                  this.style.transform='translateY(-2px)'"
     onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,.08)';
                 this.style.borderColor='#e2e8f0';
                 this.style.transform='translateY(0)'">
```

### C. Button Hover Effect:

```html
<a href="#"
   style="...;transition:all .15s;"
   onmouseover="this.style.transform='scale(1.04)';this.style.opacity='.9'"
   onmouseout="this.style.transform='scale(1)';this.style.opacity='1'">
   Click Me
</a>
```

### D. Glow Effect trên Icon Box:

```html
<!-- Vòng glow blur phía sau icon, tạo depth -->
<div style="position:absolute;right:-12px;bottom:-12px;width:72px;height:72px;
            background:rgba(217,119,6,.08);border-radius:50%;filter:blur(16px);">
</div>
```

### E. Shadow Scale System:

```
Mặc định:   box-shadow: 0 1px 3px rgba(0,0,0,.08)
Hover card: box-shadow: 0 8px 24px rgba(COLOR,.18)   ← dùng màu tương ứng card
Elevated:   box-shadow: 0 4px 12px rgba(COLOR,.30)   ← icon box, CTA button
Banner:     box-shadow: 0 8px 32px rgba(120,53,15,.35)
```

### F. Border Radius System:

```
Nút nhỏ:      border-radius: 8px
Card/Panel:    border-radius: 16px
Banner/Hero:   border-radius: 20px
Icon Box:      border-radius: 12px
Avatar/Badge:  border-radius: 10px
```

---

## 📐 RULE #3: Spacing & Layout — Thở Đều Không Dính

> **KHÔNG dùng Tailwind `space-y-*` hoặc `gap-*` cho layout chính** vì JIT có thể miss. Dùng inline style.

### Section Spacing (khoảng cách giữa các phần):

```html
<!-- Wrapper các section chính -->
<div style="display:flex;flex-direction:column;gap:28px;">
    <!-- Section 1: Cards -->
    <div>...</div>
    <!-- Section 2: Banner -->
    <div>...</div>
</div>
```

### Card Grid Layout:

```html
<!-- Responsive grid tự động, không cần Tailwind breakpoint -->
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
    <div>Card 1</div>
    <div>Card 2</div>
</div>
```

### Inner Padding:

```
Card nội dung:    padding: 20px
Banner:           padding: 24px 28px
Page content:     padding: 16px (mobile) / 24px (desktop)
Table cell:       padding: 12px 16px
```

---

## 🛠️ RULE #4: UI Block Mẫu Chuẩn

### Stat Metric Card (Inline Style — Production Ready):

```html
<a href="/route"
   style="position:relative;overflow:hidden;display:block;padding:20px;background:#fff;
          border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);
          text-decoration:none;transition:all .2s;"
   onmouseover="this.style.boxShadow='0 8px 24px rgba(217,119,6,.18)';this.style.borderColor='#fcd34d';this.style.transform='translateY(-2px)'"
   onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,.08)';this.style.borderColor='#e2e8f0';this.style.transform='translateY(0)'">

    {{-- Glow --}}
    <div style="position:absolute;right:-12px;bottom:-12px;width:72px;height:72px;background:rgba(217,119,6,.08);border-radius:50%;filter:blur(16px);"></div>

    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div style="flex:1;min-width:0;">
            <p style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8;margin:0 0 6px;">LABEL</p>
            <p style="font-size:28px;font-weight:900;color:#1e293b;margin:0 0 4px;line-height:1.1;">128</p>
            <p style="font-size:11px;font-weight:600;color:#b45309;margin:0;">Mô tả ngắn</p>
        </div>
        {{-- Icon Box --}}
        <div style="width:44px;height:44px;flex-shrink:0;background:linear-gradient(135deg,#f59e0b,#b45309);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(217,119,6,.3);">
            📦
        </div>
    </div>
</a>
```

### Dark Banner (Inline Style):

```html
<div style="padding:24px 28px;background:linear-gradient(135deg,#1c0a00 0%,#78350f 50%,#292524 100%);border-radius:20px;box-shadow:0 8px 32px rgba(120,53,15,.35);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;">
    <div>
        <h3 style="font-size:15px;font-weight:800;color:#fff;margin:0 0 6px;">Tiêu đề Banner</h3>
        <p style="font-size:12px;color:rgba(253,230,138,.75);line-height:1.6;margin:0;">Mô tả nội dung...</p>
    </div>
    <div style="display:flex;gap:10px;">
        <a href="#" style="padding:10px 18px;background:#f59e0b;color:#1c0a00;font-size:12px;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 4px 12px rgba(245,158,11,.4);"
           onmouseover="this.style.background='#fbbf24';this.style.transform='scale(1.04)'"
           onmouseout="this.style.background='#f59e0b';this.style.transform='scale(1)'">
            📦 CTA chính
        </a>
        <a href="#" style="padding:10px 18px;background:rgba(255,255,255,.12);color:#fff;font-size:12px;font-weight:700;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,.2);"
           onmouseover="this.style.background='rgba(255,255,255,.2)'"
           onmouseout="this.style.background='rgba(255,255,255,.12)'">
            🪵 CTA phụ
        </a>
    </div>
</div>
```

---

## 🏁 Checklist Đánh Giá Trước Khi Commit:

- [ ] Layout: Topbar, Sidebar, Main dùng **inline style** — không Tailwind offset class.
- [ ] Màu sắc: Icon box có gradient + colored shadow. Không dùng màu plain (plain blue, plain red).
- [ ] Spacing: Sections dùng `gap:28px` flexbox. Cards dùng CSS grid `auto-fit`.
- [ ] Smooth: Mọi interactive element có `transition: all .2s ease` và hover effect.
- [ ] Navigation component: Chỉ render `<x-dropdown>`, KHÔNG có `<nav>` wrapper.
- [ ] Modal: z-index >= 60. SVG trong `<a>`: dùng emoji thay thế.
- [ ] Banner: Dark gradient với glow shadow, text amber/ivory rõ ràng.
