# 🚀 دليل الإعداد السريع - Orthopedic Clinic System

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت التالي:

1. **Node.js** (الإصدار 16 أو أحدث)
   - تحميل من: https://nodejs.org/
   
2. **.NET 6+ SDK** (للخادم)
   - تحميل من: https://dotnet.microsoft.com/download
   
3. **SQL Server** (قاعدة البيانات)
   - SQL Server Express أو أي إصدار آخر

## الخطوة 1: إعداد الخادم (Backend)

```bash
# الانتقال لمجلد الخادم
cd temp_backend_analysis/backend

# استعادة حزم NuGet
dotnet restore

# تحديث ملف الإعدادات (اختياري)
# عدل appsettings.json لتكوين قاعدة البيانات

# تشغيل الترحيل (Migrations) لإنشاء قاعدة البيانات
dotnet ef database update

# تشغيل الخادم
dotnet run
```

الخادم سيعمل الآن على: `http://localhost:5000`

## الخطوة 2: إعداد الواجهة (Frontend)

```bash
# الانتقال لمجلد الواجهة
cd clinic-frontend

# تثبيت المكتبات
npm install

# تحديث رابط الخادم (إذا لزم الأمر)
# افتح src/api/apiClient.js وغير API_BASE_URL إذا كان مختلفاً

# تشغيل التطبيق
npm run dev
```

التطبيق سيعمل الآن على: `http://localhost:5173`

## الخطوة 3: اختبار النظام

### 1. إنشاء حساب طبيب جديد

افتح المتصفح وانتقل إلى:
```
http://localhost:5173/register
```

أدخل البيانات:
- الاسم الأول: محمد
- اسم العائلة: أحمد
- البريد الإلكتروني: doctor@clinic.com
- رقم الهاتف: +201234567890
- كلمة المرور: 123456
- تأكيد كلمة المرور: 123456
- الصلاحية: دكتور
- النوع: ذكر
- تاريخ الميلاد: اختر أي تاريخ

اضغط "إنشاء حساب"

### 2. تسجيل الدخول

بعد إنشاء الحساب، ستنتقل تلقائياً للوحة التحكم.

أو يمكنك الذهاب إلى:
```
http://localhost:5173/login
```

وسجل الدخول بالبيانات التي أنشأتها.

### 3. استكشاف المميزات

بعد تسجيل الدخول يمكنك:

- **لوحة التحكم**: عرض مواعيد اليوم وإحصائيات
- **المواعيد**: عرض جميع المواعيد حسب التاريخ
- **المرضى**: البحث عن المرضى وعرض سجلاتهم الطبية
- **الجدول**: إضافة أوقات العمل المتاحة
- **الملف الشخصي**: تحديث معلوماتك

## حل المشاكل الشائعة

### مشكلة: خطأ CORS

إذا حصلت على خطأ CORS، تأكد من أن الخادم يسمح بـ CORS في `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

app.UseCors("AllowAll");
```

### مشكلة: قاعدة البيانات غير موجودة

```bash
# في مجلد backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### مشكلة: الواجهة لا تتصل بالخادم

1. تأكد أن الخادم يعمل على `http://localhost:5000`
2. تحقق من `src/api/apiClient.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```
3. تأكد من عدم وجود مانع اتصال (Firewall)

### مشكلة: الصفحة البيضاء

1. افتح أدوات المطور في المتصفح (F12)
2. تحقق من وجود أخطاء في Console
3. تأكد من تثبيت جميع المكتبات: `npm install`

## أدوات مساعدة

### عرض قاعدة البيانات

استخدم SQL Server Management Studio أو Azure Data Studio لعرض جداول قاعدة البيانات.

### اختبار API

استخدم Postman أو الأداة المماثلة لاختبار نقاط الاتصال:

```bash
# تسجيل دخول
POST http://localhost:5000/api/auth/login
{
  "email": "doctor@clinic.com",
  "password": "123456"
}

# الحصول على الملف الشخصي
GET http://localhost:5000/api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### تنظيف المشروع

```bash
# Backend
dotnet clean

# Frontend  
rm -rf node_modules package-lock.json
npm install
```

## نصائح التطوير

### 1. استخدام React DevTools

ثبت إضافة React DevTools في متصفحك لتسهيل تطوير واجهة React.

### 2. Hot Reload

كلا الخادم والواجهة يدعمان Hot Reload:
- التعديلات على الكود يتم تطبيقها فوراً
- لا حاجة لإعادة التشغيل

### 3. Logs و Debugging

**Backend logs:**
تظهر في terminal الذي شغلت فيه `dotnet run`

**Frontend logs:**
افتح Console في المتصفح (F12)

### 4. Performance

للحصول على أفضل أداء:
- استخدم Production build للنشر:
  ```bash
  npm run build
  ```
- فعل gzip compression في الخادم
- استخدم caching للـ static files

## النشر (Deployment)

### نشر محلي (Development)

كما هو موضح أعلاه.

### نشر إنتاجي (Production)

**Frontend:**
```bash
npm run build
# انسخ محتويات مجلد dist إلى خادم الويب
```

**Backend:**
```bash
dotnet publish -c Release
# انسخ محتويات مجلد publish إلى الخادم
```

### متغيرات البيئة

في الإنتاج، استخدم متغيرات البيئة:

**Backend (appsettings.Production.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=ClinicDB;..."
  },
  "JwtSettings": {
    "SecretKey": "your-production-secret-key"
  }
}
```

**Frontend (.env.production):**
```
VITE_API_BASE_URL=https://api.yourclinic.com/api
```

## المجتمع والدعم

للحصول على المساعدة:
- راجع ملف `README.md` للحصول على معلومات عامة
- تحقق من الكود في `src/api/` لفهم الاتصال بالخادم
- راجع التعليقات في الكود (Comments)

---

**تم التطوير بواسطة ❤️**

**نظام إدارة عيادة العظام المتكامل**
