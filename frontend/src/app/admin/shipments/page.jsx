"use client";
import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import AdminShipmentsTable from '@/components/admin/AdminShipmentsTable';

export default function AdminShipmentsPage() {
  return <AdminShipmentsTable />;
} 