# Radiology Center Security Architecture

## 🔐 Security Overview

This system implements **enterprise-grade security** for handling sensitive medical data (HIPAA-compliant design).

---

## 📊 Data Protection Summary

| Data Type | Protection Method | Reversible? | Why? |
|-----------|------------------|-------------|------|
| **Passwords** | bcrypt Hashing | ❌ No | Never need to retrieve original password |
| **Medical Reports** | AES-256 (Fernet) Encryption | ✅ Yes | Need to display reports to authorized users |
| **Medical Images** | AES-256 (Fernet) File Encryption | ✅ Yes | Need to view/download images |
| **JWT Tokens** | JWT Signature (HS256) | N/A | Authentication, not data storage |
| **Patient Info** | Database Access Control | N/A | Protected by authentication |

---

## 🔒 Hashing vs Encryption

### **Hashing (Passwords)**
```python
# One-way function - IRREVERSIBLE
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password
hashed = pwd_context.hash("MySecret123!")
# Result: $2b$12$... (cannot be reversed)

# Verify password
pwd_context.verify("MySecret123!", hashed)  # True
pwd_context.verify("WrongPassword", hashed)  # False
```

**Why hashing for passwords?**
- Even if database is hacked, attackers cannot get passwords
- No legitimate reason to know user's password
- Only need to verify, not retrieve

---

### **Encryption (Reports & Images)**
```python
# Two-way function - REVERSIBLE with key
from cryptography.fernet import Fernet

# Encrypt data
encrypted = cipher.encrypt(b"Patient has pneumonia")
# Result: gAAAAAB... (can be decrypted with key)

# Decrypt data
decrypted = cipher.decrypt(encrypted)
# Result: b"Patient has pneumonia"
```

**Why encryption for medical data?**
- Doctors need to READ the actual reports
- Images must be viewable
- Only authorized users can decrypt
- Protects data at rest (in database/filesystem)

---

## 🛡️ Security Layers

### 1. **Authentication Layer**
- JWT tokens (Access + Refresh)
- Access token: 30 minutes expiry
- Refresh token: 7 days expiry
- Bcrypt password hashing (12 rounds)

### 2. **Authorization Layer**
- Role-based access control (RBAC)
- Roles: `user` < `radiologist` < `admin`
- Hierarchical permission system

### 3. **Data Encryption Layer**
- AES-256 symmetric encryption (Fernet)
- Reports encrypted before database storage
- Images encrypted before file system storage
- Decryption only happens for authorized requests

### 4. **API Security**
- CORS protection
- Input validation (Pydantic)
- SQL injection prevention (SQLAlchemy ORM)
- File type validation for uploads

---

## 📁 Encrypted File Storage

```
encrypted_images/
├── enc_a1b2c3d4-e5f6.jpeg      # Encrypted image
├── enc_f7g8h9i0-j1k2.dcm       # Encrypted DICOM
└── enc_l3m4n5o6-p7q8.png       # Encrypted PNG
```

- Files stored with `enc_` prefix (encrypted)
- Temporary decrypted files created on download only
- Original unencrypted files deleted immediately after encryption

---

## 🔑 Key Management

### Current (Development):
```python
SECRET_KEY = secrets.token_urlsafe(32)  # Generated at startup
```

### Production (Recommended):
```env
# .env file
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/db
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Best Practices:**
1. Store SECRET_KEY in environment variables
2. Use different keys for dev/staging/production
3. Rotate keys periodically (requires re-encryption)
4. Use HSM (Hardware Security Module) for enterprise

---

## 🚀 API Security Examples

### Protected Endpoints:
```python
# Requires authentication
@router.get("/patients")
def get_patients(current_user: User = Depends(get_current_user)):
    ...

# Requires radiologist role or higher
@router.post("/reports")
def create_report(current_user: User = Depends(require_role("radiologist"))):
    ...

# Requires admin role
@router.delete("/images/{id}")
def delete_image(current_user: User = Depends(require_role("admin"))):
    ...
```

### Request Flow:
```
Client Request
    ↓
[1] JWT Token Validation
    ↓
[2] User Authentication Check
    ↓
[3] Role Authorization Check
    ↓
[4] Database Query
    ↓
[5] Decrypt Sensitive Data
    ↓
[6] Return Response
```

---

## ✅ Security Checklist

- [x] Password hashing with bcrypt
- [x] JWT authentication
- [x] Role-based access control
- [x] AES-256 encryption for reports
- [x] AES-256 encryption for image files
- [x] CORS protection
- [x] Input validation
- [x] SQL injection prevention
- [x] File type validation
- [x] Automatic token expiry
- [x] Refresh token mechanism
- [x] Secure password verification

---

## 🔴 What's NOT Protected (Yet)

1. **Database file itself** - Consider full-disk encryption
2. **Network traffic** - Use HTTPS/TLS in production
3. **Audit logs** - Add logging for compliance
4. **Rate limiting** - Prevent brute force attacks
5. **2FA/MFA** - Add multi-factor authentication
6. **Session management** - Token blacklist for logout

---

## 📚 Compliance Notes

### HIPAA Requirements:
- ✅ Encryption at rest (reports, images)
- ✅ Access controls (authentication + authorization)
- ✅ Audit trails (timestamps on all records)
- ⚠️ Need: Audit logging system
- ⚠️ Need: Automatic session timeout
- ⚠️ Need: Data backup encryption

---

## 🎯 Summary

**Passwords** → Hashed (bcrypt) - One-way, cannot be reversed  
**Reports** → Encrypted (AES-256) - Two-way, decrypted for authorized users  
**Images** → Encrypted (AES-256) - Two-way, decrypted on download  
**Tokens** → Signed (JWT) - Prevents forgery, not encryption

This is **enterprise-grade security** suitable for medical data handling.
