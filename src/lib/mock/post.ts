import type { Post, PostComment } from "@/types/post";

const COVER_BASE =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover";
const AVATAR_BASE =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar";

export const POSTS: Post[] = [
  {
    id: "1",
    slug: "the-future-of-renewable-energy-innovations-and-challenges-ahead",
    title: "The Future of Renewable Energy: Innovations and Challenges Ahead",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "draft",
    coverUrl: `${COVER_BASE}/cover-1.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-1.webp`,
    authorName: "Jaydon Frankie",
    date: "07 Jun 2026",
    comments: 97,
    views: "1.95k",
    shares: "9.91k",
  },
  {
    id: "2",
    slug: "exploring-the-impact-of-artificial-intelligence-on-modern-healthcare",
    title:
      "Exploring the Impact of Artificial Intelligence on Modern Healthcare",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-2.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-2.webp`,
    authorName: "Lucian Obrien",
    date: "06 Jun 2026",
    comments: 61,
    views: "9.91k",
    shares: "9.12k",
  },
  {
    id: "3",
    slug: "climate-change-and-its-effects-on-global-food-security",
    title: "Climate Change and Its Effects on Global Food Security",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-3.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-3.webp`,
    authorName: "Deja Brady",
    date: "05 Jun 2026",
    comments: 34,
    views: "6.98k",
    shares: "7.14k",
    tags: ["Technology", "Health and Wellness", "Travel", "Finance", "Education"],
    metaTitle: "Minimal UI Kit",
    metaDescription:
      "The starting point for your next project with Minimal UI Kit",
    metaKeywords: ["Sports", "Entertainment", "Business"],
    enableComments: true,
    publish: true,
    content: `<h1>Heading H1</h1>
<h2>Heading H2</h2>
<h3>Heading H3</h3>
<h4>Heading H4</h4>
<h5>Heading H5</h5>
<h6>Heading H6</h6>
<h4>Paragraph</h4>
<p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting.</p>
<p>This is <a href="https://mtaweb.com" target="_blank">MTAweb.com</a> link. It was <strong>popularised</strong> in the <em>1960s</em> with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like <u>Aldus PageMaker</u> including versions of Lorem Ipsum.</p>
<h4>Unordered list</h4>
<ul>
<li><a href="https://www.freecodecamp.org/news/external-links-in-html/">External link - www.freecodecamp.org</a></li>
<li><a href="/">Inside link</a></li>
<li>Normal text</li>
</ul>
<h4>Ordered list</h4>
<ol>
<li>Analysis</li>
<li>Design</li>
<li>Implementation</li>
</ol>
<h4>Blockquote</h4>
<blockquote>Life is short, Smile while you still have teeth!</blockquote>
<h4>Block code</h4>
<pre><code class="language-javascript">for (var i=1; i <= 20; i++) {
  if (i % 15 == 0)
    console.log("FizzBuzz");
  else if (i % 3 == 0)
    console.log("Fizz");
  else if (i % 5 == 0)
    console.log("Buzz");
  else
    console.log(i);
}</code></pre>
<p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>
<h5>Why do we use it?</h5>
<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using "Content here, content here".</p>`,
  },
  {
    id: "4",
    slug: "the-rise-of-remote-work-benefits-challenges-and-future-trends",
    title: "The Rise of Remote Work: Benefits, Challenges, and Future Trends",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-4.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-4.webp`,
    authorName: "Harrison Stein",
    date: "04 Jun 2026",
    comments: 72,
    views: "8.49k",
    shares: "6.21k",
  },
  {
    id: "5",
    slug: "understanding-blockchain-technology-beyond-cryptocurrency",
    title: "Understanding Blockchain Technology: Beyond Cryptocurrency",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "draft",
    coverUrl: `${COVER_BASE}/cover-5.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-5.webp`,
    authorName: "Reece Chung",
    date: "03 Jun 2026",
    comments: 45,
    views: "3.77k",
    shares: "4.56k",
  },
  {
    id: "6",
    slug: "mental-health-in-the-digital-age-navigating-social-media-and-well-being",
    title:
      "Mental Health in the Digital Age: Navigating Social Media and Well-being",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-6.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-6.webp`,
    authorName: "Lainey Davidson",
    date: "02 Jun 2026",
    comments: 28,
    views: "5.33k",
    shares: "2.89k",
  },
  {
    id: "7",
    slug: "sustainable-fashion-how-the-industry-is-going-green",
    title: "Sustainable Fashion: How the Industry is Going Green",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "draft",
    coverUrl: `${COVER_BASE}/cover-7.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-7.webp`,
    authorName: "Cristopher Cardenas",
    date: "01 Jun 2026",
    comments: 19,
    views: "2.41k",
    shares: "1.67k",
  },
  {
    id: "8",
    slug: "space-exploration-new-frontiers-and-the-quest-for-extraterrestrial-life",
    title:
      "Space Exploration: New Frontiers and the Quest for Extraterrestrial Life",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-8.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-8.webp`,
    authorName: "Melanie Noble",
    date: "31 May 2026",
    comments: 53,
    views: "7.62k",
    shares: "5.18k",
  },
  {
    id: "9",
    slug: "the-evolution-of-e-commerce-trends-shaping-the-online-retail-landscape",
    title:
      "The Evolution of E-Commerce: Trends Shaping the Online Retail Landscape",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-9.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-9.webp`,
    authorName: "Chase Day",
    date: "30 May 2026",
    comments: 37,
    views: "4.88k",
    shares: "3.44k",
  },
  {
    id: "10",
    slug: "cybersecurity-in-the-21st-century-protecting-data-in-a-digital-world",
    title:
      "Cybersecurity in the 21st Century: Protecting Data in a Digital World",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "draft",
    coverUrl: `${COVER_BASE}/cover-10.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-10.webp`,
    authorName: "Shawn Manning",
    date: "29 May 2026",
    comments: 64,
    views: "6.15k",
    shares: "4.73k",
  },
  {
    id: "11",
    slug: "the-role-of-big-data-in-transforming-business-strategies",
    title: "The Role of Big Data in Transforming Business Strategies",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-11.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-11.webp`,
    authorName: "Soren Durham",
    date: "28 May 2026",
    comments: 41,
    views: "5.92k",
    shares: "4.01k",
  },
  {
    id: "12",
    slug: "genetic-engineering-ethical-considerations-and-future-prospects",
    title: "Genetic Engineering: Ethical Considerations and Future Prospects",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-12.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-12.webp`,
    authorName: "Cortez Herring",
    date: "27 May 2026",
    comments: 22,
    views: "3.29k",
    shares: "2.14k",
  },
  {
    id: "13",
    slug: "urban-farming-a-solution-to-food-deserts-and-urban-sustainability",
    title: "Urban Farming: A Solution to Food Deserts and Urban Sustainability",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "draft",
    coverUrl: `${COVER_BASE}/cover-13.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-13.webp`,
    authorName: "Brycen Jimenez",
    date: "26 May 2026",
    comments: 58,
    views: "4.47k",
    shares: "3.82k",
  },
  {
    id: "14",
    slug: "the-psychology-of-consumer-behavior-what-drives-our-purchasing-decisions",
    title:
      "The Psychology of Consumer Behavior: What Drives Our Purchasing Decisions?",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-14.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-14.webp`,
    authorName: "Tyrese Reyes",
    date: "25 May 2026",
    comments: 33,
    views: "2.93k",
    shares: "1.88k",
  },
  {
    id: "15",
    slug: "renewable-energy-vs-fossil-fuels-which-is-the-future",
    title: "Renewable Energy vs. Fossil Fuels: Which is the Future?",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-15.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-15.webp`,
    authorName: "Lucian Obrien",
    date: "24 May 2026",
    comments: 49,
    views: "8.11k",
    shares: "6.54k",
  },
  {
    id: "16",
    slug: "artificial-intelligence-in-education-enhancing-learning-experiences",
    title:
      "Artificial Intelligence in Education: Enhancing Learning Experiences",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "draft",
    coverUrl: `${COVER_BASE}/cover-16.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-16.webp`,
    authorName: "Jaydon Frankie",
    date: "23 May 2026",
    comments: 76,
    views: "5.66k",
    shares: "4.29k",
  },
  {
    id: "17",
    slug: "the-impact-of-climate-change-on-global-migration-patterns",
    title: "The Impact of Climate Change on Global Migration Patterns",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-17.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-17.webp`,
    authorName: "Deja Brady",
    date: "22 May 2026",
    comments: 15,
    views: "3.84k",
    shares: "2.37k",
  },
  {
    id: "18",
    slug: "5g-technology-revolutionizing-connectivity-and-communication",
    title: "5G Technology: Revolutionizing Connectivity and Communication",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "published",
    coverUrl: `${COVER_BASE}/cover-18.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-18.webp`,
    authorName: "Harrison Stein",
    date: "21 May 2026",
    comments: 88,
    views: "7.23k",
    shares: "5.91k",
  },
  {
    id: "19",
    slug: "the-gig-economy-opportunities-risks-and-the-future-of-work",
    title: "The Gig Economy: Opportunities, Risks, and the Future of Work",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    status: "draft",
    coverUrl: `${COVER_BASE}/cover-19.webp`,
    authorAvatarUrl: `${AVATAR_BASE}/avatar-19.webp`,
    authorName: "Reece Chung",
    date: "20 May 2026",
    comments: 26,
    views: "1.79k",
    shares: "1.43k",
  },
];

export const POST_DETAILS_SLUG =
  "climate-change-and-its-effects-on-global-food-security";

export const POST_COMMENTS: PostComment[] = [
  {
    id: "c1",
    authorName: "Lucian Obrien",
    authorAvatar: `${AVATAR_BASE}/avatar-2.webp`,
    date: "06 Jun 2026",
    body: "Praesent venenatis metus at tortor pulvinar varius. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.",
    replies: [
      {
        id: "r1",
        authorName: "Deja Brady",
        authorAvatar: `${AVATAR_BASE}/avatar-3.webp`,
        date: "06 Jun 2026",
        body: "Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Nunc nonummy metus.",
        mentionName: "Lucian Obrien",
      },
    ],
  },
  {
    id: "c2",
    authorName: "Jaydon Frankie",
    authorAvatar: `${AVATAR_BASE}/avatar-1.webp`,
    date: "05 Jun 2026",
    body: "Aenean nec eros. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Suspendisse sollicitudin velit sed leo.",
  },
  {
    id: "c3",
    authorName: "Harrison Stein",
    authorAvatar: `${AVATAR_BASE}/avatar-4.webp`,
    date: "04 Jun 2026",
    body: "Nullam varius, turpis molestie dictum semper, est mauris pellentesque nibh, et finibus eros metus non lorem.",
    replies: [
      {
        id: "r2",
        authorName: "Reece Chung",
        authorAvatar: `${AVATAR_BASE}/avatar-5.webp`,
        date: "04 Jun 2026",
        body: "Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus.",
        mentionName: "Harrison Stein",
      },
    ],
  },
  {
    id: "c4",
    authorName: "Lainey Davidson",
    authorAvatar: `${AVATAR_BASE}/avatar-6.webp`,
    date: "03 Jun 2026",
    body: "Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos.",
  },
];

export const FAVORITE_AVATARS = [
  `${AVATAR_BASE}/avatar-7.webp`,
  `${AVATAR_BASE}/avatar-8.webp`,
  `${AVATAR_BASE}/avatar-9.webp`,
];

export const POST_TAGS = [
  "Technology",
  "Health and Wellness",
  "Travel",
  "Finance",
  "Education",
];

export const META_KEYWORDS = ["Sports", "Entertainment", "Business"];
