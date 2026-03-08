export interface LoginFormTypes {
  email: string;
  password: string;
}
export interface RegisterFormTypes {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
}
export interface StudentsInterface {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: boolean;
  role: string;
}
export interface GroupFormData {
  groupName: string;
  student: { value: string };
}
export interface StudentFormData {
  first_name: string;
  phone: number;
}
export interface GroupInterface {
  _id: string;
  name: string;
  students: [];
}
export interface SingleQuizInterface {
  _id: string;
  name: string;
  group: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  participants: number;
}
export interface SingleStudentInterface {
  _id: string;
  first_name: string;
  last_name: string;
  status: string;
  email: string;
}
export interface QuizCreateInterface {
  title: string;
  description: string;
  group: { value: string };
  questions_number: number;
  difficulty: string;
  type: string;
  schadule: string;
  duration: string;
  score_per_question: string;
}

export interface QuizJoinInterface {
  code: string;
}
export interface QuestionsInterface {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  type: string;
  options: { A: string; B: string; C: string; D: string };
  instructor: string;
  answer: string;
}
export interface ResultsInterface {
  quiz: {
    _id: string;
    title: string;
    group: string;
    difficulty: string;
    type: string;
    instructor: string;
    status: string;
    score_per_question: number;
    createdAt: string;
  };
  participants: string[];
}
