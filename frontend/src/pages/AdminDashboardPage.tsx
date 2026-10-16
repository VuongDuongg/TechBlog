import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  courseApi,
  postApi,
  lessonApi,
  categoryApi,
  fileApi,
  userApi,
  type CoursePayload,
  type PostPayload,
  type LessonPayload,
} from '../api/services';
import type { Category, Course, Lesson, Post, UserProfile } from '../types';
import {
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Edit,
  Layers,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Loader2,
  Users,
  Shield,
  ShieldCheck,
  UserX,
  Search,
  Crown,
  Lock,
} from 'lucide-react';

const ROOT_ADMIN_EMAIL = 'admin@example.com';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const isCurrentRootAdmin = user?.email?.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

  const [activeTab, setActiveTab] = useState<'courses' | 'posts' | 'lessons' | 'users'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingCourseImg, setUploadingCourseImg] = useState(false);
  const [uploadingPostImg, setUploadingPostImg] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<CoursePayload>({
    title: '',
    description: '',
    thumbnailUrl: '',
    price: 0,
    categoryId: 1,
  });

  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [postForm, setPostForm] = useState<PostPayload>({
    title: '',
    slug: '',
    content: '',
    thumbnailUrl: '',
    categoryId: 1,
  });

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonPayload>({
    title: '',
    content: '',
    orderIndex: 1,
    courseId: 0,
  });

  const loadLessons = async (courseId: number) => {
    try {
      const data = await lessonApi.getByCourseId(courseId);
      setLessons(data || []);
    } catch (err) {
      console.error('Lỗi khi tải bài học', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        const [coursesRes, postsRes, catsRes, usersRes] = await Promise.all([
          courseApi.getAll(0, 100),
          postApi.getAll(0, 100),
          categoryApi.getAll(),
          userApi.getAll(0, 100),
        ]);

        if (!isMounted) return;

        if (coursesRes?.content) {
          setCourses(coursesRes.content);
          if (coursesRes.content.length > 0) {
            const firstId = coursesRes.content[0].id;
            setSelectedCourseForLessons(firstId);
            lessonApi.getByCourseId(firstId).then((data) => {
              if (isMounted) setLessons(data || []);
            });
          }
        }
        if (postsRes?.content) setPosts(postsRes.content);
        if (catsRes && catsRes.length > 0) {
          setCategories(catsRes);
          setCourseForm((prev) => ({ ...prev, categoryId: catsRes[0].id }));
          setPostForm((prev) => ({ ...prev, categoryId: catsRes[0].id }));
        }
        if (usersRes?.content) setUsers(usersRes.content);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang quản trị', err);
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdmin, navigate]);

  const loadInitialData = async () => {
    try {
      const [coursesRes, postsRes, catsRes, usersRes] = await Promise.all([
        courseApi.getAll(0, 100),
        postApi.getAll(0, 100),
        categoryApi.getAll(),
        userApi.getAll(0, 100),
      ]);

      if (coursesRes?.content) {
        setCourses(coursesRes.content);
      }
      if (postsRes?.content) setPosts(postsRes.content);
      if (catsRes) setCategories(catsRes);
      if (usersRes?.content) setUsers(usersRes.content);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trang quản trị', err);
    }
  };

  // ---------------- COURSE HANDLERS ----------------
  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseForm({
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl || '',
        price: course.price,
        categoryId: course.categoryId || (categories[0]?.id ?? 1),
      });
    } else {
      setEditingCourseId(null);
      setCourseForm({
        title: '',
        description: '',
        thumbnailUrl: '',
        price: 0,
        categoryId: categories[0]?.id ?? 1,
      });
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMsg(null);
      if (editingCourseId) {
        await courseApi.update(editingCourseId, courseForm);
        setMsg({ type: 'success', text: 'Cập nhật khóa học thành công!' });
      } else {
        await courseApi.create(courseForm);
        setMsg({ type: 'success', text: 'Tạo mới khóa học thành công!' });
      }
      setShowCourseModal(false);
      loadInitialData();
    } catch {
      setMsg({ type: 'error', text: 'Thao tác với khóa học thất bại!' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    try {
      await courseApi.delete(id);
      setCourses(courses.filter((c) => c.id !== id));
      setMsg({ type: 'success', text: 'Xóa khóa học thành công!' });
    } catch {
      setMsg({ type: 'error', text: 'Không thể xóa khóa học này.' });
    }
  };

  // ---------------- POST HANDLERS ----------------
  const handleOpenPostModal = (post?: Post) => {
    if (post) {
      setEditingPostId(post.id);
      setPostForm({
        title: post.title,
        slug: post.slug,
        content: post.content,
        thumbnailUrl: post.thumbnailUrl || '',
        categoryId: post.categoryId || (categories[0]?.id ?? 1),
      });
    } else {
      setEditingPostId(null);
      setPostForm({
        title: '',
        slug: '',
        content: '',
        thumbnailUrl: '',
        categoryId: categories[0]?.id ?? 1,
      });
    }
    setShowPostModal(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMsg(null);
      if (editingPostId) {
        await postApi.update(editingPostId, postForm);
        setMsg({ type: 'success', text: 'Cập nhật bài viết thành công!' });
      } else {
        await postApi.create(postForm);
        setMsg({ type: 'success', text: 'Tạo mới bài viết thành công!' });
      }
      setShowPostModal(false);
      loadInitialData();
    } catch {
      setMsg({ type: 'error', text: 'Thao tác với bài viết thất bại! Vui lòng kiểm tra lại slug không trùng lặp.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await postApi.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
      setMsg({ type: 'success', text: 'Xóa bài viết thành công!' });
    } catch {
      setMsg({ type: 'error', text: 'Không thể xóa bài viết này.' });
    }
  };

  // ---------------- LESSON HANDLERS ----------------
  const handleOpenLessonModal = () => {
    if (!selectedCourseForLessons) return;
    setLessonForm({
      title: '',
      content: '',
      orderIndex: lessons.length + 1,
      courseId: selectedCourseForLessons,
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMsg(null);
      await lessonApi.create(lessonForm);
      setMsg({ type: 'success', text: 'Thêm bài học mới thành công!' });
      setShowLessonModal(false);
      if (selectedCourseForLessons) {
        loadLessons(selectedCourseForLessons);
      }
    } catch {
      setMsg({ type: 'error', text: 'Không thể tạo bài học!' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await lessonApi.delete(id);
      setLessons(lessons.filter((l) => l.id !== id));
      setMsg({ type: 'success', text: 'Xóa bài học thành công!' });
    } catch {
      setMsg({ type: 'error', text: 'Không thể xóa bài học này.' });
    }
  };

  // ---------------- USER HANDLERS ----------------
  const handleToggleAdminRole = async (targetUser: UserProfile) => {
    // Chỉ Root Admin mới có quyền thực hiện
    if (!isCurrentRootAdmin) {
      alert('Chỉ Quản trị viên tối cao (Root Admin) mới có quyền cấp hoặc thu hồi quyền Quản trị viên!');
      return;
    }

    // Tuyệt đối không thể hạ quyền Root Admin
    if (targetUser.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
      alert('Không thể thay đổi vai trò của tài khoản Quản trị viên tối cao (Root Admin)!');
      return;
    }

    // Không thể tự đổi quyền của mình
    if (targetUser.id === user?.id) {
      alert('Bạn không thể tự thay đổi quyền hạn của tài khoản đang đăng nhập để tránh bị mất quyền quản trị!');
      return;
    }

    const isTargetAdmin = targetUser.roles.includes('ROLE_ADMIN');
    const confirmMessage = isTargetAdmin
      ? `Bạn có chắc chắn muốn hạ quyền Quản trị viên của "${targetUser.fullName || targetUser.email}" về người dùng thông thường?`
      : `Bạn có chắc chắn muốn cấp quyền Quản trị viên (ROLE_ADMIN) cho "${targetUser.fullName || targetUser.email}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdatingUserId(targetUser.id);
      setMsg(null);

      const updatedRoles = isTargetAdmin
        ? targetUser.roles.filter((r) => r !== 'ROLE_ADMIN')
        : Array.from(new Set([...targetUser.roles, 'ROLE_ADMIN']));

      const finalRoles = updatedRoles.length === 0 ? ['ROLE_USER'] : updatedRoles;

      const res = await userApi.updateRoles(targetUser.id, finalRoles);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, roles: res.roles } : u)));
      setMsg({
        type: 'success',
        text: `Đã ${isTargetAdmin ? 'thu hồi quyền Quản trị viên của' : 'cấp quyền Quản trị viên cho'} "${targetUser.fullName || targetUser.email}" thành công!`,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      let errTxt = 'Thao tác phân quyền người dùng thất bại!';
      if (typeof error.response?.data === 'string') {
        errTxt = error.response.data;
      } else if (error.response?.data?.message) {
        errTxt = error.response.data.message;
      }
      setMsg({ type: 'error', text: errTxt });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Khu vực Quản trị Hệ thống (Admin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bảng điều khiển & Quản lý dữ liệu
            </h1>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'courses' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Khóa học ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'posts' ? 'bg-violet-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Bài viết ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'lessons' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Bài học
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Người dùng ({users.length})
            </button>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {msg && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <div>{msg.text}</div>
          </div>
        )}

        {/* ================= TAB 1: COURSES ================= */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Danh sách Khóa học</h2>
              <button
                type="button"
                onClick={() => handleOpenCourseModal()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm khóa học mới
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Ảnh</th>
                      <th className="py-3 px-4">Tên khóa học</th>
                      <th className="py-3 px-4">Danh mục</th>
                      <th className="py-3 px-4">Giá tiền</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img
                              src={
                                c.thumbnailUrl ||
                                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
                              }
                              alt={c.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{c.title}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 font-medium">
                            {c.categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {c.price > 0 ? `${c.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenCourseModal(c)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: POSTS ================= */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Danh sách Bài viết</h2>
              <button
                type="button"
                onClick={() => handleOpenPostModal()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Viết bài mới
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Ảnh</th>
                      <th className="py-3 px-4">Tiêu đề bài viết</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Chuyên mục</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img
                              src={
                                p.thumbnailUrl ||
                                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'
                              }
                              alt={p.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 line-clamp-1">{p.title}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{p.slug}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-violet-50 text-violet-700 font-medium">
                            {p.categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenPostModal(p)}
                            className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg cursor-pointer"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: LESSONS ================= */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Chọn khóa học:</span>
                <select
                  value={selectedCourseForLessons || ''}
                  onChange={(e) => {
                    const cid = Number(e.target.value);
                    setSelectedCourseForLessons(cid);
                    loadLessons(cid);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenLessonModal}
                disabled={!selectedCourseForLessons}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Thêm bài học vào khóa này
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Thứ tự</th>
                      <th className="py-3 px-4">Tên bài học</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lessons.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-indigo-600">{l.orderIndex}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{l.title}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(l.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Xóa bài học"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: USERS ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header & Stats Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Quản lý Tài khoản & Phân quyền</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Xem danh sách toàn bộ người dùng và quản lý vai trò Quản trị viên (ROLE_ADMIN)
                </p>
              </div>

              {/* Stats pills */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Tổng: <strong>{users.length}</strong>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin: <strong>{users.filter((u) => u.roles.includes('ROLE_ADMIN')).length}</strong>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  User: <strong>{users.filter((u) => !u.roles.includes('ROLE_ADMIN')).length}</strong>
                </span>
              </div>
            </div>

            {/* Security Notice Banner */}
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 shadow-xs ${
                isCurrentRootAdmin
                  ? 'bg-amber-50/80 border-amber-200/80 text-amber-900'
                  : 'bg-indigo-50/80 border-indigo-200/80 text-indigo-900'
              }`}
            >
              {isCurrentRootAdmin ? (
                <>
                  <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-900">Quyền Quản trị viên tối cao (Root Admin):</strong>
                    <p className="text-amber-800 mt-0.5 leading-relaxed text-xs sm:text-sm">
                      Bạn đang đăng nhập với tài khoản tối cao ({ROOT_ADMIN_EMAIL}). Bạn có toàn quyền quản trị và cấp hoặc thu hồi quyền Admin của các thành viên. Các Admin khác không thể hạ quyền của bạn.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-indigo-900">Chế độ Quản trị viên nội dung (Standard Admin):</strong>
                    <p className="text-indigo-800 mt-0.5 leading-relaxed text-xs sm:text-sm">
                      Bạn có toàn quyền quản lý Khóa học, Bài viết và Bài giảng. Để bảo mật hệ thống, quyền cấp hoặc thu hồi vai trò Quản trị viên được bảo lưu độc quyền cho <strong>Quản trị viên tối cao (Root Admin - {ROOT_ADMIN_EMAIL})</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm kiếm theo họ tên hoặc email..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white text-sm shadow-sm transition-all"
              />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => setUserSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Người dùng</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Ngày đăng ký</th>
                      <th className="py-3 px-4">Vai trò hiện tại</th>
                      <th className="py-3 px-4 text-right">Phân quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users
                      .filter(
                        (u) =>
                          u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((u) => {
                        const isSelf = u.id === user?.id;
                        const isTargetRootAdmin = u.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();
                        const hasAdmin = u.roles.includes('ROLE_ADMIN');
                        const isBusy = updatingUserId === u.id;

                        return (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0 ${
                                    isTargetRootAdmin
                                      ? 'bg-gradient-to-tr from-amber-500 to-amber-600 ring-2 ring-amber-300'
                                      : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                                  }`}
                                >
                                  {u.fullName?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span>{u.fullName || 'Chưa cập nhật'}</span>
                                    {isSelf && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                        Bạn
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-400 font-normal">ID: #{u.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500">
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1.5">
                                {isTargetRootAdmin ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                                    <Crown className="w-3.5 h-3.5 text-amber-200" /> Root Admin
                                  </span>
                                ) : hasAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Shield className="w-3 h-3 text-amber-600" /> Quản trị viên
                                  </span>
                                ) : null}
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  Học viên
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isTargetRootAdmin ? (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-100/70 border border-amber-200 font-bold px-2.5 py-1 rounded-xl">
                                  <Crown className="w-3.5 h-3.5 text-amber-600" /> Cố định
                                </span>
                              ) : isSelf ? (
                                <span className="text-xs text-slate-400 italic font-medium px-2 py-1">
                                  Tài khoản hiện tại
                                </span>
                              ) : !isCurrentRootAdmin ? (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium px-2 py-1">
                                  <Lock className="w-3 h-3 text-slate-400" /> Chỉ Root Admin
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleAdminRole(u)}
                                  disabled={isBusy}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                                    hasAdmin
                                      ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                                      : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm'
                                  }`}
                                  title={
                                    hasAdmin
                                      ? 'Hạ quyền người dùng này xuống học viên thông thường'
                                      : 'Nâng cấp người dùng này lên Quản trị viên'
                                  }
                                >
                                  {isBusy ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Đang xử lý...</span>
                                    </>
                                  ) : hasAdmin ? (
                                    <>
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Hạ quyền User</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      <span>Cấp quyền Admin</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                    {users.filter(
                      (u) =>
                        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email?.toLowerCase().includes(userSearch.toLowerCase())
                    ).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                          Không tìm thấy người dùng nào phù hợp với từ khóa &quot;{userSearch}&quot;
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: COURSE FORM ================= */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingCourseId ? 'Chỉnh sửa Khóa học' : 'Tạo Khóa học mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề khóa học</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Ví dụ: Lập trình Spring Boot từ Zero đến Hero"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả khóa học</label>
                <textarea
                  rows={3}
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Mô tả tóm tắt nội dung khóa học..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Giá tiền (VNĐ)</label>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {courseForm.price > 0
                        ? `${courseForm.price.toLocaleString('vi-VN')} đ`
                        : 'Miễn phí'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={courseForm.price ? courseForm.price.toLocaleString('vi-VN') : ''}
                      onChange={(e) => {
                        // Loại bỏ tất cả ký tự không phải số
                        const rawVal = e.target.value.replace(/\D/g, '');
                        setCourseForm({ ...courseForm, price: rawVal ? Number(rawVal) : 0 });
                      }}
                      placeholder="0"
                      className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm font-medium"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₫
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={courseForm.categoryId}
                    onChange={(e) => setCourseForm({ ...courseForm, categoryId: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh bìa (Thumbnail)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={courseForm.thumbnailUrl}
                      onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                      placeholder="Dán link ảnh (https://...) hoặc tải ảnh từ máy tính"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm"
                    />
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors border border-slate-200 shrink-0">
                      {uploadingCourseImg ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-600" />
                          <span>Tải ảnh lên</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingCourseImg}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingCourseImg(true);
                            const res = await fileApi.upload(file);
                            const fullUrl = res.fileUrl.startsWith('http')
                              ? res.fileUrl
                              : `http://localhost:8080${res.fileUrl}`;
                            setCourseForm((prev) => ({ ...prev, thumbnailUrl: fullUrl }));
                          } catch {
                            alert('Không thể tải ảnh lên. Vui lòng kiểm tra lại!');
                          } finally {
                            setUploadingCourseImg(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {courseForm.thumbnailUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-40">
                      <img
                        src={courseForm.thumbnailUrl}
                        alt="Preview Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setCourseForm({ ...courseForm, thumbnailUrl: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST FORM ================= */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingPostId ? 'Chỉnh sửa Bài viết' : 'Viết Bài viết mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài viết</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setPostForm({
                      ...postForm,
                      title,
                      slug: editingPostId ? postForm.slug : autoSlug,
                    });
                  }}
                  placeholder="Ví dụ: Hướng dẫn tích hợp Spring Security JWT"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-violet-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug (Đường dẫn tĩnh)</label>
                  <input
                    type="text"
                    required
                    value={postForm.slug}
                    onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-violet-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chuyên mục</label>
                  <select
                    value={postForm.categoryId}
                    onChange={(e) => setPostForm({ ...postForm, categoryId: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-violet-500 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh bìa (Thumbnail)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={postForm.thumbnailUrl}
                      onChange={(e) => setPostForm({ ...postForm, thumbnailUrl: e.target.value })}
                      placeholder="Dán link ảnh (https://...) hoặc tải ảnh từ máy tính"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-violet-500 text-sm"
                    />
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors border border-slate-200 shrink-0">
                      {uploadingPostImg ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-600" />
                          <span>Tải ảnh lên</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingPostImg}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingPostImg(true);
                            const res = await fileApi.upload(file);
                            const fullUrl = res.fileUrl.startsWith('http')
                              ? res.fileUrl
                              : `http://localhost:8080${res.fileUrl}`;
                            setPostForm((prev) => ({ ...prev, thumbnailUrl: fullUrl }));
                          } catch {
                            alert('Không thể tải ảnh lên. Vui lòng kiểm tra lại!');
                          } finally {
                            setUploadingPostImg(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {postForm.thumbnailUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-40">
                      <img
                        src={postForm.thumbnailUrl}
                        alt="Preview Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setPostForm({ ...postForm, thumbnailUrl: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung bài viết</label>
                <textarea
                  rows={6}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Nội dung bài viết chi tiết..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-violet-500 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Xuất bản bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LESSON FORM ================= */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Thêm Bài học mới</h3>
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài học</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="Bài 1: Tổng quan dự án"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={lessonForm.orderIndex}
                    onChange={(e) => setLessonForm({ ...lessonForm, orderIndex: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung bài giảng</label>
                <textarea
                  rows={6}
                  required
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Nội dung hướng dẫn chi tiết của bài học..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Thêm bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
