# 🏥 نظام إدارة العيادة - Orthopedic Clinic Management System

نظام متكامل لإدارة عيادة العظام يدعم اللغة العربية بالكامل مع واجهة مستخدم حديثة وسهلة الاستخدام.

## ✨ المميزات

### للأطباء
- **لوحة تحكم شاملة**: عرض مواعيد اليوم وإحصائيات سريعة
- **إدارة المواعيد**: عرض جميع المواعيد حسب التاريخ
- **سجل المرضى**: البحث عن المرضى وعرض السجلات الطبية الكاملة
- **الجدول الزمني**: إدارة أوقات العمل المتاحة
- **الملف الشخصي**: تحديث معلومات الطبيب

### للمرضى (قيد التطوير)
- حجز المواعيد
- عرض المواعيد المحجوزة
- السجل الطبي
- الوصفات الطبية
- الأشعة والتحاليل

## 🚀 البدء السريع

### المتطلبات المسبقة
- Node.js (v16 or higher)
- npm أو yarn
- Backend API running on `http://localhost:5000`

### التثبيت

1. **تثبيت المكتبات**
```bash
cd clinic-frontend
npm install
```

2. **تشغيل التطبيق**
```bash
npm run dev
```

3. **فتح المتصفح**
```
http://localhost:5173
```

## 📁 هيكل المشروع

```
clinic-frontend/
├── src/
│   ├── api/                      # خدمات الاتصال بالخادم
│   │   ├── apiClient.js          # إعدادات Axios
│   │   ├── authService.js        # خدمات المصادقة
│   │   ├── doctorService.js      # خدمات الطبيب
│   │   ├── patientService.js     # خدمات المريض
│   │   ├── appointmentService.js # خدمات المواعيد
│   │   ├── consultationService.js # خدمات الكشوفات
│   │   ├── prescriptionService.js # خدمات الوصفات
│   │   ├── referralService.js    # خدمات التحويلات
│   │   └── notificationService.js # خدمات الإشعارات
│   │
│   ├── components/               # المكونات القابلة لإعادة الاستخدام
│   │   ├── common/               # مكونات عامة
│   │   │   ├── Button.jsx        # زر مخصص
│   │   │   ├── Input.jsx         # حقل إدخال
│   │   │   ├── Card.jsx          # بطاقة
│   │   │   └── Spinner.jsx       # مؤشر التحميل
│   │   ├── layout/               # مكونات التخطيط
│   │   │   ├── Navbar.jsx        # شريط التنقل العلوي
│   │   │   ├── Sidebar.jsx       # القائمة الجانبية
│   │   │   └── DoctorLayout.jsx  # تخطيط الطبيب
│   │   └── medical/              # مكونات طبية
│   │
│   ├── context/                  # React Context
│   │   └── AuthContext.jsx       # سياق المصادقة
│   │
│   ├── pages/                    # صفحات التطبيق
│   │   ├── auth/                 # صفحات المصادقة
│   │   │   ├── Login.jsx         # تسجيل الدخول
│   │   │   └── Register.jsx      # إنشاء حساب
│   │   ├── doctor/               # صفحات الطبيب
│   │   │   ├── DoctorDashboard.jsx # لوحة التحكم
│   │   │   ├── Appointments.jsx    # المواعيد
│   │   │   ├── Patients.jsx        # المرضى
│   │   │   ├── PatientDetails.jsx  # تفاصيل المريض
│   │   │   ├── Schedule.jsx        # الجدول
│   │   │   └── Profile.jsx         # الملف الشخصي
│   │   └── patients/             # صفحات المريض (قيد التطوير)
│   │
│   ├── styles/                   # الأنماط العامة
│   │   └── global.css            # CSS العام
│   │
│   ├── utils/                    # دوال مساعدة
│   │
│   ├── App.jsx                   # مكون التطبيق الرئيسي
│   └── main.jsx                  # نقطة الدخول
│
└── package.json
```

## 🔧 الإعدادات

### تغيير رابط الخادم

في ملف `src/api/apiClient.js`، قم بتغيير `API_BASE_URL`:

```javascript
const API_BASE_URL = 'http://your-backend-url:5000/api';
```

### الألوان والسمات

يستخدم التطبيق الألوان التالية:

- **الأزرق الأساسي**: `#2563eb`
- **الأخضر للنجاح**: `#16a34a`
- **الأحمر للخطر**: `#dc2626`
- **البرتقالي للتحذير**: `#f59e0b`
- **الرمادي الثانوي**: `#6b7280`

لتغيير الألوان، عدل ملفات المكونات في `src/components/common/`.

## 🎯 نقاط الدخول للتطبيق

### تسجيل الدخول
- **الرابط**: `/login`
- **الوصف**: صفحة تسجيل الدخول للمستخدمين المسجلين

### إنشاء حساب جديد
- **الرابط**: `/register`
- **الوصف**: إنشاء حساب جديد (طبيب أو مريض)

### لوحة تحكم الطبيب
- **الرابط**: `/doctor/dashboard`
- **الوصف**: لوحة التحكم الرئيسية للطبيب

