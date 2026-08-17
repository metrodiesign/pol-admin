const AVATAR_BASE =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar";
const COVER_BASE =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover";

export const userProfile = {
  name: "Jaydon Frankie",
  role: "CTO",
  avatar: `${AVATAR_BASE}/avatar-25.webp`,
  cover: `${COVER_BASE}/cover-4.webp`,
  followers: "1,947",
  following: "9,124",
  about: {
    bio: "Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..",
    country: "United Kingdom",
    email: "ashlynn.ohara62@gmail.com",
    company: "Gleichner, Mueller and Tromp",
    school: "Nikolaus - Leuschke",
    role: "CTO",
  },
  social: {
    facebook: "https://www.facebook.com/frankie",
    instagram: "https://www.instagram.com/frankie",
    linkedin: "https://www.linkedin.com/in/frankie",
    twitter: "https://www.twitter.com/frankie",
  },
};

export interface Post {
  id: string;
  user: { name: string; avatar: string };
  createdAt: string;
  content: string;
  image?: string;
  likes: number;
  likers: string[];
  comments: Comment[];
}

export interface Comment {
  user: { name: string; avatar: string };
  content: string;
  createdAt: string;
}

export const posts: Post[] = [
  {
    id: "1",
    user: { name: "Jaydon Frankie", avatar: `${AVATAR_BASE}/avatar-25.webp` },
    createdAt: "07 Jun 2026",
    content:
      "The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.",
    image: `${COVER_BASE}/cover-3.webp`,
    likes: 20,
    likers: [
      `${AVATAR_BASE}/avatar-1.webp`,
      `${AVATAR_BASE}/avatar-2.webp`,
      `${AVATAR_BASE}/avatar-3.webp`,
    ],
    comments: [
      {
        user: { name: "Lainey Davidson", avatar: `${AVATAR_BASE}/avatar-2.webp` },
        content: "Praesent venenatis metus at",
        createdAt: "07 Jun 2026",
      },
      {
        user: {
          name: "Cristopher Cardenas",
          avatar: `${AVATAR_BASE}/avatar-3.webp`,
        },
        content:
          "Etiam faucibus. Morbi sit arcu. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed lacinia.",
        createdAt: "07 Jun 2026",
      },
    ],
  },
  {
    id: "2",
    user: { name: "Jaydon Frankie", avatar: `${AVATAR_BASE}/avatar-25.webp` },
    createdAt: "06 Jun 2026",
    content: "She eagerly opened the gift, her eyes sparkling with excitement.",
    image: `${COVER_BASE}/cover-4.webp`,
    likes: 26,
    likers: [
      `${AVATAR_BASE}/avatar-4.webp`,
      `${AVATAR_BASE}/avatar-5.webp`,
      `${AVATAR_BASE}/avatar-6.webp`,
    ],
    comments: [
      {
        user: {
          name: "Cristopher Cardenas",
          avatar: `${AVATAR_BASE}/avatar-3.webp`,
        },
        content: "Praesent venenatis metus at",
        createdAt: "06 Jun 2026",
      },
      {
        user: { name: "Melanie Noble", avatar: `${AVATAR_BASE}/avatar-8.webp` },
        content:
          "Etiam faucibus. Morbi sit arcu. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed lacinia.",
        createdAt: "06 Jun 2026",
      },
    ],
  },
  {
    id: "3",
    user: { name: "Jaydon Frankie", avatar: `${AVATAR_BASE}/avatar-25.webp` },
    createdAt: "05 Jun 2026",
    content:
      "The old oak tree stood tall and majestic, its branches swaying gently in the breeze.",
    image: `${COVER_BASE}/cover-2.webp`,
    likes: 34,
    likers: [
      `${AVATAR_BASE}/avatar-7.webp`,
      `${AVATAR_BASE}/avatar-8.webp`,
      `${AVATAR_BASE}/avatar-9.webp`,
    ],
    comments: [],
  },
];

