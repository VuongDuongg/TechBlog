import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postApi, categoryApi } from '../api/services';
import type { Post, Category } from '../types';
import { Pagination } from '../components/Pagination';
import {
  FileText,
  Search,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [postsRes, catsRes] = await Promise.all([
          postApi.getAll(0, 100),
          categoryApi.getAll(),
        ]);
        if (isMounted) {
          if (postsRes?.content) setPosts(postsRes.content);
          if (catsRes) setCategories(catsRes);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách bài viết', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc bài viết
  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || p.categoryName === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Banner Bài Viết */}
      <section className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Góc nhìn kỹ thuật & kinh nghiệm thực chiến</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Bài viết & Kiến thức công nghệ
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
            Tổng hợp các bài chia sẻ chuyên sâu về Java, Spring Boot, React, kiến trúc Microservices và tối ưu hiệu năng.
          </p>
        </div>
      </section>

      {/* Tìm kiếm & Bộ lọc */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-slate-200">
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleCategoryChange('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách thẻ Bài Viết */}
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
          ) : currentPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {currentPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                      <img
                        src={
                          post.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-violet-700 shadow-sm backdrop-blur-sm">
                        {post.categoryName || 'Công nghệ'}
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h2 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.authorName || 'TechBlog'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <Link
                        to={`/posts/${post.slug || post.id}`}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 group-hover:bg-violet-600 transition-colors shadow-sm"
                      >
                        <span>Đọc bài viết</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Điều khiển phân trang */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                accentColor="violet"
              />
            </>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy bài viết nào</h3>
              <p className="text-sm text-slate-500 mt-1">Hãy thử tìm với từ khóa hoặc danh mục khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
