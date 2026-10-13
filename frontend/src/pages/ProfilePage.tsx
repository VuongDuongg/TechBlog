import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../api/services';
import type { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userApi.getProfile();
        if (isMounted) {
          setProfile(data);
          setFullName(data.fullName);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin cá nhân', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStatusMsg({ type: 'error', text: 'Họ và tên không được để trống.' });
      return;
    }

    try {
      setSaving(true);
      setStatusMsg(null);
      const updated = await userApi.updateProfile(fullName.trim());
      setProfile(updated);

      // Đồng bộ thông tin mới vào AuthContext
      if (user) {
        login({
          ...user,
          fullName: updated.fullName,
        });
      }

      setStatusMsg({ type: 'success', text: 'Cập nhật thông tin hồ sơ thành công!' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      let errTxt = 'Không thể cập nhật hồ sơ!';
      if (typeof error.response?.data === 'string') {
        errTxt = error.response.data;
      } else if (error.response?.data?.message) {
        errTxt = error.response.data.message;
      }
      setStatusMsg({ type: 'error', text: errTxt });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Đang tải hồ sơ cá nhân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <User className="w-4 h-4" />
            <span>Tài khoản của tôi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hồ sơ cá nhân
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Quản lý thông tin tài khoản và xem các vai trò được cấp phép trong hệ thống.
          </p>
        </div>
      </section>

      {/* Profile Form & Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {statusMsg && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <div>{statusMsg.text}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột trái: Avatar & Quick Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-600/20">
              {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{profile?.fullName}</h2>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-1.5">
              {profile?.roles?.map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {r}
                </span>
              ))}
            </div>

            <Link
              to="/my-courses"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Khóa học của tôi</span>
            </Link>
          </div>

          {/* Cột phải: Form chỉnh sửa */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Thông tin chi tiết</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullNameInput"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                >
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="fullNameInput"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="emailInput"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                >
                  Email đăng ký (Không thể thay đổi)
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="emailInput"
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    Tham gia ngày:{' '}
                    <strong>
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>
                    Quyền hạn: <strong>{profile?.roles?.join(', ')}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
