import api from './client';

export const login = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const fetchMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const fetchProducts = async (query?: string) => {
  const url = query ? `/products?search=${encodeURIComponent(query)}` : '/products';
  const response = await api.get(url);
  return response.data;
};

export const fetchProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const fetchOrders = async () => {
  // Call the user specific orders list
  const response = await api.get('/orders/my');
  return response.data;
};

export const fetchOrderById = async (id: string) => {
  const response = await api.get(`/orders/my/${id}`);
  return response.data;
};

export const createBulkOrder = async (orderData: any) => {
  const response = await api.post('/bulk-orders', orderData);
  return response.data;
};

export const fetchMyBulkOrders = async () => {
  const response = await api.get('/bulk-orders/my-orders');
  return response.data;
};
export const adminCreateProduct = async (data: any) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const adminUpdateProduct = async (id: string, data: any) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const adminDeleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const adminGetStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const adminGetUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const adminUpdateUserStatus = async (id: string, status: boolean) => {
  const response = await api.put(`/admin/users/${id}/status`, { isActive: status });
  return response.data;
};

export const adminGetAllOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const adminUpdateOrderStatus = async (id: string, status: string) => {
  const response = await api.put(`/admin/orders/${id}/status`, { status });
  return response.data;
};

export const adminGetAllBulkOrders = async () => {
  const response = await api.get('/admin/bulk-orders');
  return response.data;
};

export const getImageKitAuth = async () => {
  const response = await api.get('/imagekit/auth');
  return response.data;
};

export const adminCreateCategory = async (data: any) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const adminUpdateCategory = async (id: string, data: any) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const adminDeleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
