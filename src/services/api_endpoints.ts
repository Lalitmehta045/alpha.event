// Remove trailing slash and handle empty case
const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_BASE_ALPHA || "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const BASE_URL: string = getBaseUrl();

export const superAdminEndpoints = {
  // =========================================================
  // ✅ SUPER-ADMIN → MANAGE ADMINS (CRUD on Admin List)
  // =========================================================

  // ✅ GET all admins
  SUPERADMIN_ALLADMIN_GET_API: `${BASE_URL}/api/super-admin/admin`,

  // ✅ GET one admin
  ADMIN_GET_API: (id: string) => `${BASE_URL}/api/super-admin/admin/${id}`,

  // ✅ UPDATE admin
  SUPERADMIN_ADMIN_PUT_API: (id: string) =>
    `${BASE_URL}/api/super-admin/admin/${id}`,

  // ✅ DELETE admin
  ADMIN_DELETE_API: (id: string) => `${BASE_URL}/api/super-admin/admin/${id}`,

  // =========================================================
  // ✅ SUPER-ADMIN → SELF PROFILE APIs (NO ID REQUIRED)
  // =========================================================

  // ✅ GET logged-in super-admin profile
  SUPERADMIN_GET_API: `${BASE_URL}/api/super-admin/profile`,

  // ✅ UPDATE logged-in super-admin profile
  SUPERADMIN_PUT_API: `${BASE_URL}/api/super-admin/profile`,

  // ✅ DELETE logged-in super-admin profile
  SUPERADMIN_DELETE_API: `${BASE_URL}/api/super-admin/profile`,
};

export const adminEndpoints = {
  // ============================================
  // ✅ ADMIN PROFILE (Self)
  // ============================================
  ADMINPROFILE_GET_API: `${BASE_URL}/api/admin/profile`,
  ADMINPROFILE_PUT_API: `${BASE_URL}/api/admin/profile`,
  ADMINPROFILE_DELETE_API: `${BASE_URL}/api/admin/profile`,

  // ============================================
  // ✅ USERS (Admin Panel → Manage Public Users)
  // ============================================
  ADMIN_ALLUSERS_GET_API: `${BASE_URL}/api/admin/user`,
  USER_GET_API: (id: string) => `${BASE_URL}/api/admin/user/${id}`,
  ADMIN_USER_PUT_API: (id: string) => `${BASE_URL}/api/admin/user/${id}`,
  USER_DELETE_API: (id: string) => `${BASE_URL}/api/admin/user/${id}`,

  // ============================================
  // ✅ Admin Upload Image URL (Admin Panel)
  // ============================================
  UPLOADIMAGE_POSTAPI: `${BASE_URL}/api/upload/presign`,

  // ============================================
  // ✅ CATEGORIES
  // ============================================
  ALLCATEGORY_GET_API: `${BASE_URL}/api/admin/category`,
  CATEGORY_POST_API: `${BASE_URL}/api/admin/category`,
  CATEGORY_GET_API: (id: string) => `${BASE_URL}/api/admin/category/${id}`,
  CATEGORY_PUT_API: (id: string) => `${BASE_URL}/api/admin/category/${id}`,
  CATEGORY_DELETE_API: (id: string) => `${BASE_URL}/api/admin/category/${id}`,

  // ============================================
  // ✅ SUBCATEGORIES
  // ============================================
  ALLSUBCATEGORIES_GET_API: `${BASE_URL}/api/admin/sub-category`,
  SUBCATEGORIES_POST_API: `${BASE_URL}/api/admin/sub-category`,
  SUBCATEGORIES_GET_API: (id: string) =>
    `${BASE_URL}/api/admin/sub-category/${id}`,
  SUBCATEGORIES_PUT_API: (id: string) =>
    `${BASE_URL}/api/admin/sub-category/${id}`,
  SUBCATEGORIES_DELETE_API: (id: string) =>
    `${BASE_URL}/api/admin/sub-category/${id}`,

  // ============================================
  // ✅ PRODUCTS
  // (Your API folder: /api/admin/product + /product/[id])
  // ============================================
  ALLADMINPRODUCT_GET_API: `${BASE_URL}/api/admin/product`,
  PRODUCT_POST_API: `${BASE_URL}/api/admin/product`,
  PRODUCT_GET_API: (id: string) => `${BASE_URL}/api/admin/product/${id}`,
  PRODUCT_PUT_API: (id: string) => `${BASE_URL}/api/admin/product/${id}`,
  PRODUCT_DELETE_API: (id: string) => `${BASE_URL}/api/admin/product/${id}`,

  // ============================================
  // ✅ ORDERS
  // ============================================
  ADMIN_GET_ALL_ORDERS_API: `${BASE_URL}/api/admin/orders`,
  ADMIN_ORDER_GET_API: (id: string) => `${BASE_URL}/api/admin/orders/${id}`,
  ADMIN_ORDER_PUT_API: (id: string) => `${BASE_URL}/api/admin/orders/${id}`,
  ADMIN_ORDER_DELETE_API: (id: string) => `${BASE_URL}/api/admin/orders/${id}`,
};

