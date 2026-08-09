import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Hệ Thống Điểm Danh Thông Minh",
  version: packageJson.version,
  copyright: `© ${currentYear}, Hệ Thống Điểm Danh Thông Minh.`,
  meta: {
    title: "Hệ Thống Điểm Danh Thông Minh",
    description: "Hệ thống điểm danh tự động và quản lý học tập thông minh.",
  },
};