### إدارة المواعيد
- **الرابط**: `/doctor/appointments`
- **الوصف**: عرض وإدارة جميع المواعيد

### سجل المرضى
- **الرابط**: `/doctor/patients`
- **الوصف**: البحث عن المرضى وعرض سجلاتهم

### الجدول الزمني
- **الرابط**: `/doctor/schedule`
- **الوصف**: إدارة أوقات العمل المتاحة

### الملف الشخصي
- **الرابط**: `/doctor/profile`
- **الوصف**: عرض وتحديث معلومات الطبيب

## 🔐 المصادقة والأمان

يستخدم التطبيق JWT (JSON Web Tokens) للمصادقة:

1. يتم تخزين الرمز المميز (Token) في `localStorage`
2. يتم إرسال الرمز مع كل طلب API في الـ Header
3. ينتهي صلاحية الرمز تلقائياً ويتم إعادة التوجيه لصفحة الدخول

## 📊 هيكل البيانات

### المستخدم (User)
```javascript
{
  userId: number,
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  role: 'Doctor' | 'Patient'
}
```

### الموعد (Appointment)
```javascript
{
  appointmentId: number,
  doctorName: string,
  patientName: string,
  appointmentDate: string,
  startTime: string,
  endTime: string,
  status: 'Scheduled' | 'Confirmed' | 'CheckedIn' | 'InProgress' | 'Completed' | 'Cancelled',
  reasonForVisit: string
}
```

### المريض (Patient)
```javascript
{
  patientId: number,
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth: string,
  gender: 'Male' | 'Female',
  address: string,
  phoneNumber: string,
  emergencyContact: string
}
```

### السجل الطبي (MedicalRecord)
```javascript
{
  allergies: string,
  chronicConditions: string,
  currentMedications: string,
  surgicalHistory: string,
  familyHistory: string
}
```

## 🎨 تصميم الواجهة

### المبادئ
- **بسيط ونظيف**: تصميم بسيط وسهل الاستخدام
- **عربي بالكامل**: جميع النصوص والاتجاهات من اليمين لليسار
- **متجاوب**: يعمل على جميع أحجام الشاشات
- **ألوان أساسية**: استخدام ألوان محدودة ومتناسقة

### الهوامش والمسافات
- هوامش كبيرة بين الأقسام: `32px`
- مسافات بين العناصر: `16px`, `24px`
- حواف دائرية: `8px`, `12px`, `16px`

## 🛠️ التقنيات المستخدمة

- **React 18**: مكتبة الواجهة الأمامية
- **Vite**: أداة البناء والتطوير
- **React Router v6**: التنقل بين الصفحات
- **Axios**: الاتصال بخادم API
- **Styled Components**: تنسيق المكونات
- **React Hot Toast**: إشعارات منبثقة
- **Heroicons**: أيقونات حديثة
- **date-fns**: تنسيق التواريخ

## 📝 ملاحظات التطوير

### إضافة صفحة جديدة

1. أنشئ ملف الصفحة في `src/pages/doctor/YourPage.jsx`
2. أضف componente الصفحة
3. استورد الصفحة في `App.jsx`
4. أضف route جديد
5. أضف رابط في `Sidebar.jsx`

### إضافة خدمة API جديدة

1. أنشئ ملف خدمة جديد في `src/api/yourService.js`
2. استخدم `apiClient` للاتصال
3. صدّر الدوال المطلوبة
4. أضف الخدمة إلى `src/api/index.js`

### معالجة الأخطاء

جميع الطلبات API مغلفة بـ try-catch وتعرض إشعارات خطأ باستخدام `toast.error()`.

## 🔄 التكامل مع الخادم

يتكامل التطبيق مع خادم ASP.NET Core Backend عبر REST API.

### نقاط الاتصال (Endpoints)

```
POST   /api/auth/login          - تسجيل الدخول
POST   /api/auth/register       - إنشاء حساب
GET    /api/auth/profile        - الملف الشخصي

GET    /api/doctors             - قائمة الأطباء
GET    /api/doctors/profile     - ملف الطبيب
PUT    /api/doctors/profile     - تحديث الملف
GET    /api/doctors/appointments/today    - مواعيد اليوم
GET    /api/doctors/appointments          - المواعيد حسب التاريخ
GET    /api/doctors/patients/search       - البحث عن المرضى
GET    /api/doctors/patients/:id          - تفاصيل المريض
POST   /api/doctors/schedule    - إضافة جدول
GET    /api/doctors/schedule    - الجداول
DELETE /api/doctors/schedule/:id - حذف جدول

GET    /api/appointments/available-slots  - الأوقات المتاحة
POST   /api/appointments/book   - حجز موعد
PUT    /api/appointments/reschedule - إعادة الجدولة
PUT    /api/appointments/cancel   - إلغاء موعد
GET    /api/appointments/my-appointments - مواعيدي
```

## 👥 فريق العمل

تم تطوير هذا النظام كجزء من مشروع نظام المعلومات البيومترية للمستشفيات.

## 📄 الترخيص

جميع الحقوق محفوظة © 2026

---

**تم التطوير بواسطة ❤️**