export const endpoints = {
  SENDOTPEMAIL_API: `${BASE_URL}/api/auth/send-otp-email`,
  SENDOTP_API: `${BASE_URL}/api/auth/send-otp`,
  SIGNUP_API: `${BASE_URL}/api/auth/sign-up`,
  SIGNIN_API: `${BASE_URL}/api/auth/sign-in`,
  RESETPASSWORD_API: `${BASE_URL}/api/auth/reset-password`,
  FORGETPASSTOKEN_API: `${BASE_URL}/api/auth/reset-password-token`,
};

// ✅ Public Category Endpoints
export const categoryEndpoints = {
  // GET all categories → /api/category
  ALLCATEGORY_GET_API: `${BASE_URL}/api/category`,
  CATEGORY_GET_API: `${BASE_URL}/api/category`,
};

export const subCategoryEndpoints = {
  ALLSUBCATEGORIES_GET_API: `${BASE_URL}/api/sub-category`,
  SUBCATEGORY_GET_API: `${BASE_URL}/api/sub-category`,
};

// ✅ Public Product Endpoints
export const productEndpoints = {
  //pending''
  // router.get("/get-product-by-category-and-subcategory", productController.getProductByCategoryAndSubCategory);

  // GET all products → /api/product
  ALLPRODUCT_GET_API: `${BASE_URL}/api/product`,

  // GET single product → /api/product/:id
  PRODUCT_GET_API: (id: string) => `${BASE_URL}/api/product/${id}`,

  GET_PRODUCT_SUBCATEGORY_API: (productId: string) =>
    `${BASE_URL}/api/product/similar/${productId}`,

  GET_MOST_POPULAR_PRODUCT_API: `${BASE_URL}/api/product/most-popular`,
};

// ✅ Public Orders Endpoints
export const ordersEndpoints = {
  GETORDER_API: `${BASE_URL}/api/orders`,
  CASH_ON_DELIVERY: `${BASE_URL}/api/orders/cod`,
};

// ✅ Public Cart Endpoints
export const cartEndpoints = {
  SYNCCART_ITEM_API: `${BASE_URL}/api/cart/sync`,
  GETALLCART_ITEM_API: `${BASE_URL}/api/cart`,
  GETCART_ITEM_API: (id: string) => `${BASE_URL}/api/cart/${id}`,
  POSTCART_ITEM_API: `${BASE_URL}/api/cart`,
  PUTCART_ITEM_API: (id: string) => `${BASE_URL}/api/cart/${id}`,
  DELETECART_ITEM_API: (id: string) => `${BASE_URL}/api/cart/${id}`,
};

// ✅ Public User Endpoints
export const userEndpoints = {
  GETPROFILE_API: (id: string) => `${BASE_URL}/api/profile/${id}`,
  PUTPROFILE_API: (id: string) => `${BASE_URL}/api/profile/${id}`,
  DELETEPROFILE_API: (id: string) => `${BASE_URL}/api/profile/${id}`,
};

// ✅ Public User Endpoints
export const addressEndpoints = {
  GETALLADDRESS_API: `${BASE_URL}/api/address`,
  POSTADDRESS_API: `${BASE_URL}/api/address`,
  PUTADDRESS_API: (id: string) => `${BASE_URL}/api/address/${id}`,
  DELETEADDRESS_API: (id: string) => `${BASE_URL}/api/address/${id}`,
};
