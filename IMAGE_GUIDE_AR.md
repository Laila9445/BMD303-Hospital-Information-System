# دليل إضافة الصور - Image Integration Guide

## 📁 مواقع تخزين الصور

### 1. مجلد `src/assets/images/` (موصى به)
**للصور المستخدمة في المكونات**

```
physio_frontend/
└── src/
    └── assets/
        └── images/
            ├── logo.png
            ├── backgrounds/
            ├── icons/
            └── photos/
```

**كيفية الاستخدام:**
```jsx
// استيراد الصورة
import clinicLogo from '../../assets/images/logo.png';
import backgroundImg from '../../assets/images/backgrounds/login-bg.jpg';

// استخدام في المكون
function Login() {
  return (
    <div>
      <img src={clinicLogo} alt="Clinic Logo" />
      <div style={{ backgroundImage: `url(${backgroundImg})` }}></div>
    </div>
  );
}
```

### 2. مجلد `public/images/`
**للصور الكبيرة أو التي تحتاج وصول مباشر**

```
physio_frontend/
└── public/
    └── images/
        ├── logo.png
        └── photos/
```

**كيفية الاستخدام:**
```jsx
// استخدام مباشر بدون استيراد
<img src="/images/logo.png" alt="Logo" />
<div style={{ backgroundImage: 'url(/images/backgrounds/pattern.jpg)' }}></div>
```

## 🎯 أفضل الممارسات

### ✅ استخدم `src/assets/images/` عندما:
- صور صغيرة (أيقونات، شعارات)
- صور مستخدمة في مكونات React
- تريد تحسين الأداء (Vite سيقوم بضغطها تلقائياً)

### ✅ استخدم `public/images/` عندما:
- صور كبيرة الحجم
- صور يحتاجها المستخدمون للتحميل
- صور ديناميكية تتغير بانتظام

## 📐 تنظيم مقترح للصور

```
src/assets/images/
├── logo/                    # الشعارات
│   ├── logo-primary.png     # الشعار الأساسي
│   ├── logo-white.png       # شعار أبيض
│   └── favicon.ico
│
├── backgrounds/             # الخلفيات
│   ├── login-bg.jpg         # خلفية تسجيل الدخول
│   ├── dashboard-bg.png     # خلفية لوحة التحكم
│   └── pattern.svg          # نمط متكرر
│
├── icons/                   # الأيقونات
│   ├── physio-icon.svg      # أيقونة العلاج الطبيعي
│   ├── appointment-icon.png # أيقونة المواعيد
│   ├── patient-icon.svg     # أيقونة المريض
│   └── treatment-icon.png   # أيقونة العلاج
│
├── photos/                  # الصور الفوتوغرافية
│   ├── staff/               # صور الموظفين
│   │   ├── dr-ahmed.jpg
│   │   └── dr-fatima.jpg
│   │
│   ├── clinic/              # صور العيادة
│   │   ├── reception.jpg
│   │   ├── treatment-room.jpg
│   │   └── equipment.jpg
│   │
│   └── equipment/           # صور الأجهزة
│       ├── ultrasound.jpg
│       └── exercise-balls.jpg
│
└── illustrations/           # الرسومات التوضيحية
    ├── welcome.svg
    └── success.svg
```

## 🔧 تحديث صفحة تسجيل الدخول بصورتك

إذا أردت استخدام صورتك الخاصة كخلفية لصفحة تسجيل الدخول:

### الخطوة 1: ضع الصورة في المكان الصحيح
```
src/assets/images/backgrounds/login-bg.jpg
```

