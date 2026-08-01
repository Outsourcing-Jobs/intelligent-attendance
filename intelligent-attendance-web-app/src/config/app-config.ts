import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Ứng dụng của tôi",
  version: packageJson.version,
  copyright: `© ${currentYear}, Ứng dụng của tôi.`,
  meta: {
    title: "Ứng dụng của tôi - Trang Quản Trị Hệ Thống",
    description: "Hệ thống quản trị và trang web cá nhân xây dựng trên Next.js và shadcn/ui.",
  },
};
