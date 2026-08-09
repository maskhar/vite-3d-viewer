# 🔒 SECURITY FIX: SECURITY DEFINER View

## ⚠️ Security Issue Detected

**Entity:** `public.models_catalog_formatted`
**Severity:** Critical
**Issue:** View defined with SECURITY DEFINER property

---

## 🐛 Problem Description

### **What is SECURITY DEFINER?**

By default, PostgreSQL views use `SECURITY DEFINER`, meaning:
- View executes with permissions of the **view creator** (owner)
- Bypasses Row Level Security (RLS) policies
- Any user querying the view gets **elevated privileges**
- **Security risk:** Privilege escalation vulnerability

### **Example Attack Scenario:**

```sql
-- Admin creates view (has full access)
CREATE VIEW models_catalog_formatted AS SELECT * FROM models_catalog;

-- Anonymous user queries view
SELECT * FROM models_catalog_formatted;
-- ❌ Gets all data, even inactive models that should be hidden!
-- ❌ Bypasses RLS policy: "Public can view active models"
```

---

## ✅ Solution: SECURITY INVOKER

### **What Changed:**

```sql
-- BEFORE (Vulnerable)
CREATE OR REPLACE VIEW public.models_catalog_formatted AS
SELECT ...

-- AFTER (Secure)
CREATE OR REPLACE VIEW public.models_catalog_formatted
WITH (security_invoker = true)  -- ✅ Added this
AS
SELECT ...
```

### **How SECURITY INVOKER Works:**

- View executes with permissions of the **querying user**
- Respects Row Level Security (RLS) policies
- Each user sees only data they're allowed to see
- **Secure:** No privilege escalation

### **Example After Fix:**

```sql
-- Anonymous user queries view
SELECT * FROM models_catalog_formatted;
-- ✅ Only sees active models (RLS enforced)

-- Authenticated admin queries view
SELECT * FROM models_catalog_formatted;
-- ✅ Sees all models (RLS allows authenticated users)
```

---

## 📝 Files Modified

### 1. **supabase/01_schema_and_data.sql**
   - Added `WITH (security_invoker = true)` to view definition
   - Added security note in comments

### 2. **supabase/06_fix_security_definer_view.sql** (New)
   - Migration script to fix existing view
   - Includes explanation and DROP/CREATE statements

---

## 🚀 How to Apply Fix

### **Option 1: For New Deployments**
Just run the updated `01_schema_and_data.sql` - it's already fixed.

### **Option 2: For Existing Databases**
Run the migration script:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open new query
3. Copy contents of `supabase/06_fix_security_definer_view.sql`
4. Click **Run**
5. ✅ View is now secure

---

## 🧪 Testing the Fix

### **Test 1: Anonymous User (Public)**

```sql
-- As anonymous user
SELECT * FROM public.models_catalog_formatted;

-- Expected result:
-- ✅ Only active models (is_active = true)
-- ❌ Cannot see inactive models
```

### **Test 2: Authenticated User (Admin)**

```sql
-- As authenticated admin
SELECT * FROM public.models_catalog_formatted;

-- Expected result:
-- ✅ All models (active and inactive)
```

### **Verify Security Invoker:**

```sql
-- Check view definition
SELECT definition 
FROM pg_views 
WHERE viewname = 'models_catalog_formatted';

-- Should contain: security_invoker=true
```

---

## 📊 Security Comparison

| Aspect | SECURITY DEFINER (Before) | SECURITY INVOKER (After) |
|--------|---------------------------|-------------------------|
| **Executes as** | View creator (admin) | Querying user |
| **RLS Applied** | ❌ No | ✅ Yes |
| **Privilege Escalation** | ⚠️ Possible | ✅ Prevented |
| **Security Level** | 🔴 Critical Risk | 🟢 Secure |
| **Best Practice** | ❌ Not recommended | ✅ Recommended |

---

## 🛡️ Security Best Practices

### **When to Use Each:**

**SECURITY DEFINER (Rarely):**
- Only when you explicitly need privilege escalation
- Must be carefully audited
- Document why it's needed

**SECURITY INVOKER (Default):**
- ✅ Use for all normal views
- Respects user permissions
- Prevents security vulnerabilities

### **PostgreSQL Defaults:**

- PostgreSQL < 15: `SECURITY DEFINER` (default)
- PostgreSQL >= 15: Can set `security_invoker = true`
- Supabase: Recommends `security_invoker = true`

---

## 🔍 How Supabase Detected This

Supabase Security Advisor scans for:
- Views without `security_invoker = true`
- Functions with `SECURITY DEFINER`
- Missing RLS policies
- Public table access without policies

This helps prevent common security misconfigurations.

---

## ✅ Verification Checklist

After applying the fix:

- [ ] Run migration script `06_fix_security_definer_view.sql`
- [ ] Verify view has `security_invoker = true`
- [ ] Test as anonymous user (should see only active)
- [ ] Test as authenticated user (should see all)
- [ ] Check Supabase Security Advisor (issue should be gone)
- [ ] Deploy to production

---

## 📚 References

- [PostgreSQL Views Security](https://www.postgresql.org/docs/current/sql-createview.html)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Privilege Escalation](https://owasp.org/www-community/vulnerabilities/Privilege_Escalation)

---

## 🎯 Summary

**Issue:** View used SECURITY DEFINER (bypassed RLS)
**Fix:** Added `security_invoker = true`
**Result:** View now respects user permissions & RLS policies

**Security Status:** ✅ **RESOLVED**

---

**Note:** This is a **critical security fix**. Apply it as soon as possible to prevent unauthorized data access.
