import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Hệ Thống Quản Lý Đào Tạo",
  version: packageJson.version,
  copyright: `© ${currentYear}, Hệ Thống Quản Lý Đào Tạo.`,
  meta: {
    title: "Hệ Thống Quản Lý Đào Tạo",
    description: "Hệ thống quản lý đào tạo và điểm danh tự động.",
  },
};
