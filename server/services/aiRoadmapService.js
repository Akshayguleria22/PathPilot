import axios from "axios";
import { getAiServiceUrl } from "../utils/urlHelper.js";

export const generateRoadmap = async (courseName) => {
    const res = await axios.post(
        `${getAiServiceUrl()}/generate-roadmap`,
        { 
            course_name: courseName,
            user_level: "beginner"
        }
    );
    return res.data;
};
