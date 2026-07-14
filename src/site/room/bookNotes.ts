export type BookNote = {
  id: string;
  title: string;
  author: string;
  date: string;
  source: string;
};

/** 书架第三层的六本真实读书笔记，正文由 docs/readnotes 中的 DOCX 转换而来。 */
export const BOOK_NOTES: BookNote[] = [
  {
    id: "work-consumerism-new-poor",
    title: "工作、消费主义和新穷人",
    author: "齐格蒙特·鲍曼",
    date: "2024.05.23",
    source: "/readnotes/work-consumerism-new-poor.txt"
  },
  {
    id: "steppenwolf",
    title: "荒原狼",
    author: "赫尔曼·黑塞",
    date: "2023.12.31",
    source: "/readnotes/steppenwolf.txt"
  },
  {
    id: "a-swim-in-a-pond-in-the-rain",
    title: "漫步在雨中池塘",
    author: "乔治·桑德斯",
    date: "2025.06.17",
    source: "/readnotes/a-swim-in-a-pond-in-the-rain.txt"
  },
  {
    id: "mrs-dalloway",
    title: "达洛维夫人",
    author: "弗吉尼亚·伍尔夫",
    date: "2024.01.27",
    source: "/readnotes/mrs-dalloway.txt"
  },
  {
    id: "runaway",
    title: "逃离",
    author: "艾丽丝·门罗",
    date: "2024.04.01",
    source: "/readnotes/runaway.txt"
  },
  {
    id: "one-hundred-years",
    title: "一百年，许多人，许多事",
    author: "杨苡 口述 / 余斌 撰写",
    date: "2024.12.02",
    source: "/readnotes/one-hundred-years.txt"
  }
];
