export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  country: string;
  languages: string[];
  specialty: string[];
  rating: number;
  reviewCount: number;
  bio: string;
  experience: string;
  availability: string[];
}

// NOTE: IDs here must match teacher IDs in the database (teachers table)
// Database teachers: 1=Sarah Johnson, 2=James Wilson, 3=Trần Quốc Khải, 4=Emma Thompson, 5=Michael Brown
export const mentors: Mentor[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    country: "Hoa Kỳ",
    languages: ["Tiếng Anh (bản xứ)", "Tiếng Tây Ban Nha"],
    specialty: ["IELTS Speaking", "Business English", "Pronunciation"],
    rating: 4.9,
    reviewCount: 127,
    bio: "Native English speaker from the USA with 5 years of teaching experience in Vietnam.",
    experience: "5 năm giảng dạy",
    availability: ["09:00", "10:00", "14:00", "15:00", "16:00", "20:00", "21:00"]
  },
  {
    id: "2",
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    country: "Vương quốc Anh",
    languages: ["Tiếng Anh (bản xứ)"],
    specialty: ["Conversation", "IELTS", "Grammar"],
    rating: 4.8,
    reviewCount: 89,
    bio: "British English teacher specializing in conversational English and exam preparation.",
    experience: "8 năm giảng dạy",
    availability: ["08:00", "09:00", "10:00", "11:00", "19:00", "20:00"]
  },
  {
    id: "3",
    name: "Trần Quốc Khải",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    country: "Việt Nam",
    languages: ["Tiếng Anh", "Tiếng Việt (bản xứ)"],
    specialty: ["Speaking", "Pronunciation", "Confidence Building"],
    rating: 5.0,
    reviewCount: 156,
    bio: "Giảng viên tiếng Anh với hơn 6 năm kinh nghiệm giảng dạy giao tiếp.",
    experience: "6 năm giảng dạy",
    availability: ["07:00", "08:00", "09:00", "18:00", "19:00", "20:00", "21:00"]
  },
  {
    id: "4",
    name: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    country: "Úc",
    languages: ["Tiếng Anh (bản xứ)"],
    specialty: ["Fluency", "Daily Conversation", "Vocabulary"],
    rating: 4.7,
    reviewCount: 72,
    bio: "Australian English teacher focusing on natural communication and fluency.",
    experience: "5 năm giảng dạy",
    availability: ["10:00", "11:00", "14:00", "15:00", "21:00", "22:00"]
  },
  {
    id: "5",
    name: "Michael Brown",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    country: "Hoa Kỳ",
    languages: ["Tiếng Anh (bản xứ)"],
    specialty: ["Academic English", "Presentation Skills", "Interview Prep"],
    rating: 4.9,
    reviewCount: 203,
    bio: "American English teacher with expertise in academic and professional English.",
    experience: "7 năm giảng dạy",
    availability: ["06:00", "07:00", "08:00", "17:00", "18:00", "19:00"]
  }
];