### الخطوة 2: عدّل ملف `Login.jsx`
```jsx
import loginBackground from '../../assets/images/backgrounds/login-bg.jpg';

// في مكون Login
<div 
  className="login-background"
  style={{
    backgroundImage: `url(${loginBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
></div>
```

## 🎨 إضافة شعار العيادة

### الخطوة 1: احفظ الشعار
```
src/assets/images/logo/logo-primary.png
```

### الخطوة 2: استخدمه في المكونات
```jsx
import logo from '../../assets/images/logo/logo-primary.png';

// في Login.jsx أو Dashboard.jsx
<img src={logo} alt="Physiotherapy Clinic Logo" className="logo" />
```

### الخطوة 3: أضف تنسيق CSS
```css
.logo {
  width: 200px;
  height: auto;
  margin-bottom: 20px;
}
```

## 📊 أحجام الصور الموصى بها

| نوع الصورة | الحجم المقترح | الصيغة | ملاحظات |
|------------|---------------|--------|----------|
| الشعار | 200x200px | PNG, SVG | خلفية شفافة |
| خلفية كاملة | 1920x1080px | JPG | ضغط عالي |
| أيقونات | 32x32px - 64x64px | SVG, PNG | واضحة على جميع الشاشات |
| صور الموظفين | 300x300px | JPG | مربعة |
| صور العيادة | 800x600px | JPG | للألبومات |

## 🚀 تحسين الأداء

### ضغط الصور
استخدم أدوات مثل:
- [TinyPNG](https://tinypng.com/) - لضغط PNG/JPG
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - لضغط SVG

### تحويلات Vite التلقائية
Vite سيقوم تلقائياً بـ:
- ضغط الصور في الإنتاج
- إنشاء أحجام مختلفة
- استخدام WebP عندما يكون مدعوماً

## 💡 أمثلة عملية

### مثال 1: إضافة خلفية مخصصة
```jsx
// Login.jsx
import customBg from '../../assets/images/backgrounds/my-custom-bg.jpg';

const Login = () => {
  return (
    <div className="login-container" style={{
      backgroundImage: `url(${customBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* محتوى تسجيل الدخول */}
    </div>
  );
};
```

### مثال 2: معرض صور العيادة
```jsx
// ClinicGallery.jsx
import reception from '../../assets/images/clinic/reception.jpg';
import treatmentRoom from '../../assets/images/clinic/treatment-room.jpg';
import equipment from '../../assets/images/clinic/equipment.jpg';

const ClinicGallery = () => {
  return (
    <div className="gallery">
      <img src={reception} alt="Reception Area" />
      <img src={treatmentRoom} alt="Treatment Room" />
      <img src={equipment} alt="Equipment" />
    </div>
  );
};

export default ClinicGallery;
```

### مثال 3: بطاقات الموظفين مع صور
```jsx
// StaffCard.jsx
const StaffCard = ({ name, role, photo }) => {
  return (
    <div className="staff-card">
      <img src={photo} alt={name} className="staff-photo" />
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
};

// استخدام
import drAhmed from '../../assets/images/staff/dr-ahmed.jpg';

<StaffCard 
  name="د. أحمد محمد" 
  role="أخصائي علاج طبيعي" 
  photo={drAhmed} 
/>
```

## 🎯 خطوات سريعة للبدء

1. **انسخ صورك إلى المجلد المناسب**
   ```
   انسخ الصور إلى: physio_frontend/src/assets/images/
   ```

2. **استورد الصور في مكون React**
   ```jsx
   import myImage from '../../assets/images/my-image.jpg';
   ```

3. **استخدم الصور في JSX**
   ```jsx
   <img src={myImage} alt="Description" />
   ```

4. **شغّل التطبيق**
   ```bash
   npm run dev
   ```

## ❓ أسئلة شائعة

### س: كيف أضيف صورة متحركة (GIF)?
ج: بنفس الطريقة، لكن استخدم مجلد `images/` مباشرة:
```jsx
import loadingGif from '../../assets/images/loading.gif';
<img src={loadingGif} alt="Loading" />
```

### س: الصور لا تظهر، ما المشكلة؟
تحقق من:
1. مسار الصورة صحيح
2. اسم الملف صحيح (حساس لحالة الأحرف)
3. الصورة موجودة في المجلد الصحيح

### س: كيف أستخدم صور WebP؟
ج: فقط احفظ الصورة بصيغة WebP واستخدمها عادة:
```jsx
import image from '../../assets/images/photo.webp';
```

---

**جاهز لإضافة صورك!** 🎨

إذا كنت تحتاج مساعدة في تطبيق صور معينة، أخبرني! 😊
