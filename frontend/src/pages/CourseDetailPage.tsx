import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseApi, lessonApi, enrollmentApi } from '../api/services';
import type { Course, Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Clock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const courseId = Number(id);

  useEffect(() => {
    let isMounted = true;
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const [courseRes, lessonsRes] = await Promise.allSettled([
          courseApi.getById(courseId),
          lessonApi.getByCourseId(courseId),
        ]);

        if (isMounted) {
          if (courseRes.status === 'fulfilled') {
            setCourse(courseRes.value);
          }
          if (lessonsRes.status === 'fulfilled' && lessonsRes.value) {
            setLessons(lessonsRes.value);
            if (lessonsRes.value.length > 0) {
              setActiveLesson(lessonsRes.value[0]);
            }
          }
        }

        // Kiểm tra trạng thái ghi danh nếu đã đăng nhập
        if (isAuthenticated) {
          try {
            const statusRes = await enrollmentApi.checkStatus(courseId);
            if (isMounted) setIsEnrolled(statusRes.enrolled);
          } catch {
            // Chưa đăng nhập hoặc chưa đăng ký
          }
        }
      } catch (err) {
        console.error('Không tìm thấy khóa học', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourseData();
    return () => {
      isMounted = false;
    };
  }, [courseId, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    try {
      setEnrolling(true);
      setMessage(null);
      await enrollmentApi.enroll(courseId);
      setIsEnrolled(true);
      setMessage({
        type: 'success',
        text: 'Chúc mừng bạn đã đăng ký khóa học thành công! Bây giờ bạn có thể học tất cả bài giảng.',
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      let errTxt = 'Đăng ký không thành công!';
      if (typeof error.response?.data === 'string') {
        errTxt = error.response.data;
      } else if (error.response?.data?.message) {
        errTxt = error.response.data.message;
      }
      setMessage({ type: 'error', text: errTxt });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <FileQuestion className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy khóa học</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Khóa học này có thể không tồn tại hoặc đã bị xóa.</p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Tất cả khóa học
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {course.categoryName || 'Khóa học chuyên sâu'}
            </span>
            {isEnrolled && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã đăng ký học
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {course.title}
          </h1>
          <p className="text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            {course.description}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>{message.text}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cột trái: Nội dung bài giảng được chọn */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                  <PlayCircle className="w-5 h-5" />
                  <span>Bài giảng hiện tại:</span>
                </div>
                <span className="text-xs text-slate-400">
                  {lessons.length > 0
                    ? `Bài ${activeLesson?.orderIndex || 1} / ${lessons.length}`
                    : 'Chưa có bài giảng'}
                </span>
              </div>

              {activeLesson ? (
                <div className="mt-6 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {activeLesson.title}
                  </h2>

                  {/* Kiểm tra quyền xem nội dung: Nếu đã đăng ký HOẶC là bài học đầu tiên (preview) */}
                  {isEnrolled || activeLesson.orderIndex === 1 ? (
                    <div className="prose max-w-none text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-200/80 whitespace-pre-line text-sm sm:text-base">
                      {activeLesson.content || 'Nội dung bài học đang được biên soạn chi tiết.'}
                    </div>
                  ) : (
                    <div className="py-12 px-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                      <Lock className="w-10 h-10 text-slate-400 mx-auto" />
                      <h3 className="font-bold text-slate-800 text-base">Nội dung bài học bị khóa</h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                        Bạn cần đăng ký khóa học này để mở khóa toàn bộ các bài học tiếp theo.
                      </p>
                      <button
                        type="button"
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                      >
                        {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>Đăng ký ngay</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Chưa có bài học nào trong khóa này.
                </div>
              )}
            </div>

            {/* Danh mục giáo trình bài học */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" /> Giáo trình khóa học ({lessons.length} bài)
              </h3>
              <div className="divide-y divide-slate-100">
                {lessons.map((lesson) => {
                  const isSelected = activeLesson?.id === lesson.id;
                  const isLocked = !isEnrolled && lesson.orderIndex > 1;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left py-3.5 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lesson.orderIndex}
                        </div>
                        <span className="text-sm line-clamp-1">{lesson.title}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Lock className="w-3.5 h-3.5" /> Khóa
                          </span>
                        ) : (
                          <span className="text-indigo-600 font-medium">Học thử</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cột phải: Thẻ tóm tắt & Nút đăng ký */}
          <div className="space-y-6 sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg p-6 space-y-6">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={
                    course.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Học phí</span>
                <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                  {course.price > 0 ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                </div>
              </div>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Bạn đã sở hữu khóa học này!</span>
                  </div>
                  <Link
                    to={`/learning/${course.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Vào phòng học ngay</span>
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isAuthenticated ? 'Đăng ký tham gia ngay' : 'Đăng nhập để tham gia'}</span>
                    </>
                  )}
                </button>
              )}

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Tổng số bài học: <strong>{lessons.length} bài giảng</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Thời lượng truy cập: <strong>Trọn đời</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Cấp chứng nhận khi hoàn thành</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
