export type PostStatus = "published" | "draft";

export interface PostComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  body: string;
  replies?: PostCommentReply[];
}

export interface PostCommentReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  body: string;
  mentionName?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: PostStatus;
  coverUrl: string;
  authorAvatarUrl: string;
  authorName: string;
  date: string;
  comments: number;
  views: string;
  shares: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  enableComments?: boolean;
  publish?: boolean;
  content?: string;
}
