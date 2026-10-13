import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentApi } from '../api/services';
import type { Enrollment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  PlayCircle,
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let isMounted = true;
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const res = await enrollmentApi.getMyCourses(0, 50);
        if (isMounted && res?.content) {
          setEnrollments(res.content);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách khóa học của tôi', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyCourses();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Khu vực học tập cá nhân</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Khóa học của tôi
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            Theo dõi tiến trình và tiếp tục các bài giảng trong lộ trình học tập của bạn.
          </p>
        </div>
      </section>

      {/* Danh sách khóa học */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Đang tải các khóa học của bạn...</p>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {enrollments.map((item) => (
              <article
                key={item.enrollmentId}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      item.courseThumbnailUrl ||
                      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={item.courseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-indigo-700 shadow-sm backdrop-blur-sm">
                    {item.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang học'}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.courseTitle}
                    </h2>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {item.courseDescription || 'Khóa học trang bị kiến thức chuyên sâu và kỹ năng thực tế.'}
                    </p>

                    {/* Thanh tiến độ học tập */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Tiến độ</span>
                        <span className="text-indigo-600">{item.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${item.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ngày đăng ký: {new Date(item.enrolledAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <Link
                    to={`/courses/${item.courseId}`}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Tiếp tục học ngay</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-200 max-w-lg mx-auto">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">Bạn chưa đăng ký khóa học nào</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Khám phá ngay danh mục các khóa học lập trình thực chiến để bắt đầu hành trình.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Khám phá khóa học</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
