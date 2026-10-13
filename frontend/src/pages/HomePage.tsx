import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi, postApi } from '../api/services';
import type { Course, Post } from '../types';
import {
  BookOpen,
  FileText,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  Code2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, postRes] = await Promise.allSettled([
          courseApi.getAll(0, 3),
          postApi.getAll(0, 3),
        ]);

        if (isMounted) {
          if (courseRes.status === 'fulfilled' && courseRes.value?.content) {
            setCourses(courseRes.value.content);
          }
          if (postRes.status === 'fulfilled' && postRes.value?.content) {
            setPosts(postRes.value.content);
          }
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/30 to-violet-500/20 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Nền tảng đào tạo & chia sẻ kiến thức công nghệ hiện đại</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            Nâng tầm kỹ năng lập trình cùng{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
              TechBlog Academy
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Khám phá các khóa học bài bản từ Backend Spring Boot đến Frontend React, cùng hàng trăm bài viết kỹ thuật chuyên sâu cập nhật mỗi ngày.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khám phá khóa học</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
              <span>Đọc bài viết mới</span>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <GraduationCap className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="font-bold text-lg text-white">100% Thực chiến</div>
              <div className="text-xs text-slate-400">Dự án chuẩn doanh nghiệp</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <Code2 className="w-5 h-5 text-violet-400 mb-2" />
              <div className="font-bold text-lg text-white">Fullstack Tech</div>
              <div className="text-xs text-slate-400">Java Spring & React TS</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <Users className="w-5 h-5 text-sky-400 mb-2" />
              <div className="font-bold text-lg text-white">Cộng đồng</div>
              <div className="text-xs text-slate-400">Hỗ trợ trao đổi 24/7</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-bold text-lg text-white">Cập nhật liên tục</div>
              <div className="text-xs text-slate-400">Kiến thức đón đầu xu thế</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COURSES SECTION */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">
              <BookOpen className="w-4 h-4" /> Khóa học tiêu biểu
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Lộ trình đào tạo chuyên sâu
            </h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 group"
          >
            <span>Xem tất cả khóa học</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4 animate-pulse"
              >
                <div className="h-44 bg-slate-100 rounded-xl" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
              >
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      course.thumbnailUrl ||
                      `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80`
                    }
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur-sm text-indigo-700 shadow-sm">
                    {course.categoryName || 'Lập trình'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description || 'Khóa học cung cấp kiến thức nền tảng và bài tập thực hành toàn diện.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span>{course.totalLessons || 12} bài học</span>
                    </div>
                    <div className="font-bold text-base text-indigo-600">
                      {course.price > 0 ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-700">Đang chuẩn bị danh sách khóa học</h3>
            <p className="text-sm text-slate-500 mt-1">Các khóa học chất lượng cao sẽ sớm được công bố.</p>
          </div>
        )}
      </section>

      {/* 3. FEATURED POSTS SECTION */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600 mb-2">
              <FileText className="w-4 h-4" /> Blog & Chia sẻ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Bài viết công nghệ mới nhất
            </h2>
          </div>
          <Link
            to="/posts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 group"
          >
            <span>Tất cả bài viết</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4 animate-pulse"
              >
                <div className="h-44 bg-slate-100 rounded-xl" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300"
              >
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      post.thumbnailUrl ||
                      `https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80`
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur-sm text-violet-700 shadow-sm">
                    {post.categoryName || 'Kiến trúc'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{post.authorName || 'Tác giả TechBlog'}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-700">Chưa có bài viết nào</h3>
            <p className="text-sm text-slate-500 mt-1">Đón đọc các bài viết công nghệ mới nhất trong thời gian tới.</p>
          </div>
        )}
      </section>
    </div>
  );
};
