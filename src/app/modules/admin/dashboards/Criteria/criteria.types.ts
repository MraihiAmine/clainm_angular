import { Question } from '../Question/question.types';

export interface Criteria {
    questions: Question[];
    id: number;
    label: string;
    description: string;
    percentage: number;
}
