import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseApi, lessonApi, enrollmentApi } from '../api/services';
import type { Course, Lesson, CourseProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  BookOpen,
  X,
  Loader2,
  Trophy,
  Award,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

export const LearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const numCourseId = Number(courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 1. Kiểm tra xác thực & Tải dữ liệu khóa học, bài học, tiến độ
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/learning/${courseId}` } });
      return;
    }

    if (!numCourseId) {
      navigate('/courses');
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        // Tải đồng thời thông tin khóa học, danh sách bài học và tiến độ
        const [courseRes, lessonsRes, progressRes] = await Promise.all([
          courseApi.getById(numCourseId),
          lessonApi.getByCourseId(numCourseId),
          enrollmentApi.getProgress(numCourseId).catch((err) => {
            console.warn('Chưa đăng ký khóa học hoặc không lấy được tiến độ', err);
            return null;
          }),
        ]);

        if (!isMounted) return;

        setCourse(courseRes);

        // Sắp xếp bài học theo orderIndex
        const sortedLessons = (lessonsRes || []).sort((a, b) => a.orderIndex - b.orderIndex);
        setLessons(sortedLessons);

        if (progressRes) {
          setProgress(progressRes);

          // Tự động chọn bài học tiếp theo chưa hoàn thành, hoặc bài đầu tiên
          const completedSet = new Set(progressRes.completedLessonIds || []);
          const firstIncomplete = sortedLessons.find((l) => !completedSet.has(l.id));
          setActiveLesson(firstIncomplete || sortedLessons[0] || null);
        } else {
          setActiveLesson(sortedLessons[0] || null);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu phòng học', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [numCourseId, isAuthenticated, navigate, courseId]);

  // Tập hợp các ID bài học đã hoàn thành
  const completedLessonIdSet = useMemo(() => {
    return new Set(progress?.completedLessonIds || []);
  }, [progress]);

  // Vị trí bài học hiện tại trong danh sách
  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return lessons.findIndex((l) => l.id === activeLesson.id);
  }, [lessons, activeLesson]);

  const hasPrevLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1;

  // Chuyển bài trước
  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      setActiveLesson(lessons[currentLessonIndex - 1]);
    }
  };

  // Chuyển bài tiếp theo
  const handleNextLesson = () => {
    if (hasNextLesson) {
      setActiveLesson(lessons[currentLessonIndex + 1]);
    }
  };

  // Đánh dấu hoàn thành / chưa hoàn thành bài học
  const handleToggleComplete = async (lessonToToggle?: Lesson) => {
    const target = lessonToToggle || activeLesson;
    if (!target || toggling) return;

    try {
      setToggling(true);
      const updatedProgress = await enrollmentApi.toggleProgress(numCourseId, target.id);
      setProgress(updatedProgress);

      // Nếu đang tick hoàn thành bài hiện tại và bài này vừa được đánh dấu xong, tự động gợi ý chuyển bài sau
      const wasCompleted = completedLessonIdSet.has(target.id);
      if (!wasCompleted && hasNextLesson && !lessonToToggle) {
        // Tự động chuyển bài tiếp theo sau 400ms để trải nghiệm mượt mà
        setTimeout(() => {
          handleNextLesson();
        }, 400);
      }
    } catch (error) {
      console.error('Không thể cập nhật tiến độ bài học', error);
    } finally {
      setToggling(false);
    }
  };

  const isCurrentCompleted = activeLesson ? completedLessonIdSet.has(activeLesson.id) : false;
  const isAllCompleted = progress ? progress.progressPercentage === 100 : false;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] bg-slate-900 text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-slate-400">Đang khởi tạo không gian học tập...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin khóa học</h2>
        <Link
          to="/courses"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center max-w-lg mx-auto">
        <Award className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Bạn chưa đăng ký khóa học này</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Vui lòng hoàn tất đăng ký để tham gia phòng học và lưu trữ tiến độ cá nhân của bạn.
        </p>
        <Link
          to={`/courses/${numCourseId}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Sparkles className="w-4 h-4" /> Xem và Đăng ký ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. TOP HEADER (Thanh điều khiển đầu trang) */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/courses/${numCourseId}`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Quay lại trang chi tiết khóa học"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Rời phòng học</span>
          </Link>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate">
              {course.title}
            </h1>
            <p className="text-xs text-slate-400 truncate hidden md:block">
              {course.categoryName} • Bài {currentLessonIndex + 1}/{lessons.length}
            </p>
          </div>
        </div>

        {/* Thanh tiến độ & Toggle Sidebar */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Thanh phần trăm tiến độ */}
          <div className="flex items-center gap-3 bg-slate-800/70 py-1.5 px-3 rounded-full border border-slate-700/60">
            <div className="w-20 sm:w-28 h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-emerald-400">
              {progress.progressPercentage}%
            </span>
            {isAllCompleted && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" /> Hoàn thành
              </span>
            )}
          </div>

          {/* Nút bật/tắt giáo trình */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              sidebarOpen
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Danh sách bài giảng"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT (Phần hiển thị nội dung bài học + Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* KHU VỰC CHÍNH: NỘI DUNG BÀI HỌC */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-900/40">
          {activeLesson ? (
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Banner chúc mừng nếu hoàn thành 100% */}
                {isAllCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-300">
                          Xuất sắc! Bạn đã hoàn thành 100% khóa học
                        </h4>
                        <p className="text-xs text-slate-400">
                          Tất cả các bài học đã được đánh dấu hoàn thành. Bạn có thể ôn tập bất cứ lúc nào.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tiêu đề bài học */}
                <div className="border-b border-slate-800 pb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Bài số {activeLesson.orderIndex}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Khung nội dung chi tiết của bài học */}
                <article className="prose prose-invert max-w-none text-slate-200 leading-relaxed space-y-4">
                  <div className="bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-inner whitespace-pre-line text-sm sm:text-base leading-7 font-sans">
                    {activeLesson.content || 'Nội dung bài học đang được biên soạn chi tiết.'}
                  </div>
                </article>
              </div>

              {/* FOOTER ĐIỀU HƯỚNG BÀI HỌC (Bottom Navigation Bar) */}
              <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevLesson}
                  disabled={!hasPrevLesson}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    hasPrevLesson
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Bài trước</span>
                </button>

                {/* Nút Hoàn thành bài học */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete()}
                  disabled={toggling}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                    isCurrentCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                  }`}
                >
                  {toggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentCompleted ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Đã hoàn thành</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Hoàn thành bài học</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextLesson}
                  disabled={!hasNextLesson}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    hasNextLesson
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span>Bài tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 text-sm">
              <BookOpen className="w-12 h-12 mb-3 text-slate-600" />
              <span>Chưa có bài học nào được chọn</span>
            </div>
          )}
        </main>

        {/* SIDEBAR GIÁO TRÌNH BÀI HỌC (Curriculum Playlist) */}
        <aside
          className={`w-80 sm:w-96 border-l border-slate-800 bg-slate-900/95 flex flex-col shrink-0 transition-all duration-300 z-20 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 inset-y-0'
          }`}
        >
          {/* Header Sidebar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>Nội dung khóa học</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                  {lessons.length} bài
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Đã học: {progress.completedCount}/{lessons.length} bài ({progress.progressPercentage}%)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors sm:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Danh sách cuộn các bài học */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {lessons.map((lesson, idx) => {
              const isSelected = activeLesson?.id === lesson.id;
              const isCompleted = completedLessonIdSet.has(lesson.id);

              return (
                <div
                  key={lesson.id}
                  className={`group rounded-xl transition-all flex items-center gap-3 p-3 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                  onClick={() => setActiveLesson(lesson)}
                >
                  {/* Icon trạng thái hoàn thành (Bấm vào icon để toggle nhanh) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(lesson);
                    }}
                    title={isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                    className="shrink-0 p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : isSelected ? (
                      <PlayCircle className="w-5 h-5 text-indigo-400 animate-pulse" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                    )}
                  </button>

                  {/* Tiêu đề và thông tin bài */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isSelected ? 'text-indigo-300' : 'text-slate-200'
                      }`}
                    >
                      {idx + 1}. {lesson.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isCompleted ? '✓ Đã học' : isSelected ? '▶ Đang học' : 'Chưa học'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
