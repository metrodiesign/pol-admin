const R2 = "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets";

export interface StorageCard {
  name: string;
  icon: string;
  used: string;
  total: string;
  progress: number;
  /** CSS color for the progress bar fill */
  barColor: string;
}

export const storageCards: StorageCard[] = [
  {
    name: "Dropbox",
    icon: `${R2}/icons/apps/ic-app-dropbox.svg`,
    used: "2.24 Gb",
    total: "22.35 Gb",
    progress: 10,
    barColor: "#0061FE",
  },
  {
    name: "Drive",
    icon: `${R2}/icons/apps/ic-app-drive.svg`,
    used: "4.47 Gb",
    total: "22.35 Gb",
    progress: 20,
    barColor: "#00AC47",
  },
  {
    name: "OneDrive",
    icon: `${R2}/icons/apps/ic-app-onedrive.svg`,
    used: "11.18 Gb",
    total: "22.35 Gb",
    progress: 50,
    barColor: "#0078D4",
  },
];

export const dataActivity = {
  categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
  series: [
    { name: "Images", data: [60, 40, 80, 120, 150, 200], color: "#22C55E" },
    { name: "Media", data: [40, 50, 60, 80, 100, 120], color: "#FF5630" },
    { name: "Documents", data: [30, 60, 40, 60, 80, 100], color: "#FFAB00" },
    { name: "Other", data: [20, 30, 20, 40, 50, 60], color: "#919EAB" },
  ],
};

export const storageOverview = {
  used: 22.35,
  total: 44.7,
  percent: 76,
  breakdown: [
    { label: "Images", files: "223 files", size: "11.18 Gb", color: "#22C55E", icon: `${R2}/icons/files/ic-img.svg` },
    { label: "Media", files: "223 files", size: "4.47 Gb", color: "#FF5630", icon: `${R2}/icons/files/ic-audio.svg` },
    { label: "Documents", files: "223 files", size: "4.47 Gb", color: "#FFAB00", icon: `${R2}/icons/files/ic-document.svg` },
    { label: "Other", files: "223 files", size: "2.24 Gb", color: "#919EAB", icon: `${R2}/icons/files/ic-file.svg` },
  ],
};

export interface AvatarItem {
  src: string;
  name: string;
}

export interface FolderItem {
  name: string;
  fileCount: string;
  size: string;
  shared: AvatarItem[];
  overflow: number;
  starred: boolean;
}

export const folders: FolderItem[] = [
  {
    name: "Docs",
    fileCount: "100 files",
    size: "2.24 Gb",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-2.webp`, name: "Lucian Obrien" },
      { src: `${R2}/images/mock/avatar/avatar-1.webp`, name: "Jayvion Simon" },
    ],
    overflow: 3,
    starred: true,
  },
  {
    name: "Projects",
    fileCount: "200 files",
    size: "1.12 Gb",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-7.webp`, name: "Cristopher Cardenas" },
      { src: `${R2}/images/mock/avatar/avatar-6.webp`, name: "Lainey Davidson" },
    ],
    overflow: 2,
    starred: true,
  },
  {
    name: "Work",
    fileCount: "300 files",
    size: "762.94 Mb",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-11.webp`, name: "Soren Durham" },
      { src: `${R2}/images/mock/avatar/avatar-10.webp`, name: "Shawn Manning" },
    ],
    overflow: 0,
    starred: false,
  },
  {
    name: "Training",
    fileCount: "400 files",
    size: "572.2 Mb",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-12.webp`, name: "Cortez Herring" },
    ],
    overflow: 0,
    starred: false,
  },
  {
    name: "Sport",
    fileCount: "500 files",
    size: "457.76 Mb",
    shared: [],
    overflow: 0,
    starred: true,
  },
  {
    name: "Foods",
    fileCount: "600 files",
    size: "381.47 Mb",
    shared: [],
    overflow: 0,
    starred: false,
  },
];

export interface RecentFile {
  name: string;
  size: string;
  type: "jpg" | "png" | "mp3" | "mp4" | "pdf";
  modifiedAt: string;
  shared: AvatarItem[];
  overflow: number;
  starred: boolean;
}

export const recentFiles: RecentFile[] = [
  {
    name: "cover-2.jpg",
    size: "45.78 Mb",
    type: "jpg",
    modifiedAt: "07 Jun 2026 10:23 pm",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-2.webp`, name: "Lucian Obrien" },
      { src: `${R2}/images/mock/avatar/avatar-1.webp`, name: "Jayvion Simon" },
    ],
    overflow: 3,
    starred: true,
  },
  {
    name: "design-suriname-2015.mp3",
    size: "22.89 Mb",
    type: "mp3",
    modifiedAt: "06 Jun 2026 9:23 pm",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-7.webp`, name: "Cristopher Cardenas" },
      { src: `${R2}/images/mock/avatar/avatar-6.webp`, name: "Lainey Davidson" },
    ],
    overflow: 2,
    starred: true,
  },
  {
    name: "expertise-2015-conakry-sao-tome-and-principe-gender.mp4",
    size: "15.26 Mb",
    type: "mp4",
    modifiedAt: "05 Jun 2026 8:23 pm",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-11.webp`, name: "Soren Durham" },
      { src: `${R2}/images/mock/avatar/avatar-10.webp`, name: "Shawn Manning" },
    ],
    overflow: 0,
    starred: false,
  },
  {
    name: "money-popup-crack.pdf",
    size: "11.44 Mb",
    type: "pdf",
    modifiedAt: "04 Jun 2026 7:23 pm",
    shared: [
      { src: `${R2}/images/mock/avatar/avatar-12.webp`, name: "Cortez Herring" },
    ],
    overflow: 0,
    starred: false,
  },
  {
    name: "cover-4.jpg",
    size: "9.16 Mb",
    type: "jpg",
    modifiedAt: "03 Jun 2026 6:23 pm",
    shared: [],
    overflow: 0,
    starred: true,
  },
];

export const UPGRADE_ILLUSTRATION = `${R2}/illustrations/illustration-upgrade.webp`;
