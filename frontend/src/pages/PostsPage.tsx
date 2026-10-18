import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postApi, categoryApi } from '../api/services';
import type { Post, Category } from '../types';
import { Pagination } from '../components/Pagination';
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  Filter,
  X,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Bộ lọc
  const [keyword, setKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt,desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // 1. Tải danh mục khi mount
  useEffect(() => {
    let isMounted = true;
    categoryApi
      .getAll()
      .then((cats) => {
        if (isMounted) setCategories(cats);
      })
      .catch((err) => console.error('Lỗi khi tải danh mục bài viết', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải bài viết theo bộ lọc từ Backend (Server-side Search & Filter)
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postApi.getAll({
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategoryId,
        sort: sortBy,
      });

      if (res) {
        setPosts(res.content || []);
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách bài viết', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, selectedCategoryId, sortBy]);

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    setCurrentPage(1);
  };

  const handleCategorySelect = (id?: number) => {
    setSelectedCategoryId(id);
    setCurrentPage(1);
  };

  const handleSortChange = (sortVal: string) => {
    setSortBy(sortVal);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategoryId(undefined);
    setSortBy('createdAt,desc');
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Banner Bài Viết */}
      <section className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Kho tàng tri thức công nghệ</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Bài viết & Thủ thuật lập trình
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
            Tổng hợp kinh nghiệm thực chiến, kiến trúc hệ thống và cập nhật xu hướng công nghệ mới nhất.
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
                placeholder="Tìm bài viết theo tiêu đề hoặc nội dung..."
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-inner"
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

            {/* Sắp xếp */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-violet-500 cursor-pointer shadow-sm"
              >
                <option value="createdAt,desc">Mới nhất</option>
                <option value="createdAt,asc">Cũ nhất</option>
                <option value="title,asc">Tiêu đề (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Hàng 2: Danh mục (Category Tabs) */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Chuyên mục:
            </span>
            <button
              type="button"
              onClick={() => handleCategorySelect(undefined)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategoryId === undefined
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
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
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            {(keyword || selectedCategoryId !== undefined) && (
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
            Tìm thấy <strong>{totalElements}</strong> bài viết phù hợp
          </span>
        </div>

        {/* Danh sách thẻ Bài Viết */}
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
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 overflow-hidden"
                  >
                    {/* Ảnh bài viết */}
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                      <img
                        src={
                          post.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-violet-700 shadow-sm backdrop-blur-sm">
                        {post.categoryName || 'Công nghệ'}
                      </span>
                    </div>

                    {/* Nội dung tóm tắt */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h2 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {post.content.replace(/<[^>]*>?/gm, '')}
                        </p>
                      </div>

                      {/* Tác giả & Ngày đăng */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{post.authorName || 'Tác giả'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <Link
                        to={`/posts/${post.slug}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all"
                      >
                        <span>Đọc tiếp</span>
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
              <h2 className="text-lg font-bold text-slate-800">Không tìm thấy bài viết phù hợp</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-violet-600 hover:bg-violet-700 shadow-md transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
