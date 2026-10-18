import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { courseApi, categoryApi } from '../api/services';
import type { Course, Category } from '../types';
import { Pagination } from '../components/Pagination';
import {
  Search,
  Layers,
  ArrowRight,
  Sparkles,
  Filter,
  X,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Bộ lọc
  const [keyword, setKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt,desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // 1. Tải danh mục một lần khi mount
  useEffect(() => {
    let isMounted = true;
    categoryApi
      .getAll()
      .then((cats) => {
        if (isMounted) setCategories(cats);
      })
      .catch((err) => console.error('Lỗi tải danh mục', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải khóa học theo bộ lọc từ Backend (Server-side Search & Filter)
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const isFreeParam = priceFilter === 'FREE' ? true : priceFilter === 'PAID' ? false : undefined;

      const res = await courseApi.getAll({
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategoryId,
        isFree: isFreeParam,
        sort: sortBy,
      });

      if (res) {
        setCourses(res.content || []);
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm khóa học', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, selectedCategoryId, priceFilter, sortBy]);

  // Debounce tìm kiếm từ khóa
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchCourses]);

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    setCurrentPage(1);
  };

  const handleCategorySelect = (id?: number) => {
    setSelectedCategoryId(id);
    setCurrentPage(1);
  };

  const handlePriceSelect = (price: 'ALL' | 'FREE' | 'PAID') => {
    setPriceFilter(price);
    setCurrentPage(1);
  };

  const handleSortChange = (sortVal: string) => {
    setSortBy(sortVal);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategoryId(undefined);
    setPriceFilter('ALL');
    setSortBy('createdAt,desc');
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Banner Khóa Học */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Chương trình giảng dạy chuyên sâu</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Khám phá các khóa học lập trình
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
            Tìm kiếm khóa học theo công nghệ, danh mục và trình độ với lộ trình chuẩn doanh nghiệp.
          </p>
        </div>
      </section>

      {/* BỘ LỌC & TÌM KIẾM (SEARCH & FILTER TOOLBAR) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
          {/* Hàng 1: Ô tìm kiếm + Sắp xếp */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Ô tìm kiếm */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mô tả khóa học..."
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => handleKeywordChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bộ lọc Học phí & Sắp xếp */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Lọc học phí: Tất cả / Miễn phí / Có phí */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => handlePriceSelect('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    priceFilter === 'ALL' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Tất cả giá
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceSelect('FREE')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    priceFilter === 'FREE' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Miễn phí
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceSelect('PAID')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    priceFilter === 'PAID' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Có phí
                </button>
              </div>

              {/* Sắp xếp */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                >
                  <option value="createdAt,desc">Mới nhất</option>
                  <option value="createdAt,asc">Cũ nhất</option>
                  <option value="price,asc">Giá thấp đến cao</option>
                  <option value="price,desc">Giá cao đến thấp</option>
                  <option value="title,asc">Tên (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hàng 2: Danh mục (Category Tabs) */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Danh mục:
            </span>
            <button
              type="button"
              onClick={() => handleCategorySelect(undefined)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategoryId === undefined
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            {(keyword || selectedCategoryId !== undefined || priceFilter !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 ml-auto transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Thông tin số lượng tìm thấy */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
          <span>
            Tìm thấy <strong>{totalElements}</strong> khóa học phù hợp
          </span>
        </div>

        {/* Danh sách thẻ Khóa Học */}
        <div className="pb-8">
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
          ) : courses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {courses.map((course) => (
                  <article
                    key={course.id}
                    className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
                  >
                    {/* Ảnh khóa học */}
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                      <img
                        src={
                          course.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-indigo-700 shadow-sm backdrop-blur-sm">
                        {course.categoryName || 'Khóa học'}
                      </span>
                    </div>

                    {/* Nội dung tóm tắt */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {course.title}
                        </h2>
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {course.description || 'Chương trình đào tạo chuyên sâu trang bị đầy đủ kiến thức thực tế.'}
                        </p>
                      </div>

                      {/* Footer thẻ: Bài học & Giá & Nút */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span>{course.totalLessons} bài học</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-indigo-600">
                            {course.price > 0 ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/courses/${course.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-600/20"
                      >
                        <span>Chi tiết khóa học</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            /* Khi không có kết quả */
            <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-200 max-w-lg mx-auto">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-800">Không tìm thấy khóa học phù hợp</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Thử đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc danh mục/học phí.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Xóa tất cả bộ lọc</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
