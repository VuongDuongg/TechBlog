import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../api/services';
import type { Course } from '../types';
import {
  Search,
  Layers,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await courseApi.getAll(0, 50);
        if (isMounted && res?.content) {
          setCourses(res.content);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách khóa học', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh mục duy nhất
  const categories = ['ALL', ...Array.from(new Set(courses.map((c) => c.categoryName).filter(Boolean)))];

  // Lọc theo từ khóa và category
  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || c.categoryName === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Banner Khóa Học */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Chương trình giảng dạy chuyên sâu</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Khám phá các khóa học lập trình
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
            Từ cơ bản đến chuyên sâu, tự tin xây dựng ứng dụng chuẩn doanh nghiệp cùng các chuyên gia hàng đầu.
          </p>
        </div>
      </section>

      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-slate-200">
          {/* Ô tìm kiếm */}
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          {/* Phân loại Tags */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách thẻ Khóa Học */}
        <div className="py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                  <div className="aspect-video bg-slate-100 rounded-xl" />
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCourses.map((course) => (
                <article
                  key={course.id}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        course.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-indigo-700 shadow-sm backdrop-blur-sm">
                      {course.categoryName || 'Lập trình'}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {course.title}
                      </h2>
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {course.description || 'Khóa học trang bị tư duy và kỹ năng thực chiến toàn diện.'}
                      </p>
                    </div>

                    <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>{course.totalLessons || 0} bài học</span>
                      </div>
                      <div className="font-extrabold text-base text-indigo-600">
                        {course.price > 0 ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                      </div>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 group-hover:bg-indigo-600 transition-colors shadow-sm"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
              <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy khóa học phù hợp</h3>
              <p className="text-sm text-slate-500 mt-1">Hãy thử tìm với từ khóa hoặc danh mục khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
