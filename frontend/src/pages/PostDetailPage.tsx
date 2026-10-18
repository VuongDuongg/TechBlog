import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postApi, commentApi } from '../api/services';
import type { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { ContentRenderer } from '../components/ContentRenderer';
import {
  Calendar,
  ArrowLeft,
  MessageSquare,
  Send,
  Trash2,
  Share2,
  FileQuestion,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPostData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // Kiểm tra xem slug có phải là ID số không
        const isNumeric = /^\d+$/.test(slug);
        const postRes = isNumeric
          ? await postApi.getById(Number(slug))
          : await postApi.getBySlug(slug);

        if (isMounted && postRes) {
          setPost(postRes);
          // Tải danh sách bình luận
          const commentRes = await commentApi.getByPostId(postRes.id, 0, 50);
          if (commentRes?.content) {
            setComments(commentRes.content);
          }
        }
      } catch (err) {
        console.error('Không tìm thấy bài viết', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPostData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    if (!isAuthenticated) {
      setErrorMsg('Vui lòng đăng nhập để gửi bình luận.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const created = await commentApi.create(post.id, newComment.trim());
      setComments([created, ...comments]);
      setNewComment('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      let msg = 'Không thể gửi bình luận!';
      if (typeof error.response?.data === 'string') {
        msg = error.response.data;
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      await commentApi.delete(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch {
      alert('Không thể xóa bình luận này.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          <p className="text-sm font-medium text-slate-500">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <FileQuestion className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy bài viết</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Bài viết này không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Danh sách bài viết
        </Link>

        <div className="space-y-4">
          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-violet-100 text-violet-700">
            {post.categoryName || 'Công nghệ'}
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center">
                {post.authorName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{post.authorName || 'Tác giả TechBlog'}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Đã sao chép liên kết bài viết vào clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Thumbnail Image */}
        {post.thumbnailUrl && (
          <div className="my-8 aspect-video rounded-2xl overflow-hidden shadow-sm bg-slate-100">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body (Markdown, Code Highlighting, YouTube Embed) */}
        <div className="py-6">
          <ContentRenderer
            content={post.content}
            theme="light"
            showVideoPlayer={true}
          />
        </div>

        {/* ---------------- SECTION BÌNH LUẬN ---------------- */}
        <section className="mt-12 pt-10 border-t border-slate-200 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-violet-600" />
              <span>Bình luận ({comments.length})</span>
            </h2>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form nhập bình luận */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label htmlFor="commentInput" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Viết suy nghĩ của bạn
              </label>
              <textarea
                id="commentInput"
                rows={3}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ quan điểm hoặc đặt câu hỏi cho tác giả..."
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-violet-600 hover:bg-violet-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Gửi bình luận</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-violet-50/60 border border-violet-100 text-center space-y-2">
              <p className="text-sm text-slate-700 font-medium">
                Bạn cần đăng nhập để tham gia thảo luận cùng cộng đồng.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:underline"
              >
                Đăng nhập ngay <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Danh sách bình luận */}
          <div className="space-y-4">
            {comments.map((comment) => {
              const canDelete =
                isAdmin || (user && (user.id === comment.userId || user.email === comment.userEmail));

              return (
                <div
                  key={comment.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {comment.userFullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {comment.userFullName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa bình luận"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );
};
