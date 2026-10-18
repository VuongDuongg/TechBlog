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
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State cho phần đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Cập nhật thông tin họ tên
  const handleSubmitProfile = async (e: React.FormEvent) => {
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

  // Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (!currentPassword) {
      setPassMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Xác nhận mật khẩu mới không trùng khớp.' });
      return;
    }

    if (newPassword === currentPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' });
      return;
    }

    try {
      setChangingPass(true);
      await userApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPassMsg({
        type: 'success',
        text: 'Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực.',
      });

      // Reset các trường nhập
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      let errTxt = 'Đổi mật khẩu thất bại!';
      if (typeof error.response?.data === 'string') {
        errTxt = error.response.data;
      } else if (error.response?.data?.message) {
        errTxt = error.response.data.message;
      }
      setPassMsg({ type: 'error', text: errTxt });
    } finally {
      setChangingPass(false);
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
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <User className="w-4 h-4" />
            <span>Tài khoản của tôi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hồ sơ & Bảo mật cá nhân
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Quản lý thông tin tài khoản, cập nhật họ tên và đổi mật khẩu bảo mật.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: Avatar & Tóm tắt người dùng */}
          <div className="space-y-6">
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

            {/* Mẹo bảo mật */}
            <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Bảo mật tài khoản</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nên đặt mật khẩu có ít nhất 6 ký tự kết hợp chữ cái và số để đảm bảo tính an toàn cho tài khoản học tập.
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: 2 Thẻ (Thông tin cá nhân & Đổi mật khẩu) */}
          <div className="lg:col-span-2 space-y-8">
            {/* THẺ 1: THÔNG TIN CHI TIẾT */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Thông tin cá nhân</span>
                </h3>
              </div>

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

              <form onSubmit={handleSubmitProfile} className="space-y-5">
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

                <div className="pt-2 flex justify-end">
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
                    <span>Lưu thay đổi họ tên</span>
                  </button>
                </div>
              </form>
            </div>

            {/* THẺ 2: ĐỔI MẬT KHẨU (CHANGE PASSWORD) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                    <span>Đổi mật khẩu</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cập nhật mật khẩu định kỳ giúp bảo vệ tài khoản và khóa học của bạn an toàn.
                  </p>
                </div>
              </div>

              {passMsg && (
                <div
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                    passMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <div>{passMsg.text}</div>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* 1. Mật khẩu hiện tại */}
                <div>
                  <label
                    htmlFor="currentPasswordInput"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                  >
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="currentPasswordInput"
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-slate-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Mật khẩu mới */}
                <div>
                  <label
                    htmlFor="newPasswordInput"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                  >
                    Mật khẩu mới (Tối thiểu 6 ký tự)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="newPasswordInput"
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-slate-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Xác nhận mật khẩu mới */}
                <div>
                  <label
                    htmlFor="confirmPasswordInput"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirmPasswordInput"
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-slate-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPass}
                    className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-60 transition-all cursor-pointer shadow-md shadow-slate-900/20"
                  >
                    {changingPass ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Cập nhật mật khẩu</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
