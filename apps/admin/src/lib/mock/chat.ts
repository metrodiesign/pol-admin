export type MessageType = "text" | "image";
export type SenderType = "me" | "other";

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  role?: string;
  address?: string;
  phone?: string;
  email?: string;
  isGroup?: boolean;
  groupAvatars?: string[];
  lastMessage: string;
  lastMessageIsOwn: boolean;
  lastMessageTime: string;
}

export interface ChatMessage {
  id: string;
  senderId: "me" | string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  body: string;
  imageUrl?: string;
  time: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  datetime: string;
  iconUrl: string;
  isImage: boolean;
  thumbUrl?: string;
}

const R2 = "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets";
const AVA = `${R2}/images/mock/avatar`;

export const CHAT_CONTACTS: ChatContact[] = [
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2",
    name: "Lucian Obrien",
    avatar: `${AVA}/avatar-2.webp`,
    online: true,
    role: "CTO",
    address: "1147 Rohan Drive Suite 819 - Burlington, VT / 82021",
    phone: "+1 416-555-0198",
    email: "ashlynn.ohara62@gmail.com",
    lastMessage: "The waves crashed against the shore, creating a soothing symphony of sound.",
    lastMessageIsOwn: true,
    lastMessageTime: "a minute",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3",
    name: "Deja Brady",
    avatar: `${AVA}/avatar-3.webp`,
    online: false,
    lastMessage: "The scent of blooming flowers wafted through the garden, creating a fragrant paradise.",
    lastMessageIsOwn: true,
    lastMessageTime: "an hour",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4",
    name: "Harrison Stein",
    avatar: `${AVA}/avatar-4.webp`,
    online: false,
    lastMessage: "Sent a photo",
    lastMessageIsOwn: false,
    lastMessageTime: "2 hours",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5",
    name: "Reece Chung",
    avatar: `${AVA}/avatar-5.webp`,
    online: false,
    lastMessage: "She gazed up at the night sky, marveling at the twinkling stars that dotted the darkness.",
    lastMessageIsOwn: false,
    lastMessageTime: "6 minutes",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b6",
    name: "Lainey Davidson",
    avatar: `${AVA}/avatar-6.webp`,
    online: true,
    lastMessage: "The concert was a mesmerizing experience, with the music filling the venue and the crowd cheering in delight.",
    lastMessageIsOwn: false,
    lastMessageTime: "a minute",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b7",
    name: "Cristopher Cardenas",
    avatar: `${AVA}/avatar-7.webp`,
    online: false,
    lastMessage: "The waves crashed against the shore, creating a soothing symphony of sound.",
    lastMessageIsOwn: false,
    lastMessageTime: "an hour",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7bg1",
    name: "Cristopher Cardenas, Melanie Noble, Chase Day, Shawn Manning, Soren Durham",
    avatar: `${AVA}/avatar-7.webp`,
    online: false,
    isGroup: true,
    groupAvatars: [`${AVA}/avatar-7.webp`, `${AVA}/avatar-8.webp`],
    lastMessage: "The delicate butterfly gracefully fluttered from flower to flower, sipping nectar with its slender proboscis.",
    lastMessageIsOwn: false,
    lastMessageTime: "a minute",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b8",
    name: "Melanie Noble",
    avatar: `${AVA}/avatar-8.webp`,
    online: false,
    lastMessage: "The scent of blooming flowers wafted through the garden, creating a fragrant paradise.",
    lastMessageIsOwn: false,
    lastMessageTime: "3 days",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b9",
    name: "Chase Day",
    avatar: `${AVA}/avatar-9.webp`,
    online: false,
    lastMessage: "She gazed up at the night sky, marveling at the twinkling stars that dotted the darkness.",
    lastMessageIsOwn: false,
    lastMessageTime: "8 hours",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b10",
    name: "Shawn Manning",
    avatar: `${AVA}/avatar-10.webp`,
    online: false,
    lastMessage: "The professor delivered a captivating lecture, engaging the students with thought-provoking ideas.",
    lastMessageIsOwn: false,
    lastMessageTime: "3 hours",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7bg2",
    name: "Lucian Obrien, Deja Brady, Harrison Stein, Reece Chung",
    avatar: `${AVA}/avatar-3.webp`,
    online: false,
    isGroup: true,
    groupAvatars: [`${AVA}/avatar-3.webp`, `${AVA}/avatar-2.webp`],
    lastMessage: "The concert was a mesmerizing experience, with the music filling the venue and the crowd cheering in delight.",
    lastMessageIsOwn: false,
    lastMessageTime: "11 minutes",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b11",
    name: "Soren Durham",
    avatar: `${AVA}/avatar-11.webp`,
    online: false,
    lastMessage: "The hiker trekked through the dense forest, guided by the soft glow of sunlight filtering through the trees.",
    lastMessageIsOwn: false,
    lastMessageTime: "10 days",
  },
];

