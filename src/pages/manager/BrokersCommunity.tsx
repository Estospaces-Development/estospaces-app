import React, { useState, useMemo } from 'react';
import { Users, Plus } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import CommunityStats from '../../components/community/CommunityStats';
import CommunityFilterBar, { SortOption } from '../../components/community/CommunityFilterBar';
import CommunityPostCard from '../../components/community/CommunityPostCard';
import CreatePostModal from '../../components/community/CreatePostModal';
import CommentsModal from '../../components/community/CommentsModal';
import { communityPosts, CommunityPost, PostTag, AuthorRole, PostVisibility, Comment } from '../../mocks/communityPosts';

const BrokersCommunity: React.FC = () => {
    const [posts, setPosts] = useState<CommunityPost[]>(communityPosts);
    const [selectedTag, setSelectedTag] = useState<PostTag | 'all'>('all');
    const [selectedRole, setSelectedRole] = useState<AuthorRole | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('pinned_first');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

    // Calculate stats from posts
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const urgentPostsToday = posts.filter(
            (post) => post.tag === 'urgent' && post.createdAt >= today
        ).length;

        const dealsShared = posts.filter((post) => post.tag === 'deal').length;

        const uniqueBrokers = new Set(
            posts.filter((post) => post.authorRole === 'broker').map((post) => post.authorName)
        ).size;

        return {
            totalPosts: posts.length,
            activeBrokers: uniqueBrokers,
            urgentPostsToday,
            dealsShared,
        };
    }, [posts]);

    // Filter and sort posts
    const filteredAndSortedPosts = useMemo(() => {
        let filtered = posts;

        // Filter by tag
        if (selectedTag !== 'all') {
            filtered = filtered.filter((post) => post.tag === selectedTag);
        }

        // Filter by role
        if (selectedRole !== 'all') {
            filtered = filtered.filter((post) => post.authorRole === selectedRole);
        }

        // Sort
        let sorted = [...filtered];
        switch (sortBy) {
            case 'latest':
                sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case 'most_active':
                sorted.sort(
                    (a, b) =>
                        b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount)
                );
                break;
            case 'pinned_first':
                sorted.sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return b.createdAt.getTime() - a.createdAt.getTime();
                });
                break;
        }

        return sorted;
    }, [posts, selectedTag, selectedRole, sortBy]);

    // Handle like
    const handleLike = (postId: string) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.postId === postId
                    ? { ...post, likesCount: post.likesCount + 1 }
                    : post
            )
        );
    };

    // Handle pin/unpin
    const handlePin = (postId: string) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.postId === postId ? { ...post, isPinned: !post.isPinned } : post
            )
        );

        // Show toast notification
        const post = posts.find((p) => p.postId === postId);
        if (post) {
            const action = post.isPinned ? 'unpinned' : 'pinned';
            showToast(`Post ${action} successfully`);
        }
    };

    // Handle hide
    const handleHide = (postId: string) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.postId !== postId));
        showToast('Post hidden successfully');
    };

    // Handle visibility change
    const handleVisibilityChange = (postId: string, visibility: PostVisibility) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.postId === postId ? { ...post, visibility } : post
            )
        );
        showToast(`Visibility updated to "${visibility}"`);
    };

    // Handle create post
    const handleCreatePost = (content: string, tag: PostTag, visibility: PostVisibility) => {
        const newPost: CommunityPost = {
            postId: `post-${Date.now()}`,
            authorName: 'Current Manager', // In real app, get from auth context
            authorRole: 'manager',
            content,
            tag,
            createdAt: new Date(),
            likesCount: 0,
            commentsCount: 0,
            comments: [],
            isPinned: false,
            visibility,
        };

        setPosts((prevPosts) => [newPost, ...prevPosts]);
        showToast('Post created successfully!');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle comment click
    const handleCommentClick = (post: CommunityPost) => {
        setSelectedPost(post);
        setIsCommentsModalOpen(true);
    };

    // Handle add comment
    const handleAddComment = (postId: string, content: string) => {
        const newComment: Comment = {
            commentId: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            authorName: 'Current Manager', // In real app, get from auth context
            authorRole: 'manager',
            content,
            createdAt: new Date(),
        };

        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post.postId === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, newComment],
                        commentsCount: post.commentsCount + 1,
                    };
                }
                return post;
            })
        );

        // Update selected post as well
        setSelectedPost((prev) => {
            if (prev && prev.postId === postId) {
                return {
                    ...prev,
                    comments: [...prev.comments, newComment],
                    commentsCount: prev.commentsCount + 1,
                };
            }
            return prev;
        });

        showToast('Comment added successfully!');
    };

    // Simple toast notification
    const showToast = (message: string) => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className =
            'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-right';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <BackButton />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Brokers Community
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Internal space for coordination, updates & deal acceleration
                            </p>
                        </div>
                    </div>

                    {/* Create Post Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Post</span>
                    </button>
                </div>

                {/* Community Stats */}
                <CommunityStats
                    totalPosts={stats.totalPosts}
                    activeBrokers={stats.activeBrokers}
                    urgentPostsToday={stats.urgentPostsToday}
                    dealsShared={stats.dealsShared}
                />

                {/* Filter Bar */}
                <CommunityFilterBar
                    selectedTag={selectedTag}
                    selectedRole={selectedRole}
                    sortBy={sortBy}
                    onTagChange={setSelectedTag}
                    onRoleChange={setSelectedRole}
                    onSortChange={setSortBy}
                />

                {/* Post Feed */}
                <div className="space-y-4">
                    {filteredAndSortedPosts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No posts found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Try adjusting your filters or be the first to create a post!
                            </p>
                        </div>
                    ) : (
                        filteredAndSortedPosts.map((post) => (
                            <CommunityPostCard
                                key={post.postId}
                                post={post}
                                isManager={true}
                                onLike={handleLike}
                                onPin={handlePin}
                                onHide={handleHide}
                                onVisibilityChange={handleVisibilityChange}
                                onCommentClick={handleCommentClick}
                            />
                        ))
                    )}
                </div>

                {/* Create Post Modal */}
                <CreatePostModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreatePost}
                />

                {/* Comments Modal */}
                <CommentsModal
                    isOpen={isCommentsModalOpen}
                    post={selectedPost}
                    onClose={() => {
                        setIsCommentsModalOpen(false);
                        setSelectedPost(null);
                    }}
                    onAddComment={handleAddComment}
                />
            </div>
        </div>
    );
};

export default BrokersCommunity;