export interface UserCard {
  name: string;
  avatar: string;
  cover: string;
  role: string;
  totalPosts: string;
  totalFollowers: string;
  totalFollowing: string;
}

export const userCards: UserCard[] = [
  {
    name: "Jayvion Simon",
    avatar: `${AVATAR_BASE}/avatar-1.webp`,
    cover: `${COVER_BASE}/cover-1.webp`,
    role: "CEO",
    totalFollowers: "9.91k",
    totalFollowing: "1.95k",
    totalPosts: "9.12k",
  },
  {
    name: "Lucian Obrien",
    avatar: `${AVATAR_BASE}/avatar-2.webp`,
    cover: `${COVER_BASE}/cover-2.webp`,
    role: "CTO",
    totalFollowers: "1.95k",
    totalFollowing: "9.12k",
    totalPosts: "6.98k",
  },
  {
    name: "Deja Brady",
    avatar: `${AVATAR_BASE}/avatar-3.webp`,
    cover: `${COVER_BASE}/cover-3.webp`,
    role: "Project Coordinator",
    totalFollowers: "9.12k",
    totalFollowing: "6.98k",
    totalPosts: "8.49k",
  },
  {
    name: "Harrison Stein",
    avatar: `${AVATAR_BASE}/avatar-4.webp`,
    cover: `${COVER_BASE}/cover-4.webp`,
    role: "Team Leader",
    totalFollowers: "6.98k",
    totalFollowing: "8.49k",
    totalPosts: "2.03k",
  },
  {
    name: "Reece Chung",
    avatar: `${AVATAR_BASE}/avatar-5.webp`,
    cover: `${COVER_BASE}/cover-5.webp`,
    role: "Software Developer",
    totalFollowers: "8.49k",
    totalFollowing: "2.03k",
    totalPosts: "3.36k",
  },
  {
    name: "Lainey Davidson",
    avatar: `${AVATAR_BASE}/avatar-6.webp`,
    cover: `${COVER_BASE}/cover-6.webp`,
    role: "Marketing Strategist",
    totalFollowers: "2.03k",
    totalFollowing: "3.36k",
    totalPosts: "8.4k",
  },
  {
    name: "Cristopher Cardenas",
    avatar: `${AVATAR_BASE}/avatar-7.webp`,
    cover: `${COVER_BASE}/cover-7.webp`,
    role: "Data Analyst",
    totalFollowers: "3.36k",
    totalFollowing: "8.4k",
    totalPosts: "9k",
  },
  {
    name: "Melanie Noble",
    avatar: `${AVATAR_BASE}/avatar-8.webp`,
    cover: `${COVER_BASE}/cover-8.webp`,
    role: "Product Owner",
    totalFollowers: "8.4k",
    totalFollowing: "9k",
    totalPosts: "5.27k",
  },
  {
    name: "Chase Day",
    avatar: `${AVATAR_BASE}/avatar-9.webp`,
    cover: `${COVER_BASE}/cover-9.webp`,
    role: "Graphic Designer",
    totalFollowers: "9k",
    totalFollowing: "5.27k",
    totalPosts: "8.48k",
  },
  {
    name: "Shawn Manning",
    avatar: `${AVATAR_BASE}/avatar-10.webp`,
    cover: `${COVER_BASE}/cover-10.webp`,
    role: "Operations Manager",
    totalFollowers: "5.27k",
    totalFollowing: "8.48k",
    totalPosts: "1.14k",
  },
  {
    name: "Soren Durham",
    avatar: `${AVATAR_BASE}/avatar-11.webp`,
    cover: `${COVER_BASE}/cover-11.webp`,
    role: "Customer Support Specialist",
    totalFollowers: "8.48k",
    totalFollowing: "1.14k",
    totalPosts: "8.06k",
  },
  {
    name: "Cortez Herring",
    avatar: `${AVATAR_BASE}/avatar-12.webp`,
    cover: `${COVER_BASE}/cover-12.webp`,
    role: "Sales Manager",
    totalFollowers: "1.14k",
    totalFollowing: "8.06k",
    totalPosts: "3.04k",
  },
];
