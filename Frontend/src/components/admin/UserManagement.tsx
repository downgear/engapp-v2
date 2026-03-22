import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Lock,
  Unlock,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROLE_LABELS: Record<string, string> = {
  student: "Học sinh",
  parent: "Phụ huynh",
  teacher: "Giáo viên",
  mentor: "Mentor (GV nước ngoài)",
};

const ROLE_COLORS: Record<string, string> = {
  student: "bg-blue-100 text-blue-800",
  parent: "bg-green-100 text-green-800",
  teacher: "bg-purple-100 text-purple-800",
  mentor: "bg-orange-100 text-orange-800",
};

export const UserManagement = () => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchDebounce, setSearchDebounce] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  // Lock/unlock loading state
  const [lockingUserId, setLockingUserId] = useState<number | null>(null);

  // Create user modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
  });
  const [creating, setCreating] = useState(false);

  // Role change loading state
  const [changingRoleUserId, setChangingRoleUserId] = useState<number | null>(null);

  // Bulk import state
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportResults, setBulkImportResults] = useState<Array<{ success: boolean; email: string; error?: string }> | null>(null);
  const [bulkPreview, setBulkPreview] = useState<Array<{ fullName: string; email: string; phone: string; password: string; role: string }>>([]);
  const [bulkDraft, setBulkDraft] = useState<{ fullName: string; email: string; phone: string; password: string; role: string }>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const result = await api.getAdminUsers(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter !== "all" ? roleFilter : undefined,
        search: searchDebounce || undefined,
      });
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [accessToken, pagination.page, pagination.limit, roleFilter, searchDebounce]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [roleFilter, searchDebounce]);

  // Handle lock/unlock
  const handleToggleLock = async (user: User) => {
    if (!accessToken) return;

    try {
      setLockingUserId(user.id);
      const result = await api.toggleAdminUserLock(accessToken, user.id);
      
      // Update user in list
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isLocked: result.isLocked } : u
        )
      );
      
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLockingUserId(null);
    }
  };

  // Handle edit
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!accessToken || !editingUser) return;

    try {
      setSaving(true);
      const updatedUser = await api.updateAdminUser(
        accessToken,
        editingUser.id,
        editForm
      );
      
      // Update user in list
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? updatedUser : u))
      );
      
      toast.success("Cập nhật thông tin thành công");
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!accessToken) return;
    if (!createForm.email || !createForm.fullName || !createForm.password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setCreating(true);
      const created = await api.createAdminUser(accessToken, {
        email: createForm.email,
        password: createForm.password,
        fullName: createForm.fullName,
        phone: createForm.phone || undefined,
        role: createForm.role,
      });
      console.log("[createAdminUser] success:", created);
      toast.success(`Đã tạo tài khoản ${created.email} thành công`);
      setCreateModalOpen(false);
      setCreateForm({ fullName: "", email: "", phone: "", password: "", role: "student" });
      // Reset to page 1 with no filters and directly refetch so the new user is visible
      setRoleFilter("all");
      setSearch("");
      setSearchDebounce("");
      const refreshed = await api.getAdminUsers(accessToken, { page: 1, limit: pagination.limit });
      setUsers(refreshed.users);
      setPagination(refreshed.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[createAdminUser] error:", msg);
      toast.error(`Tạo tài khoản thất bại: ${msg}`);
    } finally {
      setCreating(false);
    }
  };

  const handleAddBulkRow = () => {
    if (!bulkDraft.fullName || !bulkDraft.email || !bulkDraft.password) {
      toast.error("Vui lòng điền họ tên, email và mật khẩu");
      return;
    }
    setBulkPreview((prev) => [...prev, { ...bulkDraft, phone: bulkDraft.phone || "" }]);
    setBulkDraft({ fullName: "", email: "", phone: "", password: "", role: "student" });
    setBulkImportResults(null);
  };

  const handleRemoveBulkRow = (index: number) => {
    setBulkPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkImport = async () => {
    if (!accessToken || bulkPreview.length === 0) return;
    setBulkImporting(true);
    try {
      const result = await api.bulkCreateAdminUsers(accessToken, bulkPreview);
      setBulkImportResults(result.results);
      setBulkPreview([]);
      toast.success(`Tạo thành công ${result.succeeded}/${result.total} tài khoản`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setBulkImporting(false);
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!accessToken) return;

    try {
      setChangingRoleUserId(userId);
      const updatedUser = await api.updateAdminUserRole(accessToken, userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? updatedUser : u))
      );
      toast.success("Đã cập nhật vai trò");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setChangingRoleUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý người dùng
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setBulkImportOpen(true); setBulkPreview([]); setBulkImportResults(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo hàng loạt
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Tạo tài khoản
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Lọc theo quyền" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="student">Học sinh</SelectItem>
              <SelectItem value="parent">Phụ huynh</SelectItem>
              <SelectItem value="teacher">Giáo viên</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy người dùng nào
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>SĐT</TableHead>
                    <TableHead>Quyền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                          disabled={changingRoleUserId === user.id}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue>
                              <Badge
                                variant="secondary"
                                className={ROLE_COLORS[user.role] || ""}
                              >
                                {ROLE_LABELS[user.role] || user.role}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Học sinh</SelectItem>
                            <SelectItem value="parent">Phụ huynh</SelectItem>
                            <SelectItem value="teacher">Giáo viên</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {user.isLocked ? (
                          <Badge variant="destructive">Đã khóa</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Hoạt động
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={user.isLocked ? "default" : "destructive"}
                            size="sm"
                            onClick={() => handleToggleLock(user)}
                            disabled={lockingUserId === user.id}
                          >
                            {lockingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.isLocked ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} người dùng
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin người dùng
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={saving}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Modal */}
        <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
          <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tạo tài khoản hàng loạt
              </DialogTitle>
              <DialogDescription>
                Thêm từng người dùng trong cùng form, sau đó tạo tất cả cùng lúc
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Inline add form */}
              <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                <p className="text-sm font-medium">Thêm người dùng</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="bulk-fullName">Họ và tên *</Label>
                    <Input
                      id="bulk-fullName"
                      value={bulkDraft.fullName}
                      onChange={(e) => setBulkDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bulk-email">Email *</Label>
                    <Input
                      id="bulk-email"
                      type="email"
                      value={bulkDraft.email}
                      onChange={(e) => setBulkDraft((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bulk-phone">Số điện thoại</Label>
                    <Input
                      id="bulk-phone"
                      value={bulkDraft.phone}
                      onChange={(e) => setBulkDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="0912345678"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bulk-password">Mật khẩu *</Label>
                    <Input
                      id="bulk-password"
                      type="password"
                      value={bulkDraft.password}
                      onChange={(e) => setBulkDraft((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bulk-role">Vai trò</Label>
                  <Select
                    value={bulkDraft.role}
                    onValueChange={(val) => setBulkDraft((prev) => ({ ...prev, role: val }))}
                  >
                    <SelectTrigger id="bulk-role" className="w-full md:w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Học sinh</SelectItem>
                      <SelectItem value="parent">Phụ huynh</SelectItem>
                      <SelectItem value="teacher">Giáo viên</SelectItem>
                      <SelectItem value="mentor">Mentor (GV nước ngoài)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" onClick={handleAddBulkRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add user
                </Button>
              </div>

              {/* Preview */}
              {bulkPreview.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Xem trước ({bulkPreview.length} tài khoản)</p>
                  <div className="border rounded-md overflow-hidden max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Họ tên</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead className="w-[90px] text-right">Xoá</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bulkPreview.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{row.fullName}</TableCell>
                            <TableCell className="text-sm">{row.email}</TableCell>
                            <TableCell className="text-sm">
                              <Badge variant="outline" className="text-xs">
                                {row.role === 'student' ? 'Học sinh' : row.role === 'parent' ? 'Phụ huynh' : 'Giáo viên'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBulkRow(i)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Results */}
              {bulkImportResults && (
                <div>
                  <p className="text-sm font-medium mb-2">Kết quả</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {bulkImportResults.map((r, i) => (
                      <div key={i} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded ${r.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {r.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                        <span className="font-medium">{r.email}</span>
                        {r.error && <span className="text-xs opacity-75">— {r.error}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkImportOpen(false)}>Đóng</Button>
              {bulkPreview.length > 0 && (
                <Button onClick={handleBulkImport} disabled={bulkImporting}>
                  {bulkImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add tất cả user ({bulkPreview.length})
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Tạo tài khoản mới
              </DialogTitle>
              <DialogDescription>
                Tạo tài khoản cho học sinh, phụ huynh hoặc giáo viên
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-fullName">Họ và tên *</Label>
                <Input
                  id="create-fullName"
                  value={createForm.fullName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fullName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Mật khẩu *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone">Số điện thoại</Label>
                <Input
                  id="create-phone"
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder="0912345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Vai trò *</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(val) =>
                    setCreateForm({ ...createForm, role: val })
                  }
                >
                  <SelectTrigger id="create-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học sinh</SelectItem>
                    <SelectItem value="parent">Phụ huynh</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                    <SelectItem value="mentor">Mentor (GV nước ngoài)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={creating}
              >
                Hủy
              </Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