export const LUCIAN_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    senderId: "lucian",
    senderName: "Lucian",
    senderAvatar: `${AVA}/avatar-2.webp`,
    type: "text",
    body: "She eagerly opened the gift, her eyes sparkling with excitement.",
    time: "5 hours",
  },
  {
    id: "m2",
    senderId: "lucian",
    senderName: "Lucian",
    senderAvatar: `${AVA}/avatar-2.webp`,
    type: "text",
    body: "The old oak tree stood tall and majestic, its branches swaying gently in the breeze.",
    time: "4 hours",
  },
  {
    id: "m3",
    senderId: "lucian",
    senderName: "Lucian",
    senderAvatar: `${AVA}/avatar-2.webp`,
    type: "text",
    body: "The aroma of freshly brewed coffee filled the air, awakening my senses.",
    time: "3 hours",
  },
  {
    id: "m4",
    senderId: "lucian",
    senderName: "Lucian",
    senderAvatar: `${AVA}/avatar-2.webp`,
    type: "text",
    body: "The children giggled with joy as they ran through the sprinklers on a hot summer day.",
    time: "2 hours",
  },
  {
    id: "m5",
    senderId: "lucian",
    senderName: "Lucian",
    senderAvatar: `${AVA}/avatar-2.webp`,
    type: "text",
    body: "He carefully crafted a beautiful sculpture out of clay, his hands skillfully shaping the intricate details.",
    time: "an hour",
  },
  {
    id: "m6",
    senderId: "lucian",
    senderName: "Lucian",
    senderAvatar: `${AVA}/avatar-2.webp`,
    type: "image",
    body: "Attachment",
    imageUrl: "/covers/cover-5.webp",
    time: "15 minutes",
  },
  {
    id: "m7",
    senderId: "me",
    senderName: "You",
    senderAvatar: `${R2}/images/mock/avatar/avatar-25.webp`,
    type: "text",
    body: "The concert was a mesmerizing experience, with the music filling the venue and the crowd cheering in delight.",
    time: "a minute",
  },
  {
    id: "m8",
    senderId: "me",
    senderName: "You",
    senderAvatar: `${R2}/images/mock/avatar/avatar-25.webp`,
    type: "text",
    body: "The waves crashed against the shore, creating a soothing symphony of sound.",
    time: "a few seconds",
  },
];

export const LUCIAN_ATTACHMENTS: ChatAttachment[] = [
  {
    id: "a1",
    name: "cover-2.jpg",
    datetime: "07 Jun 2026 11:33 pm",
    isImage: true,
    thumbUrl: "/covers/cover-3.webp",
    iconUrl: "/covers/cover-3.webp",
  },
  {
    id: "a2",
    name: "design-suriname-2015.mp3",
    datetime: "06 Jun 2026 10:33 pm",
    isImage: false,
    iconUrl: `${R2}/icons/files/ic-audio.svg`,
  },
  {
    id: "a3",
    name: "expertise-2015-conakry-sao-tome-and-principe-gender.mp4",
    datetime: "05 Jun 2026 9:33 pm",
    isImage: false,
    iconUrl: `${R2}/icons/files/ic-video.svg`,
  },
  {
    id: "a4",
    name: "money-popup-crack.pdf",
    datetime: "04 Jun 2026 8:33 pm",
    isImage: false,
    iconUrl: `${R2}/icons/files/ic-pdf.svg`,
  },
  {
    id: "a5",
    name: "cover-4.jpg",
    datetime: "03 Jun 2026 7:33 pm",
    isImage: true,
    thumbUrl: "/covers/cover-4.webp",
    iconUrl: "/covers/cover-4.webp",
  },
  {
    id: "a6",
    name: "cover-6.jpg",
    datetime: "02 Jun 2026 6:33 pm",
    isImage: true,
    thumbUrl: "/covers/cover-1.webp",
    iconUrl: "/covers/cover-1.webp",
  },
  {
    id: "a7",
    name: "large-news.txt",
    datetime: "01 Jun 2026 5:33 pm",
    isImage: false,
    iconUrl: `${R2}/icons/files/ic-txt.svg`,
  },
  {
    id: "a8",
    name: "nauru-6015-small-fighter-left-gender.psd",
    datetime: "31 May 2026 4:33 pm",
    isImage: false,
    iconUrl: `${R2}/icons/files/ic-pts.svg`,
  },
  {
    id: "a9",
    name: "tv-xs.doc",
    datetime: "30 May 2026 3:33 pm",
    isImage: false,
    iconUrl: `${R2}/icons/files/ic-word.svg`,
  },
  {
    id: "a10",
    name: "gustavia-entertainment-productivity.docx",
    datetime: "29 May 2026 2:33 pm",
    isImage: false,
    iconUrl: `${R2}/icons/files/ic-word.svg`,
  },
];

export const MY_AVATAR = `${R2}/images/mock/avatar/avatar-25.webp`;
